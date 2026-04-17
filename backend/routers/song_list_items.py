from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/song-list-items",
    tags=["song-list-items"]
)


@router.get("/", response_model=List[schemas.SongListItemResponse])
async def get_song_list_items(
    song_list_id: Optional[int] = Query(None, description="Filter by song list ID"),
    db: Session = Depends(get_db)
):
    """Get all song list items with optional filtering."""
    query = db.query(models.SongListItemModel)

    if song_list_id:
        query = query.filter(models.SongListItemModel.song_list_id == song_list_id)

    items = query.all()
    return items


@router.get("/{item_id}", response_model=schemas.SongListItemResponse)
async def get_song_list_item(item_id: int, db: Session = Depends(get_db)):
    """Get a single song list item by ID."""
    item = db.query(models.SongListItemModel).filter(
        models.SongListItemModel.item_id == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Song list item not found")
    return item


@router.post("/", response_model=schemas.SongListItemResponse)
async def create_song_list_item(
    item: schemas.SongListItemCreate,
    db: Session = Depends(get_db)
):
    """Create a new song list item."""
    # Verify song list exists
    song_list = db.query(models.SongListModel).filter(
        models.SongListModel.song_list_id == item.song_list_id
    ).first()
    if not song_list:
        raise HTTPException(status_code=400, detail="Song list not found")

    # Verify song exists
    song = db.query(models.SongModel).filter(
        models.SongModel.song_id == item.song_id
    ).first()
    if not song:
        raise HTTPException(status_code=400, detail="Song not found")

    new_item = models.SongListItemModel(
        song_list_id=item.song_list_id,
        song_id=item.song_id,
        raw_title=item.raw_title,
        raw_artist=item.raw_artist
    )

    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item


@router.put("/{item_id}", response_model=schemas.SongListItemResponse)
async def update_song_list_item(
    item_id: int,
    item: schemas.SongListItemUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing song list item."""
    db_item = db.query(models.SongListItemModel).filter(
        models.SongListItemModel.item_id == item_id
    ).first()

    if not db_item:
        raise HTTPException(status_code=404, detail="Song list item not found")

    update_data = item.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_item, field, value)

    db.commit()
    db.refresh(db_item)
    return db_item


@router.delete("/{item_id}", status_code=204)
async def delete_song_list_item(item_id: int, db: Session = Depends(get_db)):
    """Delete a song list item."""
    item = db.query(models.SongListItemModel).filter(
        models.SongListItemModel.item_id == item_id
    ).first()

    if not item:
        raise HTTPException(status_code=404, detail="Song list item not found")

    db.delete(item)
    db.commit()
    return None
