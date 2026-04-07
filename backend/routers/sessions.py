from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
import models
import schemas
from database import get_db
from routers.websockets import manager

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
    Get all sessions with optional filtering, including song counts.

    Retrieves a list of sessions from the database with support for filtering.

    Args:
        admin_user_id: Filter by exact admin user ID
        status: Filter by status
        db: Database session (injected)

    Returns:
        List of sessions matching the filter criteria with song counts
    """
    # Subquery to count performed songs per session (songs selected by performers)
    song_count_subquery = (
        db.query(
            models.PerformerModel.session_id,
            func.count(models.PerformerSongSelectionModel.performer_selection_id).label('song_count')
        )
        .join(
            models.PerformerSongSelectionModel,
            models.PerformerModel.performer_id == models.PerformerSongSelectionModel.performer_id
        )
        .group_by(models.PerformerModel.session_id)
        .subquery()
    )

    # Subquery to count performers per session
    performer_count_subquery = (
        db.query(
            models.PerformerModel.session_id,
            func.count(models.PerformerModel.performer_id).label('performer_count')
        )
        .group_by(models.PerformerModel.session_id)
        .subquery()
    )

    # Subquery to count total songs in session (from session_song table)
    total_session_songs_subquery = (
        db.query(
            models.SessionSongModel.session_id,
            func.count(models.SessionSongModel.song_id).label('total_session_songs')
        )
        .group_by(models.SessionSongModel.session_id)
        .subquery()
    )

    # Main query with left joins to include song counts and performer counts
    query = db.query(
        models.SessionModel,
        func.coalesce(song_count_subquery.c.song_count, 0).label('song_count'),
        func.coalesce(performer_count_subquery.c.performer_count, 0).label('performer_count'),
        func.coalesce(total_session_songs_subquery.c.total_session_songs, 0).label('total_session_songs')
    ).outerjoin(
        song_count_subquery,
        models.SessionModel.session_id == song_count_subquery.c.session_id
    ).outerjoin(
        performer_count_subquery,
        models.SessionModel.session_id == performer_count_subquery.c.session_id
    ).outerjoin(
        total_session_songs_subquery,
        models.SessionModel.session_id == total_session_songs_subquery.c.session_id
    )

    # Apply filters
    if admin_user_id:
        query = query.filter(models.SessionModel.admin_user_id == admin_user_id)
    if status:
        query = query.filter(models.SessionModel.status == status)

    results = query.all()

    # Convert to response format
    sessions = []
    for session, song_count, performer_count, total_session_songs in results:
        session_dict = session.__dict__.copy()
        session_dict['song_count'] = song_count
        session_dict['performer_count'] = performer_count
        session_dict['total_session_songs'] = total_session_songs
        sessions.append(session_dict)

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


@router.get("/{session_id}/info")
def get_session_info(session_id: int, db: Session = Depends(get_db)):
    """
    Get session information including admin settings and selected songs.

    Returns session details, admin settings (songs_per_performer, allow_song_reuse),
    and list of song IDs that have already been selected by performers in this session.

    Args:
        session_id: The unique identifier of the session
        db: Database session (injected)

    Returns:
        Dictionary with session info, settings, and selected_song_ids

    Raises:
        HTTPException: 404 error if session is not found
    """
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get admin settings
    admin_settings = db.query(models.AdminUserSettingModel).filter(
        models.AdminUserSettingModel.admin_user_id == session.admin_user_id
    ).first()

    # Get all song IDs that have been selected by performers in this session
    selected_songs = db.query(models.PerformerSongSelectionModel.song_id).join(
        models.PerformerModel
    ).filter(
        models.PerformerModel.session_id == session_id
    ).distinct().all()

    selected_song_ids = [song_id for (song_id,) in selected_songs]

    return {
        "session_id": session.session_id,
        "session_title": session.session_title,
        "admin_user_id": session.admin_user_id,
        "songs_per_performer": admin_settings.songs_per_performer if admin_settings else None,
        "allow_song_reuse": admin_settings.allow_song_reuse if admin_settings else True,
        "selected_song_ids": selected_song_ids
    }


@router.post("/", response_model=schemas.SessionResponse)
async def create_session(session: schemas.SessionCreate, db: Session = Depends(get_db)):
    """
    Create a new session.

    Adds a new session to the database and broadcasts to all connected clients.
    Also copies all songs from admin_allowed_song to session_song and clears admin_allowed_song.

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
        start_time=session.start_time,
        end_time=session.end_time,
        changeover_time=session.changeover_time,
        performance_time=session.performance_time,
        status=session.status
    )

    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    # Copy songs from admin_allowed_song to session_song
    allowed_songs = db.query(models.AdminAllowedSongModel).filter(
        models.AdminAllowedSongModel.admin_user_id == session.admin_user_id
    ).all()

    print(f"\n{'='*60}")
    print(f"CREATING SESSION {new_session.session_id}")
    print(f"{'='*60}")
    print(f"Admin user ID: {session.admin_user_id}")
    print(f"Found {len(allowed_songs)} songs in admin_allowed_song to copy")

    songs_copied = 0
    for allowed_song in allowed_songs:
        # Check if song already exists in session (avoid duplicates)
        existing = db.query(models.SessionSongModel).filter(
            models.SessionSongModel.session_id == new_session.session_id,
            models.SessionSongModel.song_id == allowed_song.song_id
        ).first()

        if not existing:
            session_song = models.SessionSongModel(
                session_id=new_session.session_id,
                song_id=allowed_song.song_id
            )
            db.add(session_song)
            songs_copied += 1
            print(f"  ✓ Copying song_id {allowed_song.song_id} to session {new_session.session_id}")
        else:
            print(f"  ⊘ song_id {allowed_song.song_id} already exists in session, skipping")

    print(f"\nTotal songs copied: {songs_copied}")

    # Clear admin_allowed_song for this admin
    deleted_count = db.query(models.AdminAllowedSongModel).filter(
        models.AdminAllowedSongModel.admin_user_id == session.admin_user_id
    ).delete()

    print(f"Deleted {deleted_count} songs from admin_allowed_song for admin {session.admin_user_id}")

    db.commit()
    print(f"✓ Session {new_session.session_id} committed successfully")

    # Verify songs were actually copied
    verify_count = db.query(models.SessionSongModel).filter(
        models.SessionSongModel.session_id == new_session.session_id
    ).count()
    print(f"Verification: {verify_count} songs now in session_song for session {new_session.session_id}")
    print(f"{'='*60}\n")

    # Broadcast session started event to all connected clients (non-blocking)
    try:
        await manager.broadcast(
            new_session.admin_user_id,
            {
                "type": "session_started",
                "data": schemas.SessionResponse.model_validate(new_session).model_dump()
            }
        )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"WebSocket broadcast error: {e}")

    return new_session


