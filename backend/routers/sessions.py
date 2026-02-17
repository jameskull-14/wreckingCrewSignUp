from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/sessions",
    tags=["sessions"]
)


@router.get("/", response_model=List[schemas.SessionResponse])
def get_sessions(
    admin_user_id: Optional[int] = Query(None, description="Filter by admin user ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    Get all sessions with optional filtering.

    Retrieves a list of sessions from the database with support for filtering.

    Args:
        admin_user_id: Filter by exact admin user ID
        status: Filter by status
        db: Database session (injected)

    Returns:
        List of sessions matching the filter criteria
    """
    query = db.query(models.SessionModel)

    # Apply filters
    if admin_user_id:
        query = query.filter(models.SessionModel.admin_user_id == admin_user_id)
    if status:
        query = query.filter(models.SessionModel.status == status)

    sessions = query.all()
    return sessions


@router.get("/{session_id}", response_model=schemas.SessionResponse)
def get_session(session_id: int, db: Session = Depends(get_db)):
    """
    Get a single session by its ID.

    Retrieves a specific session from the database using its unique identifier.

    Args:
        session_id: The unique identifier of the session
        db: Database session (injected)

    Returns:
        The session with the specified ID

    Raises:
        HTTPException: 404 error if session is not found
    """
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.post("/", response_model=schemas.SessionResponse)
def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    """
    Create a new session.

    Adds a new session to the database.

    Args:
        session: Session data to create
        db: Database session (injected)

    Returns:
        The newly created session with its assigned ID

    Raises:
        HTTPException: 400 error if admin user doesn't exist
    """
    # Verify admin user exists
    admin_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == session.admin_user_id
    ).first()
    if not admin_user:
        raise HTTPException(status_code=400, detail="Admin user not found")

    new_session = models.SessionModel(
        admin_user_id=session.admin_user_id,
        session_title=session.session_title,
        use_all_songs=session.use_all_songs,
        allow_song_reuse=session.allow_song_reuse,
        session_mode=session.session_mode,
        songs_per_performer=session.songs_per_performer,
        time_start=session.time_start,
        end_time=session.end_time,
        changeover_time=session.changeover_time,
        performance_time=session.performance_time,
        status=session.status
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session


@router.put("/{session_id}", response_model=schemas.SessionResponse)
def update_session(
    session_id: int,
    session: schemas.SessionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing session.

    Updates one or more fields of an existing session. Only the fields provided
    in the request will be updated; omitted fields remain unchanged.

    Args:
        session_id: The unique identifier of the session to update
        session: Session data to update (only include fields to change)
        db: Database session (injected)

    Returns:
        The updated session with all current field values

    Raises:
        HTTPException: 404 error if session is not found
    """
    db_session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_id
    ).first()

    if not db_session:
        raise HTTPException(status_code=404, detail="Session not found")

    update_data = session.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_session, field, value)

    db.commit()
    db.refresh(db_session)
    return db_session


@router.delete("/{session_id}", status_code=204)
def delete_session(session_id: int, db: Session = Depends(get_db)):
    """
    Delete a session.

    Permanently removes a session from the database.

    Args:
        session_id: The unique identifier of the session to delete
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if session is not found
    """
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    db.delete(session)
    db.commit()
    return None
