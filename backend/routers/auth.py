"""
Authentication endpoints for login and registration.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Dict, Any

from database import get_db
import models
import schemas
from utils.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15


@router.post("/register", response_model=schemas.AdminUserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.AdminUserCreate, db: Session = Depends(get_db)):
    """
    Register a new admin user.

    Args:
        user_data: Admin user creation data including email and password
        db: Database session

    Returns:
        Created admin user (without password)

    Raises:
        HTTPException: If email already exists or validation fails
    """
    # Check if email already exists
    existing_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.email == user_data.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash the password
    hashed_password = hash_password(user_data.password)

    # Create new admin user
    new_user = models.AdminUserModel(
        email=user_data.email,
        password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        login_attempts=0
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
def login(credentials: schemas.AdminUserLogin, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """
    Authenticate admin user and return JWT token.

    Args:
        credentials: Email and password
        db: Database session

    Returns:
        Dict with access_token and user info

    Raises:
        HTTPException: If credentials are invalid or account is locked
    """
    # Find user by email
    user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.email == credentials.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Check if account is locked
    if user.locked_until:
        if datetime.now(timezone.utc) < user.locked_until.replace(tzinfo=timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked due to too many failed login attempts. Try again after {user.locked_until.strftime('%Y-%m-%d %H:%M:%S UTC')}"
            )
        else:
            # Unlock account if lockout period has passed
            user.locked_until = None
            user.login_attempts = 0
            db.commit()

    # Verify password
    if not verify_password(credentials.password, user.password):
        # Increment login attempts
        user.login_attempts += 1

        # Lock account if max attempts reached
        if user.login_attempts >= MAX_LOGIN_ATTEMPTS:
            user.locked_until = datetime.now(timezone.utc) + timedelta(minutes=LOCKOUT_MINUTES)
            db.commit()
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account locked due to too many failed login attempts. Try again in {LOCKOUT_MINUTES} minutes."
            )

        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    # Reset login attempts on successful login
    user.login_attempts = 0
    user.last_login = datetime.now(timezone.utc)
    user.locked_until = None
    db.commit()

    # Create JWT token
    access_token = create_access_token(
        data={
            "sub": str(user.admin_user_id),
            "email": user.email
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "admin_user_id": user.admin_user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name
        }
    }


@router.post("/verify")
def verify_token(token_data: schemas.TokenVerify) -> Dict[str, Any]:
    """
    Verify a JWT token and return user info.

    Args:
        token_data: Request body containing JWT access token

    Returns:
        Token payload with user info

    Raises:
        HTTPException: If token is invalid or expired
    """
    from utils.auth import decode_access_token

    payload = decode_access_token(token_data.token)
    return payload