@router.put("/{session_id}", response_model=schemas.SessionResponse)
async def update_session(
    session_id: int,
    session: schemas.SessionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing session.

    Updates one or more fields of an existing session. Only the fields provided
    in the request will be updated; omitted fields remain unchanged.

    Broadcasts the updated session to all connected clients.

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

    # Broadcast session updated event (non-blocking, errors won't crash the endpoint)
    try:
        await manager.broadcast(
            db_session.admin_user_id,
            {
                "type": "session_updated",
                "data": schemas.SessionResponse.model_validate(db_session).model_dump()
            }
        )

        # If session ended, also broadcast session_ended event
        if db_session.status in ["Completed", "Ended", "Inactive"]:
            await manager.broadcast(
                db_session.admin_user_id,
                {
                    "type": "session_ended",
                    "data": {"session_id": session_id}
                }
            )
    except Exception as e:
        # Log the error but don't fail the request
        print(f"WebSocket broadcast error: {e}")

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


@router.post("/{session_id}/generate-time-slots")
def generate_time_slots(session_id: int, db: Session = Depends(get_db)):
    """
    Generate time slot performers for a session in Time mode.

    Creates empty performer placeholders for each time slot based on the session's
    start_time, end_time, performance_time, and changeover_time.

    Args:
        session_id: The unique identifier of the session
        db: Database session (injected)

    Returns:
        Dictionary with count of generated slots and list of time slots

    Raises:
        HTTPException: 404 error if session is not found
        HTTPException: 400 error if session is not in Time mode
    """
    from datetime import datetime, timedelta
    from models.performer import PerformerStatus, PerformerType

    # Get session
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session.session_mode != 'Time':
        raise HTTPException(status_code=400, detail="Session must be in Time mode to generate time slots")

    # Delete existing empty time slot performers (those without a performer_name)
    db.query(models.PerformerModel).filter(
        models.PerformerModel.session_id == session_id,
        models.PerformerModel.performer_name == ""
    ).delete()

    # Parse times
    start_time_parts = session.start_time.split(':')
    end_time_parts = session.end_time.split(':')
    performance_parts = session.performance_time.split(':')
    changeover_parts = session.changeover_time.split(':')

    start_hour, start_minute = int(start_time_parts[0]), int(start_time_parts[1])
    end_hour, end_minute = int(end_time_parts[0]), int(end_time_parts[1])
    performance_hours, performance_minutes = int(performance_parts[0]), int(performance_parts[1])
    changeover_hours, changeover_minutes = int(changeover_parts[0]), int(changeover_parts[1])

    # Create datetime objects for easier calculation
    base_date = datetime(2000, 1, 1)
    current_time = base_date.replace(hour=start_hour, minute=start_minute)
    end_datetime = base_date.replace(hour=end_hour, minute=end_minute)

    # Handle case where end time is next day (e.g., midnight or later)
    if end_datetime <= current_time:
        end_datetime += timedelta(days=1)

    performance_duration = timedelta(hours=performance_hours, minutes=performance_minutes)
    changeover_duration = timedelta(hours=changeover_hours, minutes=changeover_minutes)
    total_slot_duration = performance_duration + changeover_duration

    generated_slots = []
    queue_number = 1

    while current_time + performance_duration <= end_datetime:
        slot_start = current_time
        slot_end = current_time + performance_duration

        # Create time slot performer
        time_slot_performer = models.PerformerModel(
            session_id=session_id,
            performer_name="",  # Empty - waiting to be claimed
            performer_username="Guest",
            queue_number=queue_number,
            status=PerformerStatus.waiting,
            performer_type=PerformerType.individual,
            time_slot_start=slot_start.strftime("%H:%M"),
            time_slot_end=slot_end.strftime("%H:%M")
        )

        db.add(time_slot_performer)
        generated_slots.append({
            "queue_number": queue_number,
            "time_slot_start": slot_start.strftime("%H:%M"),
            "time_slot_end": slot_end.strftime("%H:%M")
        })

        # Move to next slot
        current_time += total_slot_duration
        queue_number += 1

    db.commit()

    return {
        "generated_count": len(generated_slots),
        "slots": generated_slots
    }
