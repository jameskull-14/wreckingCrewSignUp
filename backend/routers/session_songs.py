from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/session-songs",
    tags=["session-songs"]
)


@router.get("/search", response_model=List[schemas.SessionSongResponse])
def search_session_songs(
    session_id: int = Query(..., description="Session ID to search within"),
    search_term: str = Query(..., description="Search term for song title or artist"),
    db: Session = Depends(get_db)
):
    """
    Search for songs within a specific session.

    Searches songs that are part of a session by title or artist.
    Case-insensitive partial matching.

    Args:
        session_id: The session ID to search within
        search_term: The search term to match against song title or artist
        db: Database session (injected)

    Returns:
        List of session songs matching the search criteria with song details
    """
    print(f"\n🔍 SESSION SONG SEARCH")
    print(f"  Session ID: {session_id}")
    print(f"  Search term: '{search_term}'")

    query = db.query(
        models.SessionSongModel.session_id,
        models.SessionSongModel.song_id,
        models.SongModel.song_title,
        models.SongModel.artist
    ).join(
        models.SongModel,
        models.SessionSongModel.song_id == models.SongModel.song_id
    ).filter(
        models.SessionSongModel.session_id == session_id
    )

    # Search in both song_title and artist (case-insensitive)
    search_filter = or_(
        models.SongModel.song_title.ilike(f"%{search_term}%"),
        models.SongModel.artist.ilike(f"%{search_term}%")
    )
    query = query.filter(search_filter)

    session_songs = query.all()
    print(f"  Found {len(session_songs)} matching songs")

    # Convert to dict format for response
    results = [
        {
            "session_id": song.session_id,
            "song_id": song.song_id,
            "song_title": song.song_title,
            "artist": song.artist
        }
        for song in session_songs
    ]

    if results:
        print(f"  Returning songs: {[s['song_title'] for s in results]}")
    else:
        print(f"  No songs found")

    return results


@router.get("/", response_model=List[schemas.SessionSongResponse])
def get_session_songs(
    session_id: Optional[int] = Query(None, description="Filter by session ID"),
    song_id: Optional[int] = Query(None, description="Filter by song ID"),
    db: Session = Depends(get_db)
):
    """
    Get all session songs with optional filtering.

    Retrieves a list of session-song associations from the database with support
    for filtering by session or song. All filter parameters are optional.
    Includes song details (title, artist).

    Args:
        session_id: Filter by exact session ID
        song_id: Filter by exact song ID
        db: Database session (injected)

    Returns:
        List of session songs matching the filter criteria with song details
    """
    query = db.query(
        models.SessionSongModel.session_id,
        models.SessionSongModel.song_id,
        models.SongModel.song_title,
        models.SongModel.artist
    ).join(
        models.SongModel,
        models.SessionSongModel.song_id == models.SongModel.song_id
    )

    # Apply filters
    if session_id:
        query = query.filter(models.SessionSongModel.session_id == session_id)
    if song_id:
        query = query.filter(models.SessionSongModel.song_id == song_id)

    session_songs = query.all()

    # Convert to dict format for response
    return [
        {
            "session_id": song.session_id,
            "song_id": song.song_id,
            "song_title": song.song_title,
            "artist": song.artist
        }
        for song in session_songs
    ]


@router.post("/", response_model=schemas.SessionSongResponse)
def create_session_song(
    session_song: schemas.SessionSongCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new session song association.

    Adds a new session-song association to the database.

    Args:
        session_song: Session song data to create
        db: Database session (injected)

    Returns:
        The newly created session song association

    Raises:
        HTTPException: 400 error if session or song doesn't exist
        HTTPException: 400 error if association already exists
    """
    # Verify session exists
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_song.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=400, detail="Session not found")

    # Verify song exists
    song = db.query(models.SongModel).filter(
        models.SongModel.song_id == session_song.song_id
    ).first()
    if not song:
        raise HTTPException(status_code=400, detail="Song not found")

    # Check if association already exists
    existing = db.query(models.SessionSongModel).filter(
        models.SessionSongModel.session_id == session_song.session_id,
        models.SessionSongModel.song_id == session_song.song_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="This session-song association already exists")

    new_session_song = models.SessionSongModel(
        session_id=session_song.session_id,
        song_id=session_song.song_id
    )

    db.add(new_session_song)
    db.commit()
    db.refresh(new_session_song)

    # Return with song details
    return {
        "session_id": new_session_song.session_id,
        "song_id": new_session_song.song_id,
        "song_title": song.song_title,
        "artist": song.artist
    }


@router.delete("/{session_id}/{song_id}", status_code=204)
def delete_session_song(
    session_id: int,
    song_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a session song association.

    Permanently removes a session-song association from the database.

    Args:
        session_id: The session ID
        song_id: The song ID
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if association is not found
    """
    session_song = db.query(models.SessionSongModel).filter(
        models.SessionSongModel.session_id == session_id,
        models.SessionSongModel.song_id == song_id
    ).first()

    if not session_song:
        raise HTTPException(status_code=404, detail="Session song association not found")

    db.delete(session_song)
    db.commit()
    return None
