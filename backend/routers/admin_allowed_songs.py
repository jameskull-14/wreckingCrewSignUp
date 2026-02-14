from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/admin-allowed-songs",
    tags=["admin-allowed-songs"]
)


@router.get("/", response_model=List[schemas.AdminAllowedSongResponse])
def get_admin_allowed_songs(
    admin_user_id: Optional[int] = Query(None, description="Filter by admin user ID"),
    song_id: Optional[int] = Query(None, description="Filter by song ID"),
    db: Session = Depends(get_db)
):
    """
    Get all admin allowed songs with optional filtering.

    Retrieves a list of admin-song associations from the database with support
    for filtering by admin user or song. All filter parameters are optional.

    Args:
        admin_user_id: Filter by exact admin user ID
        song_id: Filter by exact song ID
        db: Database session (injected)

    Returns:
        List of admin allowed songs matching the filter criteria
    """
    query = db.query(models.AdminAllowedSongModel)

    # Apply filters
    if admin_user_id:
        query = query.filter(models.AdminAllowedSongModel.admin_user_id == admin_user_id)
    if song_id:
        query = query.filter(models.AdminAllowedSongModel.song_id == song_id)

    allowed_songs = query.all()
    return allowed_songs


@router.post("/", response_model=schemas.AdminAllowedSongResponse)
def create_admin_allowed_song(
    allowed_song: schemas.AdminAllowedSongCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new admin allowed song association.

    Adds a new admin-song association to the database.

    Args:
        allowed_song: Admin allowed song data to create
        db: Database session (injected)

    Returns:
        The newly created admin allowed song association

    Raises:
        HTTPException: 400 error if admin user or song doesn't exist
        HTTPException: 400 error if association already exists
    """
    # Verify admin user exists
    admin_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == allowed_song.admin_user_id
    ).first()
    if not admin_user:
        raise HTTPException(status_code=400, detail="Admin user not found")

    # Verify song exists
    song = db.query(models.SongModel).filter(
        models.SongModel.song_id == allowed_song.song_id
    ).first()
    if not song:
        raise HTTPException(status_code=400, detail="Song not found")

    # Check if association already exists
    existing = db.query(models.AdminAllowedSongModel).filter(
        models.AdminAllowedSongModel.admin_user_id == allowed_song.admin_user_id,
        models.AdminAllowedSongModel.song_id == allowed_song.song_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This admin-song association already exists")

    new_allowed_song = models.AdminAllowedSongModel(
        admin_user_id=allowed_song.admin_user_id,
        song_id=allowed_song.song_id
    )

    db.add(new_allowed_song)
    db.commit()
    db.refresh(new_allowed_song)
    return new_allowed_song


@router.delete("/{admin_user_id}/{song_id}", status_code=204)
def delete_admin_allowed_song(
    admin_user_id: int,
    song_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete an admin allowed song association.

    Permanently removes an admin-song association from the database.

    Args:
        admin_user_id: The admin user ID
        song_id: The song ID
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if association is not found
    """
    allowed_song = db.query(models.AdminAllowedSongModel).filter(
        models.AdminAllowedSongModel.admin_user_id == admin_user_id,
        models.AdminAllowedSongModel.song_id == song_id
    ).first()

    if not allowed_song:
        raise HTTPException(status_code=404, detail="Admin allowed song association not found")

    db.delete(allowed_song)
    db.commit()
    return None
