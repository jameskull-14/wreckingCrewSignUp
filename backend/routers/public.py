from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import AdminTimeSlot, AdminSession, QueueEntry, Songs, AdminSongSelection
from schemas import (
    AdminTimeSlotResponse,
    AdminSessionResponse,
    QueueEntryResponse,
    SongResponse,
    AdminTimeSlotUpdate,
    QueueEntryCreate
)

router = APIRouter(prefix="/api/public", tags=["public"])

@router.get("/active-session", response_model=AdminSessionResponse)
def get_active_session(db: Session = Depends(get_db)):
    """Get the currently active karaoke session"""
    session = db.query(AdminSession).filter(
        AdminSession.is_active == True
    ).order_by(AdminSession.updated_date.desc()).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active karaoke session")
    return session

@router.get("/time-slots/{admin_username}", response_model=List[AdminTimeSlotResponse])
def get_public_time_slots(admin_username: str, db: Session = Depends(get_db)):
    """Get time slots for a specific admin's active session"""
    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active session for this admin")
    
    slots = db.query(AdminTimeSlot).filter(
        AdminTimeSlot.admin_username == admin_username
    ).all()

    return slots

@router.get("/queue/{admin_username}", response_model=List[QueueEntryResponse])
def get_public_queue(admin_username: str, db: Session = Depends(get_db)):
    """Get queue entries for a specific admin's active session"""
    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active session for this admin")
    
    queue = db.query(QueueEntry).filter(
        QueueEntry.admin_username == admin_username
    ).order_by(QueueEntry.queue_position).all()

    return queue

@router.get("/songs/{admin_username}", response_model=List[SongResponse])
def get_available_songs(admin_username: str, db: Session = Depends(get_db)):
    """Get available songs for public signup"""
    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="No active session for this admin")
    
    # If use_all_songs, return all songs
    if session.use_all_songs:
        songs = db.query(Songs).order_by(Songs.Song).all()
        return songs
    
    # Otherwise, return only selected songs
    selections = db.query(AdminSongSelection).filter(
        AdminSongSelection.admin_username == admin_username,
        AdminSongSelection.is_available == True
    ).all()

    song_ids = [sel.song_id for sel in selections]
    songs = db.query(Songs).filter(Songs.Id.in_(song_ids)).order_by(Songs.Song).all()

    return songs

@router.put("/time-slots/{slot_id}/signup", response_model=AdminTimeSlotResponse)
def public_signup(
    slot_id: int,
    slot_update: AdminTimeSlotUpdate,
    db: Session = Depends(get_db)
):
    """Allow public users to sign up for a time slot"""
    db_slot = db.query(AdminTimeSlot).filter(AdminTimeSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")

    # Verify the session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == db_slot.admin_username,
        AdminSession.is_active == True
    ).first()

    if not session:
        raise HTTPException(status_code=403, detail="Session is not active")

    # Update the slot with provided data
    update_data = slot_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_slot, key, value)
    
    db.commit()
    db.refresh(db_slot)
    return db_slot

@router.post("/queue/{admin_username}/signup", response_model=QueueEntryResponse)
def public_queue_signup(
    admin_username: str,
    queue_entry: QueueEntryCreate,
    db: Session = Depends(get_db)
):
    """Allow public users to sign up for the queue"""
    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()

    if not session:
        raise HTTPException(status_code=403, detail="Session is not active")

    # Create queue entry
    db_entry = QueueEntry(**queue_entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry