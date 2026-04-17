from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db
from services.song_list_service import SongListService

router = APIRouter(
    prefix="/api/song-lists",
    tags=["song-lists"]
)


@router.get("/", response_model=List[schemas.SongListResponse])
async def get_song_lists(
    admin_user_id: Optional[int] = Query(None, description="Filter by admin user ID"),
    db: Session = Depends(get_db)
):
    """Get all song lists with optional filtering by admin user."""
    query = db.query(models.SongListModel)

    if admin_user_id:
        query = query.filter(models.SongListModel.admin_user_id == admin_user_id)

    song_lists = query.all()
    return song_lists


@router.get("/{song_list_id}", response_model=schemas.SongListResponse)
async def get_song_list(song_list_id: int, db: Session = Depends(get_db)):
    """Get a single song list by ID."""
    song_list = db.query(models.SongListModel).filter(
        models.SongListModel.song_list_id == song_list_id
    ).first()

    if not song_list:
        raise HTTPException(status_code=404, detail="Song list not found")
    return song_list


@router.post("/", response_model=schemas.SongListResponse)
async def create_song_list(
    song_list: schemas.SongListCreate,
    db: Session = Depends(get_db)
):
    """Create a new song list."""
    # Verify admin user exists
    admin_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == song_list.admin_user_id
    ).first()
    if not admin_user:
        raise HTTPException(status_code=400, detail="Admin user not found")

    new_song_list = models.SongListModel(
        admin_user_id=song_list.admin_user_id,
        list_name=song_list.list_name,
        original_filename=song_list.original_filename
    )

    db.add(new_song_list)
    db.commit()
    db.refresh(new_song_list)
    return new_song_list


@router.put("/{song_list_id}", response_model=schemas.SongListResponse)
async def update_song_list(
    song_list_id: int,
    song_list: schemas.SongListUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing song list."""
    db_song_list = db.query(models.SongListModel).filter(
        models.SongListModel.song_list_id == song_list_id
    ).first()

    if not db_song_list:
        raise HTTPException(status_code=404, detail="Song list not found")

    update_data = song_list.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_song_list, field, value)

    db.commit()
    db.refresh(db_song_list)
    return db_song_list


@router.post("/upload")
async def upload_song_list_csv(
    file: UploadFile = File(...),
    admin_user_id: int = Form(...),
    list_name: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV file to create a song list with items.

    CSV should have 2 columns: Song Title, Artist Name
    - Songs are automatically matched to existing songs in database (case-insensitive)
    - New songs are created if they don't exist
    - Errors are tracked but don't stop the upload process
    """
    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    # Verify admin user exists
    admin_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == admin_user_id
    ).first()
    if not admin_user:
        raise HTTPException(status_code=400, detail="Admin user not found")

    # Process CSV through service
    service = SongListService()
    try:
        results = await service.process_csv_upload(
            file=file,
            admin_user_id=admin_user_id,
            list_name=list_name,
            db=db
        )
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing CSV: {str(e)}")


@router.delete("/{song_list_id}", status_code=204)
async def delete_song_list(song_list_id: int, db: Session = Depends(get_db)):
    """Delete a song list."""
    song_list = db.query(models.SongListModel).filter(
        models.SongListModel.song_list_id == song_list_id
    ).first()

    if not song_list:
        raise HTTPException(status_code=404, detail="Song list not found")

    db.delete(song_list)
    db.commit()
    return None
