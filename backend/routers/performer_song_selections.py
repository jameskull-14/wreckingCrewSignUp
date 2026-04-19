from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import asc, desc, cast, Integer
from typing import List, Optional
import models
import schemas
from database import get_db
from routers.websockets import manager
from models.performer import PerformerStatus

router = APIRouter(
    prefix="/api/performer-song-selections",
    tags=["performer-song-selections"]
)


@router.get("", response_model=List[schemas.PerformerSongSelectionResponse])
def get_performer_song_selections(
    performer_id: Optional[str] = Query(None, description="Filter by performer ID"),
    song_id: Optional[str] = Query(None, description="Filter by song ID"),
    selection_order: Optional[str] = Query(None, description="Filter by selection order"),
    status: Optional[str] = Query(None, description="Filter by status"),
    session_id: Optional[str] = Query(None, description="Filter all songs in a session"),
    db: Session = Depends(get_db)
):
    """
    Get all performer song selections with optional filtering.

    Retrieves a list of performer song selections from the database with support
    for multiple filters. All filter parameters are optional.

    Args:
        performer_id: Filter by exact performer ID
        song_id: Filter by exact song ID
        selection_order: Filter by selection order (e.g., 'first', 'second')
        status: Filter by status
        db: Database session (injected)

    Returns:
        List of performer song selections matching the filter criteria
    """
    query = db.query(models.PerformerSongSelectionModel).options(joinedload(models.PerformerSongSelectionModel.song))

    # Apply filters
    if performer_id:
        query = query.filter(models.PerformerSongSelectionModel.performer_id == performer_id)
    if song_id:
        query = query.filter(models.PerformerSongSelectionModel.song_id == song_id)
    if selection_order:
        query = query.filter(models.PerformerSongSelectionModel.selection_order == selection_order)
    if status:
        query = query.filter(models.PerformerSongSelectionModel.status == status)
    if session_id:
        query = query.join(models.PerformerModel).filter(models.PerformerModel.session_id == session_id)

    selections = query.all()

    # Map song data to response
    result = []
    for selection in selections:
        selection_dict = {
            "performer_selection_id": selection.performer_selection_id,
            "performer_id": selection.performer_id,
            "song_id": selection.song_id,
            "selection_order": selection.selection_order,
            "is_singing": selection.is_singing,
            "instrument": selection.instrument,
            "status": selection.status,
            "created_at": selection.created_at,
            "song_title": selection.song.song_title if selection.song else None,
            "artist": selection.song.artist if selection.song else None,
        }
        result.append(selection_dict)

    return result


@router.get("/{selection_id}", response_model=schemas.PerformerSongSelectionResponse)
def get_performer_song_selection(selection_id: int, db: Session = Depends(get_db)):
    """
    Get a single performer song selection by its ID.

    Retrieves a specific performer song selection from the database using its unique identifier.

    Args:
        selection_id: The unique identifier of the performer song selection
        db: Database session (injected)

    Returns:
        The performer song selection with the specified ID

    Raises:
        HTTPException: 404 error if selection is not found
    """
    selection = db.query(models.PerformerSongSelectionModel).filter(
        models.PerformerSongSelectionModel.performer_selection_id == selection_id
    ).first()

    if not selection:
        raise HTTPException(status_code=404, detail="Performer song selection not found")
    return selection


