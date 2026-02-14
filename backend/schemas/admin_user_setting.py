from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class AdminUserSettingBase(BaseModel):
    session_title: str = "Karaoke"
    use_all_songs: bool = True
    all_song_reuse: bool = False
    session_mode: str
    songs_per_performer: int = 1
    time_start: Optional[datetime] = None
    end_time: Optional[datetime] = None
    changeover_time: Optional[int] = None
    performance_time: Optional[int] = None


class AdminUserSettingCreate(AdminUserSettingBase):
    admin_user_id: int


class AdminUserSettingUpdate(BaseModel):
    session_title: Optional[str] = None
    use_all_songs: Optional[bool] = None
    all_song_reuse: Optional[bool] = None
    session_mode: Optional[str] = None
    songs_per_performer: Optional[int] = None
    time_start: Optional[datetime] = None
    end_time: Optional[datetime] = None
    changeover_time: Optional[int] = None
    performance_time: Optional[int] = None


class AdminUserSettingResponse(AdminUserSettingBase):
    admin_setting_id: int
    admin_user_id: int
    created_date: datetime
    updated_date: datetime

    model_config = ConfigDict(from_attributes=True)
