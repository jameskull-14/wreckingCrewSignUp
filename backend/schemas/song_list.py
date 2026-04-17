from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class SongListBase(BaseModel):
    list_name: str
    original_filename: str


class SongListCreate(SongListBase):
    admin_user_id: int


class SongListUpdate(BaseModel):
    list_name: Optional[str] = None


class SongListResponse(SongListBase):
    song_list_id: int
    admin_user_id: int
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)
