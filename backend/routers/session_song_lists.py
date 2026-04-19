from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/session-song-lists",
    tags=["session-song-lists"]
)


@router.get("", response_model=List[schemas.SessionSongListResponse])
async def get_session_song_lists(
    session_id: Optional[int] = Query(None, description="Filter by session ID"),
    song_list_id: Optional[int] = Query(None, description="Filter by song list ID"),
    db: Session = Depends(get_db)
):
    """Get all session song lists with optional filtering."""
    query = db.query(models.SessionSongListModel)

    if session_id:
        query = query.filter(models.SessionSongListModel.session_id == session_id)
    if song_list_id:
        query = query.filter(models.SessionSongListModel.song_list_id == song_list_id)

    session_song_lists = query.all()
    return session_song_lists


@router.get("/{session_song_list_id}", response_model=schemas.SessionSongListResponse)
async def get_session_song_list(session_song_list_id: int, db: Session = Depends(get_db)):
    """Get a single session song list by ID."""
    session_song_list = db.query(models.SessionSongListModel).filter(
        models.SessionSongListModel.session_song_list_id == session_song_list_id
    ).first()

    if not session_song_list:
        raise HTTPException(status_code=404, detail="Session song list not found")
    return session_song_list


@router.post("", response_model=schemas.SessionSongListResponse)
async def create_session_song_list(
    session_song_list: schemas.SessionSongListCreate,
    db: Session = Depends(get_db)
):
    """Apply a song list to a session."""
    # Verify session exists
    session = db.query(models.SessionModel).filter(
        models.SessionModel.session_id == session_song_list.session_id
    ).first()
    if not session:
        raise HTTPException(status_code=400, detail="Session not found")

    # Verify song list exists
    song_list = db.query(models.SongListModel).filter(
        models.SongListModel.song_list_id == session_song_list.song_list_id
    ).first()
    if not song_list:
        raise HTTPException(status_code=400, detail="Song list not found")

    # Check if already applied (unique constraint)
    existing = db.query(models.SessionSongListModel).filter(
        models.SessionSongListModel.session_id == session_song_list.session_id,
        models.SessionSongListModel.song_list_id == session_song_list.song_list_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Song list already applied to this session")

    new_session_song_list = models.SessionSongListModel(
        session_id=session_song_list.session_id,
        song_list_id=session_song_list.song_list_id
    )

    db.add(new_session_song_list)
    db.commit()
    db.refresh(new_session_song_list)
    return new_session_song_list


@router.delete("/{session_song_list_id}", status_code=204)
async def delete_session_song_list(session_song_list_id: int, db: Session = Depends(get_db)):
    """Remove a song list from a session."""
    session_song_list = db.query(models.SessionSongListModel).filter(
        models.SessionSongListModel.session_song_list_id == session_song_list_id
    ).first()

    if not session_song_list:
        raise HTTPException(status_code=404, detail="Session song list not found")

    db.delete(session_song_list)
    db.commit()
    return None
