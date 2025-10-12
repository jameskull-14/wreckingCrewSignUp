from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/songs",
    tags=["songs"]
)

@router.get("/", response_model=List[schemas.SongResponse])
def get_songs(
    sort_by: Optional[str] = Query(None, description="Field to sort by (i.e., 'title', '-title' for desc)"),
    artist: Optional[str] = Query(None, description="Filter by artist"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    db: Session = Depends(get_db)
):
    """Get all songs with optional filtering and sorting"""
    query=db.query(models.Songs)

    #Apply filters
    if artist:
        query = query.filter(models.Song.Artist.ilike(f"%{artist}%"))
    if genre:
        query = query.filter(models.Songs.Genre.ilike(f"%{genre}%"))
    
    #Apply Sorting
    if sort_by:
        if sort_by.startswith('-'):
            #Descending Order
            field = sort_by[1:]
            if field == 'title':
                query = query.order_by(desc(models.Songs.Song))
            elif field == 'artist':
                query = query.order_by(desc(models.Songs.Artist))
            elif field == 'genre':
                query = query.order_by(desc(models.Songs.Genre))
        else:
            #Ascending Order
            if sort_by == 'title':
                query = query.order_by(asc(models.Songs.Song))
            elif sort_by == 'artist':
                query = query.order_by(asc(models.Songs.Song))
            elif sort_by == 'genre':
                query = query.order_by(asc(models.Songs.Song))
    songs = query.all()
    return songs

@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    """Get a single song by Id"""
    song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

@router.post("/", response_model=schemas.SongResponse)
def create_song(song: schemas.SongCreate, db: Session = Depends(get_db)):
    """Create a new song"""
    new_song = models.Songs(
        Song=song.title, #Map 'title' from frontend to 'Song' in DB
        Artist=song.artist,
        Genre=song.genre
    )
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song

@router.post("/bulk", response_model=List[schemas.SongResponse], status_code=201)
def bulk_create_songs(songs: List[schemas.SongCreate], db: Session = Depends(get_db)):
    """Bulk create multiple songs"""
    new_songs = []
    for song in songs:
        new_song = model.Songs(
            Song=song.Title,
            Artist=song.artist,
            Genre=song.genre
        )
        new_songs.append(new_song)
    db.add_all(new_songs)
    db.commit()

    # Refresh all songs to get their Ids
    for song in new_songs:
        db.refresh(song)

    return new_songs

@router.put("/{song_id}", response_model=schemas.SongResponse)
def update_song(song_id: int, song: schemas.SongUpdate, db: Session = Depends(get_db)):
    """Update an existing song"""
    db_song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    update_data = song.model_dump(exclude_unset=True)

    #Map frontend field names to DB field names
    field_mapping = {
        'title': 'Song',
        'artist': 'Artist',
        'genre': 'Genre'
    }

    for field, value in update_data.items():
        db_field = field_mapping.get(field, field)
        setattr(db_song, db_field, value)

    db_commit()
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





# @router.get("/", response_model=List[schemas.SongResponse])
# def get_songs(db: Session = Depends(get_db)):
#     """Get all songs"""
#     songs = db.query(models.Songs).all()
#     return songs


# @router.get("/{song_id}", response_model=schemas.SongResponse)
# def get_song(song_id: int, db: Session = Depends(get_db)):
#     """Get a single song by ID"""
#     song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
#     if not song:
#         raise HTTPException(status_code=404, detail="Song not found")
#     return song


# @router.post("/", response_model=schemas.SongResponse, status_code=201)
# def create_song(song: schemas.SongCreate, db: Session = Depends(get_db)):
#     """Create a new song"""
#     new_song = models.Songs(
#         Song=song.Song,
#         Artist=song.Artist,
#         Genre=song.Genre
#     )
#     db.add(new_song)
#     db.commit()
#     db.refresh(new_song)
#     return new_song


# @router.put("/{song_id}", response_model=schemas.SongResponse)
# def update_song(song_id: int, song: schemas.SongUpdate, db: Session = Depends(get_db)):
#     """Update an existing song"""
#     db_song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
#     if not db_song:
#         raise HTTPException(status_code=404, detail="Song not found")

#     update_data = song.model_dump(exclude_unset=True)
#     for field, value in update_data.items():
#         setattr(db_song, field, value)

#     db.commit()
#     db.refresh(db_song)
#     return db_song


# @router.delete("/{song_id}", status_code=204)
# def delete_song(song_id: int, db: Session = Depends(get_db)):
#     """Delete a song"""
#     song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
#     if not song:
#         raise HTTPException(status_code=404, detail="Song not found")

#     db.delete(song)
#     db.commit()
#     return None
