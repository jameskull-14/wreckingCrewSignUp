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
###STILL NEED TO IMPLEMENT THESE APIS

# define the api's route 
router = APIRouter(prefix="/api/public", tags=["public"])

#---------------------------------------
# returns if the session is active or not 
@router.get("/active-session", response_model=AdminSessionResponse)
def get_active_session(db: Session = Depends(get_db)):
    """Get the currently active karaoke session"""

    # query the db for an active session 
    session = db.query(AdminSession).filter(
        AdminSession.is_active == True
    ).order_by(AdminSession.updated_date.desc()).first()

    # throw an Exception if there is no session
    if not session:
        raise HTTPException(status_code=404, detail="No active karaoke session")
    return session
#---------------------------------------

#---------------------------------------
# returns the time slots for a given active admin session
@router.get("/time-slots/{admin_username}", response_model=List[AdminTimeSlotResponse])
def get_public_time_slots(admin_username: str, db: Session = Depends(get_db)):
    """Get time slots for a specific admin's active session"""
    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()

    # throw an exception if there is no active session
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this admin")
    
    # query the AdminTimeSlot table for the admin 
    slots = db.query(AdminTimeSlot).filter(
        AdminTimeSlot.admin_username == admin_username
    ).all()

    return slots
#---------------------------------------

#---------------------------------------
# returns the list of users in the queue for an active session for a given admin
@router.get("/queue/{admin_username}", response_model=List[QueueEntryResponse])
def get_public_queue(admin_username: str, db: Session = Depends(get_db)):
    """Get queue entries for a specific admin's active session"""

    print("here")
    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()
    

    # throw an error if theres no active session
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this admin")
    
    # query the QueueEntry table for a given admin
    queue = db.query(QueueEntry).filter(
        QueueEntry.admin_username == admin_username
    ).order_by(QueueEntry.queue_position).all()

    return queue
#---------------------------------------

#---------------------------------------
# returns the list of songs an admin user has allowed
@router.get("/songs/{admin_username}", response_model=List[SongResponse])
def get_available_songs(admin_username: str, db: Session = Depends(get_db)):
    """Get available songs for public signup"""

    # Verify session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == admin_username,
        AdminSession.is_active == True
    ).first()

    # throw an error if the session isnt active
    if not session:
        raise HTTPException(status_code=404, detail="No active session for this admin")
    
    # Id the admin chose to use all songs then make all songs available
    if session.use_all_songs:
        songs = db.query(Songs).order_by(Songs.Song).all()
        return songs
    
    # Query the AdminSongSelection table to get all the songs the user can select
    selections = db.query(AdminSongSelection).filter(
        AdminSongSelection.admin_username == admin_username,
        AdminSongSelection.is_available == True
    ).all()

    # get the ids for each song that is available to the users
    song_ids = [sel.song_id for sel in selections]
    # query the Songs table for the available Ids
    songs = db.query(Songs).filter(Songs.Id.in_(song_ids)).order_by(Songs.Song).all()

    return songs
#---------------------------------------

#---------------------------------------
# update the time slot from the user side
@router.put("/time-slots/{slot_id}/signup", response_model=AdminTimeSlotResponse)
def public_signup(
    slot_id: int,
    slot_update: AdminTimeSlotUpdate,
    db: Session = Depends(get_db)
):
    """Allow public users to sign up for a time slot"""
    # query the AdminTimeSlot table for specific slot ids 
    db_slot = db.query(AdminTimeSlot).filter(AdminTimeSlot.id == slot_id).first()
    # throw an error if there are no matches
    if not db_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")

    # Verify the session is active
    session = db.query(AdminSession).filter(
        AdminSession.admin_username == db_slot.admin_username,
        AdminSession.is_active == True
    ).first()

    # throw an error is there is no active session
    if not session:
        raise HTTPException(status_code=403, detail="Session is not active")

    # Update the slot with the user provided data
    update_data = slot_update.model_dump(exclude_unset=True)

    # loop through the data and set the key values for what update_data returned
    for key, value in update_data.items():
        setattr(db_slot, key, value)
    
    db.commit()
    db.refresh(db_slot)
    return db_slot
#---------------------------------------

#---------------------------------------
# adds a user to the queue, public facing 
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

    # error out if the sesison isnt active
    if not session:
        raise HTTPException(status_code=403, detail="Session is not active")

    # Create queue entry
    db_entry = QueueEntry(**queue_entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry
#---------------------------------------