from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import AdminTimeSlot
from schemas import AdminTimeSlotCreate, AdminTimeSlotUpdate, AdminTimeSlotResponse

# Define the api's route
router = APIRouter(prefix="/api/admin-time-slots", tags=["admin-time-slots"])

#--------------------------
# returns available time slots for a specific admin
@router.get("/", response_model=List[AdminTimeSlotResponse])
def list_time_slots(
    admin_username: Optional[str] = None,
    is_taken: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    # general query to AdminTimeSlot table
    # may want to change this to filtered query so we arent querying a whole log 
    query = db.query(AdminTimeSlot)

    # if provided, does the admin exist
    if admin_username:
        query = query.filter(AdminTimeSlot.admin_username == admin_username)
    # if provided, is the time slot already taken 
    if is_taken is not None:
        query = query.filter(AdminTimeSlot.is_taken == is_taken)

    return query.all()
#-------------------------

#-------------------------
# returns a specific time slot for the given ID
@router.get("/{slot_id}", response_model=AdminTimeSlotResponse)
def get_time_slot(slot_id: int, db: Session = Depends(get_db)):

    # queries the AdminTimeSlot table for that specific time slot
    slot = db.query(AdminTimeSlot).filter(AdminTimeSlot.id == slot_id).first()

    # raise an error if the time slot doesnt exists
    if not slot:
        raise HTTPException(status_code=404, detail="Time slot not found")
    return slot
#-------------------------

#-------------------------
# create a new time slot
@router.post("/", response_model=AdminTimeSlotResponse)
def create_time_slot(slot: AdminTimeSlotCreate, db: Session = Depends(get_db)):
    db_slot = AdminTimeSlot(**slot.model_dump())
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot
#-------------------------

#-------------------------
# creates several time slots at once
@router.post("/bulk", response_model=List[AdminTimeSlotResponse])
def bulk_create_time_slots(slots: List[AdminTimeSlotCreate], db: Session = Depends(get_db)):
    db_slots = [AdminTimeSlot(**slot.model_dump()) for slot in slots]
    db.add_all(db_slots)
    db.commit()
    for slot in db_slots:
        db.refresh(slot)
    return db_slots
#-------------------------

#-------------------------
# update a specific time slot 
@router.put("/{slot_id}", response_model=AdminTimeSlotResponse)
def update_time_slot(
    slot_id: int,
    slot_update: AdminTimeSlotUpdate,
    db: Session = Depends(get_db)
):
    # queries the time slot id and errors out if it doesnt exists
    db_slot = db.query(AdminTimeSlot).filter(AdminTimeSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")

    update_data = slot_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        # setattr updates whatever field the user wants to update in the dictionary
        setattr(db_slot, key, value)

    db.commit()
    db.refresh(db_slot)
    return db_slot
#-------------------------

#-------------------------
# delete a specific time slot by id
@router.delete("/{slot_id}")
def delete_time_slot(slot_id: int, db: Session = Depends(get_db)):
    # query the db for the specific time slot and throw an error if it doesnt exists
    db_slot = db.query(AdminTimeSlot).filter(AdminTimeSlot.id == slot_id).first()
    if not db_slot:
        raise HTTPException(status_code=404, detail="Time slot not found")

    # run the delete command
    db.delete(db_slot)
    db.commit()
    return {"message": "Time slot deleted successfully"}
#-------------------------