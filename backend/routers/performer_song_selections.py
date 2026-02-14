from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/performer-song-selections",
    tags=["performer-song-selections"]
)


@router.get("/", response_model=List[schemas.PerformerSongSelectionResponse])
def get_performer_song_selections(
    performer_id: Optional[int] = Query(None, description="Filter by performer ID"),
    song_id: Optional[int] = Query(None, description="Filter by song ID"),
    selection_order: Optional[str] = Query(None, description="Filter by selection order"),
    status: Optional[str] = Query(None, description="Filter by status"),
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
    query = db.query(models.PerformerSongSelectionModel)

    # Apply filters
    if performer_id:
        query = query.filter(models.PerformerSongSelectionModel.performer_id == performer_id)
    if song_id:
        query = query.filter(models.PerformerSongSelectionModel.song_id == song_id)
    if selection_order:
        query = query.filter(models.PerformerSongSelectionModel.selection_order == selection_order)
    if status:
        query = query.filter(models.PerformerSongSelectionModel.status == status)

    selections = query.all()
    return selections


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


@router.post("/", response_model=schemas.PerformerSongSelectionResponse)
def create_performer_song_selection(
    selection: schemas.PerformerSongSelectionCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new performer song selection.

    Adds a new performer song selection to the database.

    Args:
        selection: Performer song selection data to create
        db: Database session (injected)

    Returns:
        The newly created performer song selection with its assigned ID

    Raises:
        HTTPException: 400 error if performer or song doesn't exist
    """
    # Verify performer exists
    performer = db.query(models.PerformerModel).filter(
        models.PerformerModel.performer_id == selection.performer_id
    ).first()
    if not performer:
        raise HTTPException(status_code=400, detail="Performer not found")

    # Verify song exists
    song = db.query(models.SongModel).filter(
        models.SongModel.song_id == selection.song_id
    ).first()
    if not song:
        raise HTTPException(status_code=400, detail="Song not found")

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
    return new_selection


@router.put("/{selection_id}", response_model=schemas.PerformerSongSelectionResponse)
def update_performer_song_selection(
    selection_id: int,
    selection: schemas.PerformerSongSelectionUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing performer song selection.

    Updates one or more fields of an existing performer song selection. Only the
    fields provided in the request will be updated; omitted fields remain unchanged.

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

    update_data = selection.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_selection, field, value)

    db.commit()
    db.refresh(db_selection)
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
