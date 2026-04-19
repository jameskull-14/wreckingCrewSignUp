from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
import models
import schemas
from database import get_db
from services.SongServices.create_song_service import CreateSongService

router = APIRouter(
    prefix="/api/songs",
    tags=["songs"]
)


@router.get("", response_model=List[schemas.SongResponse])
def get_songs(
    song_id: Optional[int] = Query(None, description="the songs identifier"),
    song_title: Optional[str] = Query(None, description="the songs name"),
    artist: Optional[str] = Query(None, description="Filter by artist"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    year_released: Optional[int] = Query(None, description="the year the song was made public"),
    verified: Optional[bool] = Query(None, description="if the song has been verified as being released on streaming platforms"),
    sort_by: Optional[str] = Query(None, description="Field to sort by (prefix with - for descending)"),
    db: Session = Depends(get_db)
):
    """
    Get all songs with optional filtering and sorting.

    Retrieves a list of songs from the database with support for multiple
    filters and sorting options. All filter parameters are optional.

    Args:
        song_id: Filter by exact song ID
        song_title: Filter by song title (partial, case-insensitive match)
        artist: Filter by artist name (partial, case-insensitive match)
        genre: Filter by genre (partial, case-insensitive match)
        year_released: Filter by exact year of release
        verified: Filter by verification status (True/False)
        sort_by: Field to sort by. Prefix with '-' for descending order.
                 Options: 'title', 'artist', 'genre', 'year'
        db: Database session (injected)

    Returns:
        List of songs matching the filter criteria
    """
    query = db.query(models.SongModel)

    # Apply filters
    if song_id:
        query = query.filter(models.SongModel.song_id == song_id)
    if song_title:
        query = query.filter(models.SongModel.song_title.ilike(f"%{song_title}%"))
    if artist:
        query = query.filter(models.SongModel.artist.ilike(f"%{artist}%"))
    if genre:
        query = query.filter(models.SongModel.genre.ilike(f"%{genre}%"))
    if year_released:
        query = query.filter(models.SongModel.year_released == year_released)
    if verified is not None:
        query = query.filter(models.SongModel.verified == verified)

    # Apply Sorting
    if sort_by:
        if sort_by.startswith('-'):
            # Descending Order
            field = sort_by[1:]
            if field == 'title':
                query = query.order_by(desc(models.SongModel.song_title))
            elif field == 'artist':
                query = query.order_by(desc(models.SongModel.artist))
            elif field == 'genre':
                query = query.order_by(desc(models.SongModel.genre))
            elif field == 'year':
                query = query.order_by(desc(models.SongModel.year_released))
        else:
            # Ascending Order
            if sort_by == 'title':
                query = query.order_by(asc(models.SongModel.song_title))
            elif sort_by == 'artist':
                query = query.order_by(asc(models.SongModel.artist))
            elif sort_by == 'genre':
                query = query.order_by(asc(models.SongModel.genre))
            elif sort_by == 'year':
                query = query.order_by(asc(models.SongModel.year_released))

    songs = query.all()
    return songs


@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    """
    Get a single song by its ID.

    Retrieves a specific song from the database using its unique identifier.

    Args:
        song_id: The unique identifier of the song
        db: Database session (injected)

    Returns:
        The song with the specified ID

    Raises:
        HTTPException: 404 error if song is not found
    """
    song = db.query(models.SongModel).filter(models.SongModel.song_id == song_id).first()

    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song


@router.post("", response_model=schemas.SongResponse)
def create_song(song: schemas.SongCreate, db: Session = Depends(get_db)):
    """
    Create a new song.

    Adds a new song to the database after checking that it doesn't already exist.
    Songs are identified by the combination of title and artist.

    Args:
        song: Song data to create (title, artist, genre, year_released)
        db: Database session (injected)

    Returns:
        The newly created song with its assigned ID

    Raises:
        HTTPException: 400 error if song already exists with same title and artist
    """
    song_service = CreateSongService()

    if song_service.does_song_exist(db, song.artist, song.title):
        raise HTTPException(
          status_code=400,
          detail=f"Song '{song.title}' by '{song.artist}' already exists")

    new_song = models.SongModel(
        song_title=song.title,
        artist=song.artist,
        genre=song.genre if song.genre and song.genre.strip() else None,
        year_released=song.year_released
    )

    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song


@router.post("/bulk", response_model=schemas.BulkCreateResponse, status_code=201)
def bulk_create_songs(songs: List[schemas.SongCreate], db: Session = Depends(get_db)):
    """
    Bulk create multiple songs, skipping duplicates.

    Creates multiple songs in a single operation. Songs that already exist
    (based on title and artist combination) are skipped and reported in the
    response. Uses a single database query to check for existing songs for
    optimal performance.

    Args:
        songs: List of song data to create
        db: Database session (injected)

    Returns:
        BulkCreateResponse containing:
        - created: List of successfully created songs
        - skipped: List of songs that were skipped (already exist)
        - total_submitted: Total number of songs submitted
        - total_created: Number of songs successfully created
        - total_skipped: Number of songs skipped
    """
    song_service = CreateSongService()

    # Filter out duplicates - get only new songs to create and list of existing ones
    songs_to_create, existing_songs = song_service.filter_new_songs(db, songs)

    # Build skipped list from existing songs
    skipped_songs = [
        schemas.SkippedSong(
            title=title,
            artist=artist,
            reason="Already exists"
        )
        for title, artist in existing_songs
    ]

    # Convert filtered songs to database models
    new_song_models = [
        models.SongModel(
            song_title=song.title,
            artist=song.artist,
            genre=song.genre if song.genre and song.genre.strip() else None,
            year_released=song.year_released
        )
        for song in songs_to_create
    ]

    # Insert new songs
    created_songs = []
    if new_song_models:
        db.add_all(new_song_models)
        db.commit()

        # Refresh to get IDs
        for song in new_song_models:
            db.refresh(song)
            created_songs.append(song)

    return schemas.BulkCreateResponse(
        created=created_songs,
        skipped=skipped_songs,
        total_submitted=len(songs),
        total_created=len(created_songs),
        total_skipped=len(skipped_songs)
    )


@router.put("/{song_id}", response_model=schemas.SongResponse)
def update_song(song_id: int, song: schemas.SongUpdate, db: Session = Depends(get_db)):
    """
    Update an existing song.

    Updates one or more fields of an existing song. Only the fields provided
    in the request will be updated; omitted fields remain unchanged.

    Args:
        song_id: The unique identifier of the song to update
        song: Song data to update (only include fields to change)
        db: Database session (injected)

    Returns:
        The updated song with all current field values

    Raises:
        HTTPException: 404 error if song is not found
    """
    db_song = db.query(models.SongModel).filter(models.SongModel.song_id == song_id).first()

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
    """
    Delete a song.

    Permanently removes a song from the database.

    Args:
        song_id: The unique identifier of the song to delete
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if song is not found
    """
    song = db.query(models.SongModel).filter(models.SongModel.song_id == song_id).first()

    if not song:
        raise HTTPException(status_code=404, detail="Song not found")

    db.delete(song)
    db.commit()
    return None
