from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/api/admin-user-settings",
    tags=["admin-user-settings"]
)


@router.get("/", response_model=List[schemas.AdminUserSettingResponse])
def get_admin_user_settings(
    admin_user_id: Optional[int] = Query(None, description="Filter by admin user ID"),
    db: Session = Depends(get_db)
):
    """
    Get all admin user settings with optional filtering.

    Retrieves a list of admin user settings from the database with support for filtering.

    Args:
        admin_user_id: Filter by exact admin user ID
        db: Database session (injected)

    Returns:
        List of admin user settings matching the filter criteria
    """
    query = db.query(models.AdminUserSettingModel)

    # Apply filters
    if admin_user_id:
        query = query.filter(models.AdminUserSettingModel.admin_user_id == admin_user_id)

    settings = query.all()
    return settings


@router.get("/{setting_id}", response_model=schemas.AdminUserSettingResponse)
def get_admin_user_setting(setting_id: int, db: Session = Depends(get_db)):
    """
    Get a single admin user setting by its ID.

    Retrieves a specific admin user setting from the database using its unique identifier.

    Args:
        setting_id: The unique identifier of the admin user setting
        db: Database session (injected)

    Returns:
        The admin user setting with the specified ID

    Raises:
        HTTPException: 404 error if setting is not found
    """
    setting = db.query(models.AdminUserSettingModel).filter(
        models.AdminUserSettingModel.admin_setting_id == setting_id
    ).first()

    if not setting:
        raise HTTPException(status_code=404, detail="Admin user setting not found")
    return setting


@router.post("/", response_model=schemas.AdminUserSettingResponse)
def create_admin_user_setting(
    setting: schemas.AdminUserSettingCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new admin user setting.

    Adds a new admin user setting to the database.

    Args:
        setting: Admin user setting data to create
        db: Database session (injected)

    Returns:
        The newly created admin user setting with its assigned ID

    Raises:
        HTTPException: 400 error if admin user doesn't exist
    """
    # Verify admin user exists
    admin_user = db.query(models.AdminUserModel).filter(
        models.AdminUserModel.admin_user_id == setting.admin_user_id
    ).first()
    if not admin_user:
        raise HTTPException(status_code=400, detail="Admin user not found")

    new_setting = models.AdminUserSettingModel(
        admin_user_id=setting.admin_user_id,
        session_title=setting.session_title,
        use_all_songs=setting.use_all_songs,
        allow_song_reuse=setting.allow_song_reuse,
        session_mode=setting.session_mode,
        songs_per_performer=setting.songs_per_performer,
        time_start=setting.time_start,
        end_time=setting.end_time,
        changeover_time=setting.changeover_time,
        performance_time=setting.performance_time
    )

    db.add(new_setting)
    db.commit()
    db.refresh(new_setting)
    return new_setting


@router.put("/{setting_id}", response_model=schemas.AdminUserSettingResponse)
def update_admin_user_setting(
    setting_id: int,
    setting: schemas.AdminUserSettingUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing admin user setting.

    Updates one or more fields of an existing admin user setting. Only the fields
    provided in the request will be updated; omitted fields remain unchanged.

    Args:
        setting_id: The unique identifier of the setting to update
        setting: Setting data to update (only include fields to change)
        db: Database session (injected)

    Returns:
        The updated admin user setting with all current field values

    Raises:
        HTTPException: 404 error if setting is not found
    """
    db_setting = db.query(models.AdminUserSettingModel).filter(
        models.AdminUserSettingModel.admin_setting_id == setting_id
    ).first()

    if not db_setting:
        raise HTTPException(status_code=404, detail="Admin user setting not found")

    update_data = setting.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_setting, field, value)

    db.commit()
    db.refresh(db_setting)
    return db_setting


@router.delete("/{setting_id}", status_code=204)
def delete_admin_user_setting(setting_id: int, db: Session = Depends(get_db)):
    """
    Delete an admin user setting.

    Permanently removes an admin user setting from the database.

    Args:
        setting_id: The unique identifier of the setting to delete
        db: Database session (injected)

    Returns:
        None (204 No Content status)

    Raises:
        HTTPException: 404 error if setting is not found
    """
    setting = db.query(models.AdminUserSettingModel).filter(
        models.AdminUserSettingModel.admin_setting_id == setting_id
    ).first()

    if not setting:
        raise HTTPException(status_code=404, detail="Admin user setting not found")

    db.delete(setting)
    db.commit()
    return None
