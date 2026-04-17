from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import cast, Integer
from typing import List, Optional
import models
import schemas
from database import get_db
from routers.websockets import manager
from models.performer import PerformerStatus

router = APIRouter(
    prefix="/api/performers",
    tags=["performers"]
)


@router.get("/", response_model=List[schemas.PerformerResponse])
def get_performers(
    session_id: Optional[int] = Query(None, description="Filter by session ID"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """
    Get all performers with optional filtering.

    Retrieves a list of performers from the database with support for filtering.

    Args:
        session_id: Filter by exact session ID
        status: Filter by status
        db: Database session (injected)

    Returns:
        List of performers matching the filter criteria
    """
    query = db.query(models.PerformerModel)

    # Apply filters
    if session_id:
        query = query.filter(models.PerformerModel.session_id == session_id)
    if status:
        query = query.filter(models.PerformerModel.status == status)

    performers = query.all()
    return performers


@router.get("/{performer_id}", response_model=schemas.PerformerResponse)
def get_performer(performer_id: int, db: Session = Depends(get_db)):
    """
    Get a single performer by their ID.

    Retrieves a specific performer from the database using their unique identifier.

    Args:
        performer_id: The unique identifier of the performer
        db: Database session (injected)

    Returns:
        The performer with the specified ID

    Raises:
        HTTPException: 404 error if performer is not found
    """
    performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == performer_id
    ).first()

    if not performer:
        raise HTTPException(status_code=404, detail="Performer not found")
    return performer


@router.post("/", response_model=schemas.PerformerResponse)
async def create_performer(performer: schemas.PerformerCreate, db: Session = Depends(get_db)):
    """
    Create a new performer.

    Adds a new performer to the database.

    Args:
        performer: Performer data to create
        db: Database session (injected)

    Returns:
        The newly created performer with their assigned ID

    Raises:
        HTTPException: 400 error if session doesn't exist
    """

    print("call session")
    # Verify session exists and is active
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == performer.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=400, detail="Session not found")

    if session.status != "Active":
        raise HTTPException(status_code=400, detail="Cannot add performers to a completed or paused session")

    print("✅ Frontend reachedcreate_performer endpoint")

    new_performer = models.PerformerModel(
        performer_name=performer.performer_name,
        performer_username=performer.performer_username,
        queue_number=performer.queue_number,
        status=performer.status,
        session_id=performer.session_id,
        performer_type=performer.performer_type
    )

    db.add(new_performer)
    db.commit()
    db.refresh(new_performer)

    # Get admin_id for this session to broadcast the update
    admin_id = session.admin_user_id

    # Broadcast to all connected clients for this admin
    await manager.broadcast(admin_id, {
        "type": "performer_created",
        "data": {
            "performer_id": new_performer.performer_id,
            "performer_name": new_performer.performer_name,
            "session_id": new_performer.session_id
        }
    })

    return new_performer


@router.put("/{performer_id}", response_model=schemas.PerformerResponse)
async def update_performer(
    performer_id: int,
    performer: schemas.PerformerUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing performer.

    Updates one or more fields of an existing performer. Only the fields provided
    in the request will be updated; omitted fields remain unchanged.

    Args:
        performer_id: The unique identifier of the performer to update
        performer: Performer data to update (only include fields to change)
        db: Database session (injected)

    Returns:
        The updated performer with all current field values

    Raises:
        HTTPException: 404 error if performer is not found
    """
    db_performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == performer_id
    ).first()

    if not db_performer:
        raise HTTPException(status_code=404, detail="Performer not found")

    # Verify session is still active
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == db_performer.session_id
    ).first()

    if session and session.status != "Active":
        raise HTTPException(status_code=400, detail="Cannot update performers in a completed or paused session")

    update_data = performer.model_dump(exclude_unset=True)

    # Check if status is being updated
    status_changed = 'status' in update_data
    old_status = db_performer.status
    new_status = update_data.get('status')

    for field, value in update_data.items():
        setattr(db_performer, field, value)

    # Handle cascading song status updates
    if status_changed and new_status:
        song_selections = db.query(models.PerformerSongSelectionModel).filter(
            models.PerformerSongSelectionModel.performer_id == performer_id
        ).all()

        if new_status == PerformerStatus.performing:
            # Mark any other performers in this session who are "performing" as "completed"
            other_performing_performers = db.query(models.PerformerModel).filter(
                models.PerformerModel.session_id == db_performer.session_id,
                models.PerformerModel.performer_id != performer_id,
                models.PerformerModel.status == PerformerStatus.performing
            ).all()

            for other_performer in other_performing_performers:
                other_performer.status = PerformerStatus.completed
                # Mark all their songs as completed (they're done performing)
                other_songs = db.query(models.PerformerSongSelectionModel).filter(
                    models.PerformerSongSelectionModel.performer_id == other_performer.performer_id
                ).all()
                for other_song in other_songs:
                    if other_song.status in [PerformerStatus.waiting, PerformerStatus.performing]:
                        other_song.status = PerformerStatus.completed

            # Set the song with selection_order 1 to performing if not already set
            for song_selection in song_selections:
                if int(song_selection.selection_order) == 1 and song_selection.status == PerformerStatus.waiting:
                    song_selection.status = PerformerStatus.performing
                    break

        elif new_status == PerformerStatus.completed:
            # Mark all waiting or performing songs as completed
            for song_selection in song_selections:
                if song_selection.status in [PerformerStatus.waiting, PerformerStatus.performing]:
                    song_selection.status = PerformerStatus.completed

    db.commit()
    db.refresh(db_performer)

    # Get admin_id for this session to broadcast the update
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == db_performer.session_id
    ).first()

    if session:
        admin_id = session.admin_user_id

        # Broadcast to all connected clients for this admin
        await manager.broadcast(admin_id, {
            "type": "performer_updated",
            "data": {
                "performer_id": db_performer.performer_id,
                "performer_name": db_performer.performer_name,
                "session_id": db_performer.session_id
            }
        })

    return db_performer


@router.delete("/{performer_id}", status_code=204)
def delete_performer(performer_id: int, db: Session = Depends(get_db)):
    """
    Delete a performer.

    Permanently removes a performer from the database.

    Args:
        performer_id: The unique identifier of the performer to delete
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if performer is not found
    """
    performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == performer_id
    ).first()

    if not performer:
        raise HTTPException(status_code=404, detail="Performer not found")

    db.delete(performer)
    db.commit()
    return None
