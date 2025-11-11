from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
import models
import schemas
from database import get_db

# define the api's route
router = APIRouter(
    prefix="/api/songs",
    tags=["songs"]
)

#-----------------------------------------
# returns all songs with filters
@router.get("/", response_model=List[schemas.SongResponse])
def get_songs(
    sort_by: Optional[str] = Query(None, description="Field to sort by (i.e., 'title', '-title' for desc)"),
    artist: Optional[str] = Query(None, description="Filter by artist"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    db: Session = Depends(get_db)
):
    """Get all songs with optional filtering and sorting"""

    # query all the songs
    query=db.query(models.Songs)

    #Apply filters
    if artist:
        query = query.filter(models.Songs.Artist.ilike(f"%{artist}%"))
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
                query = query.order_by(asc(models.Songs.Artist))
            elif sort_by == 'genre':
                query = query.order_by(asc(models.Songs.Genre))
    songs = query.all()
    return songs
#-----------------------------------------

#-----------------------------------------
# returns a specific song based off its id
@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    """Get a single song by Id"""

    # query the Songs table based off the id
    song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    # throw an error if the song id doesnt exist
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song
#-----------------------------------------

#-----------------------------------------
# Create a new song (user side)
@router.post("/", response_model=schemas.SongResponse)
def create_song(song: schemas.SongCreate, db: Session = Depends(get_db)):
    """Create a new song"""

    # define the new song object
    new_song = models.Songs(
        Song=song.title, #Map 'title' from frontend to 'Song' in DB
        Artist=song.artist,
        Genre=song.genre
    )

    # add song to table
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song
#-----------------------------------------

#-----------------------------------------
# bulk inserts new songs (user side)
@router.post("/bulk", response_model=List[schemas.SongResponse], status_code=201)
def bulk_create_songs(songs: List[schemas.SongCreate], db: Session = Depends(get_db)):
    """Bulk create multiple songs"""

    #initialize our new songs list
    new_songs = []
    #loop through the incoming songs and add them to our list
    for song in songs:
        new_song = models.Songs(
            Song=song.title,
            Artist=song.artist,
            Genre=song.genre
        )
        new_songs.append(new_song)

    # insert the list into the Songs table
    db.add_all(new_songs)
    db.commit()

    # Refresh all songs to get their Ids
    for song in new_songs:
        db.refresh(song)

    return new_songs
#-----------------------------------------

#-----------------------------------------
# Update a songs settings
@router.put("/{song_id}", response_model=schemas.SongResponse)
def update_song(song_id: int, song: schemas.SongUpdate, db: Session = Depends(get_db)):
    """Update an existing song"""

    # query the Songs table for a specific song Id
    db_song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    # throw an error if the song id doesnt exist
    if not db_song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    # parse out the song info
    update_data = song.model_dump(exclude_unset=True)

    # Map frontend field names to DB field names
    field_mapping = {
        'title': 'Song',
        'artist': 'Artist',
        'genre': 'Genre'
    }

    # loop through the list of songs and set them to their objects
    for field, value in update_data.items():
        db_field = field_mapping.get(field, field)
        setattr(db_song, db_field, value)

    # commit update
    db.commit()
    db.refresh(db_song)
    return db_song
#-----------------------------------------

#-----------------------------------------
# delete a specific song by its Id
@router.delete("/{song_id}", status_code=204)
def delete_song(song_id: int, db: Session = Depends(get_db)):
    """Delete a song"""

    # query the database for the song to be deleted
    song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()

    # throw an error if the song doesnt exist
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    # delete the song
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
