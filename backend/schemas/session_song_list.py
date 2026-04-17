from pydantic import BaseModel, ConfigDict
from datetime import datetime


class SessionSongListBase(BaseModel):
    session_id: int
    song_list_id: int


class SessionSongListCreate(SessionSongListBase):
    pass


class SessionSongListResponse(SessionSongListBase):
    session_song_list_id: int
    applied_at: datetime

    model_config = ConfigDict(from_attributes=True)
