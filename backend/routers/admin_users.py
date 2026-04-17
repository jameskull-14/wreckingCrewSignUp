from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from passlib.context import CryptContext
from datetime import datetime
from models.session import SessionMode

router = APIRouter(
    prefix="/api/admin-users",
    tags=["admin-users"]
)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""
    return pwd_context.verify(plain_password, hashed_password)


@router.get("/", response_model=List[schemas.AdminUserResponse])
def get_admin_users(
    email: Optional[str] = Query(None, description="Filter by email"),
    db: Session = Depends(get_db)
):
    """
    Get all admin users with optional filtering.

    Retrieves a list of admin users from the database with support for filtering.

    Args:
        email: Filter by email (exact match)
        db: Database session (injected)

    Returns:
        List of admin users matching the filter criteria
    """
    query = db.query(models.AdminUserModel)

    # Apply filters
    if email:
        query = query.filter(models.AdminUserModel.email == email)

    users = query.all()
    return users


@router.get("/{admin_user_id}", response_model=schemas.AdminUserResponse)
def get_admin_user(admin_user_id: int, db: Session = Depends(get_db)):
    """
    Get a single admin user by their ID.

    Retrieves a specific admin user from the database using their unique identifier.

    Args:
        admin_user_id: The unique identifier of the admin user
        db: Database session (injected)

    Returns:
        The admin user with the specified ID

    Raises:
        HTTPException: 404 error if admin user is not found
    """
    user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == admin_user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return user


@router.post("/", response_model=schemas.AdminUserResponse)
def create_admin_user(user: schemas.AdminUserCreate, db: Session = Depends(get_db)):
    """
    Create a new admin user.

    Adds a new admin user to the database with a hashed password.

    Args:
        user: Admin user data to create (email, password, first_name, last_name)
        db: Database session (injected)

    Returns:
        The newly created admin user with their assigned ID

    Raises:
        HTTPException: 400 error if email already exists
    """
    # Check if email already exists
    existing_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = hash_password(user.password)

    new_user = models.AdminUserModel(
        email=user.email,
        password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default admin settings for the new user
    default_settings = models.AdminUserSettingModel(
        admin_user_id=new_user.admin_user_id,
        session_title="Live Band Karaoke",
        session_host=user.first_name,
        use_all_songs=False,
        allow_song_reuse=False,
        session_mode=SessionMode.Order,
        songs_per_performer=1,
        start_time="19:00",
        end_time="23:00",
        changeover_time="00:05",
        performance_time="00:10",
        allow_instrument_use=False
    )

    db.add(default_settings)
    db.commit()

    return new_user


@router.put("/{admin_user_id}", response_model=schemas.AdminUserResponse)
def update_admin_user(
    admin_user_id: int,
    user: schemas.AdminUserUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing admin user.

    Updates one or more fields of an existing admin user. Only the fields provided
    in the request will be updated; omitted fields remain unchanged.

    Args:
        admin_user_id: The unique identifier of the admin user to update
        user: Admin user data to update (only include fields to change)
        db: Database session (injected)

    Returns:
        The updated admin user with all current field values

    Raises:
        HTTPException: 404 error if admin user is not found
        HTTPException: 400 error if email already exists for another user
    """
    db_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == admin_user_id
    ).first()

    if not db_user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    update_data = user.model_dump(exclude_unset=True)

    # Check if email is being updated and if it already exists
    if "email" in update_data:
        existing_user = db.query(models.AdminUserModel).filter(
            models.AdminUserModel.email == update_data["email"],
            models.AdminUserModel.admin_user_id != admin_user_id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password if it's being updated
    if "password" in update_data:
        update_data["password"] = hash_password(update_data["password"])

    for field, value in update_data.items():
        setattr(db_user, field, value)

    db.commit()
    db.refresh(db_user)
    return db_user


@router.delete("/{admin_user_id}", status_code=204)
def delete_admin_user(admin_user_id: int, db: Session = Depends(get_db)):
    """
    Delete an admin user.

    Permanently removes an admin user from the database.

    Args:
        admin_user_id: The unique identifier of the admin user to delete
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if admin user is not found
    """
    user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == admin_user_id
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="Admin user not found")

    db.delete(user)
    db.commit()
    return None


@router.post("/login", response_model=schemas.AdminUserResponse)
def login_admin_user(credentials: schemas.AdminUserLogin, db: Session = Depends(get_db)):
    """
    Login an admin user.

    Authenticates an admin user using their email and password.

    Args:
        credentials: Login credentials (email and password)
        db: Database session (injected)

    Returns:
        The authenticated admin user data

    Raises:
        HTTPException: 401 error if credentials are invalid
        HTTPException: 403 error if account is locked
    """
    user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.email == credentials.email
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Check if account is locked
    if user.locked_until and user.locked_until > datetime.now():
        raise HTTPException(
            status_code=403,
            detail=f"Account is locked until {user.locked_until}"
        )

    # Verify password
    if not verify_password(credentials.password, user.password):
        # Increment login attempts
        user.login_attempts = (user.login_attempts or 0) + 1

        # Lock account after 5 failed attempts (optional)
        # if user.login_attempts >= 5:
        #     user.locked_until = datetime.now() + timedelta(minutes=30)

        db.commit()
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Reset login attempts and update last login
    user.login_attempts = 0
    user.last_login = datetime.now()
    db.commit()
    db.refresh(user)

    return user