@router.post("", response_model=schemas.PerformerSongSelectionResponse)
async def create_performer_song_selection(
    selection: schemas.PerformerSongSelectionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new performer song selection.

    Adds a new performer song selection to the database with validation for:
    - songs_per_performer limit from admin settings
    - allow_song_reuse constraint from admin settings

    Args:
        selection: Performer song selection data to create
        db: Database session (injected)

    Returns:
        The newly created performer song selection with its assigned ID

    Raises:
        HTTPException: 400 error if performer or song doesn't exist
        HTTPException: 400 error if songs_per_performer limit exceeded
        HTTPException: 400 error if song reuse not allowed and song already selected
    """
    # Verify performer exists and get session info
    performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == selection.performer_id
    ).first()
    if not performer:
        raise HTTPException(status_code=400, detail="Performer not found")

    # Get session and admin info
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == performer.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=400, detail="Session not found")

    if session.status != "Active":
        raise HTTPException(status_code=400, detail="Cannot add songs to a completed or paused session")

    # Get admin settings
    admin_settings = db.query(models.AdminUserSettingModel).filter(
        models.AdminUserSettingModel.admin_user_id == session.admin_user_id
    ).first()

    # Check songs_per_performer limit
    if admin_settings and admin_settings.songs_per_performer:
        existing_selections_count = db.query(models.PerformerSongSelectionModel).filter(
            models.PerformerSongSelectionModel.performer_id == selection.performer_id
        ).count()

        if existing_selections_count >= admin_settings.songs_per_performer:
            raise HTTPException(
                status_code=400,
                detail=f"Performer has already selected the maximum of {admin_settings.songs_per_performer} songs"
            )

    # Verify song exists
    song = db.query(models.SongModel).filter(
        models.SongModel.song_id == selection.song_id
    ).first()
    if not song:
        raise HTTPException(status_code=400, detail="Song not found")

    # Check if song reuse is allowed
    if admin_settings and admin_settings.allow_song_reuse is False:
        # Check if any other performer in this session has already selected this song
        existing_selection = db.query(models.PerformerSongSelectionModel).join(
            models.PerformerModel
        ).filter(
            models.PerformerModel.session_id == session.session_id,
            models.PerformerSongSelectionModel.song_id == selection.song_id,
            models.PerformerSongSelectionModel.performer_id != selection.performer_id
        ).first()

        if existing_selection:
            raise HTTPException(
                status_code=400,
                detail=f"Song '{song.song_title}' has already been selected by another performer. Song reuse is not allowed for this session."
            )

    new_selection = models.PerformerSongSelectionModel(
        performer_id=selection.performer_id,
        song_id=selection.song_id,
        selection_order=selection.selection_order,
        is_singing=selection.is_singing,
        instrument=selection.instrument,
        status=selection.status
    )

    db.add(new_selection)
    db.commit()
    db.refresh(new_selection)

    # Broadcast song selection created to all connected clients
    await manager.broadcast(session.admin_user_id, {
        "type": "song_selection_created",
        "data": {
            "performer_id": new_selection.performer_id,
            "selection_id": new_selection.performer_selection_id,
            "song_id": new_selection.song_id,
            "selection_order": new_selection.selection_order
        }
    })

    return new_selection


@router.put("/{selection_id}", response_model=schemas.PerformerSongSelectionResponse)
async def update_performer_song_selection(
    selection_id: int,
    selection: schemas.PerformerSongSelectionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing performer song selection.

    Updates one or more fields of an existing performer song selection. Only the
    fields provided in the request will be updated; omitted fields remain unchanged.

    If status is changed to "performing", automatically marks all previous songs as "completed".

    Args:
        selection_id: The unique identifier of the selection to update
        selection: Selection data to update (only include fields to change)
        db: Database session (injected)

    Returns:
        The updated performer song selection with all current field values

    Raises:
        HTTPException: 404 error if selection is not found
    """
    db_selection = db.query(models.PerformerSongSelectionModel).filter(
        models.PerformerSongSelectionModel.performer_selection_id == selection_id
    ).first()

    if not db_selection:
        raise HTTPException(status_code=404, detail="Performer song selection not found")

    # Verify session is still active
    performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == db_selection.performer_id
    ).first()

    if performer:
        session = db.query(models.SessionModel).filter(
            models.SessionModel.session_id == performer.session_id
        ).first()

        if session and session.status != "Active":
            raise HTTPException(status_code=400, detail="Cannot update songs in a completed or paused session")

    update_data = selection.model_dump(exclude_unset=True)

    # Check if status is being changed to "performing"
    if 'status' in update_data and update_data['status'] == PerformerStatus.performing:
        # Get all song selections for this performer, ordered by selection_order
        all_selections = db.query(models.PerformerSongSelectionModel).filter(
            models.PerformerSongSelectionModel.performer_id == db_selection.performer_id
        ).order_by(cast(models.PerformerSongSelectionModel.selection_order, Integer)).all()

        # Mark all songs before this one as completed
        current_order = int(db_selection.selection_order)
        for song_sel in all_selections:
            song_order = int(song_sel.selection_order)
            if song_order < current_order and song_sel.status != PerformerStatus.completed:
                song_sel.status = PerformerStatus.completed

    for field, value in update_data.items():
        setattr(db_selection, field, value)

    db.commit()
    db.refresh(db_selection)

    # Broadcast update
    performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == db_selection.performer_id
    ).first()

    if performer:
        session = db.query(models.SessionModel).filter(
            models.SessionModel.session_id == performer.session_id
        ).first()

        if session:
            await manager.broadcast(session.admin_user_id, {
                "type": "song_selection_updated",
                "data": {
                    "performer_id": db_selection.performer_id,
                    "selection_id": db_selection.performer_selection_id
                }
            })

    return db_selection


@router.delete("/{selection_id}", status_code=204)
def delete_performer_song_selection(selection_id: int, db: Session = Depends(get_db)):
    """
    Delete a performer song selection.

    Permanently removes a performer song selection from the database.

    Args:
        selection_id: The unique identifier of the selection to delete
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if selection is not found
    """
    selection = db.query(models.PerformerSongSelectionModel).filter(
        models.PerformerSongSelectionModel.performer_selection_id == selection_id
    ).first()

    if not selection:
        raise HTTPException(status_code=404, detail="Performer song selection not found")

    db.delete(selection)
    db.commit()
    return None
