from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from typing import List, Optional
import models
import schemas
from database import get_db


#define the api's route
router = APIRouter(
    prefix = "/api/admin-sessions",
    tags = ["admin-sessions"]
)

#-----------------------------------------
# returns if the username and password match
@router.get("/", response_model=List[schemas.AdminSessionUpdate])
def isAdmin(
    username: str = Query(..., description="user name"),
    password: str = Query(..., description="password")
    db: Sesssion = Depends(get_db)
):
    """Determine if the user is an admin"""

    admin_session = db.query(models.UserAdmin)
    .filter(models.UserAdmin.admin_username == username)
    .first()

    return admin_session is not None

#------------------------------------------
@router.put("/{id}", response_model=AdminSongSelectionResponse)
def activateSession(
    id: str = Query(..., description="id"),,
    db: Session = Depends(get_db)
):
    """Set the karaoke session to active"""

    activeSession = db.query(models.AdminSessionUpdate)
    .filter(models.AdminSessionUpdate.id == id)
    .first()

    

