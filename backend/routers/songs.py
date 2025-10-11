from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/songs",
    tags=["songs"]
)


@router.get("/", response_model=List[schemas.SongResponse])
def get_songs(db: Session = Depends(get_db)):
    """Get all songs"""
    songs = db.query(models.Songs).all()
    return songs


@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    """Get a single song by ID"""
    song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.post("/", response_model=schemas.SongResponse, status_code=201)
def create_song(song: schemas.SongCreate, db: Session = Depends(get_db)):
    """Create a new song"""
    new_song = models.Songs(
        Song=song.Song,
        Artist=song.Artist,
        Genre=song.Genre
    )
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song


@router.put("/{song_id}", response_model=schemas.SongResponse)
def update_song(song_id: int, song: schemas.SongUpdate, db: Session = Depends(get_db)):
    """Update an existing song"""
    db_song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")

    update_data = song.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_song, field, value)

    db.commit()
    db.refresh(db_song)
    return db_song


@router.delete("/{song_id}", status_code=204)
def delete_song(song_id: int, db: Session = Depends(get_db)):
    """Delete a song"""
    song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    db.delete(song)
    db.commit()
    return None
