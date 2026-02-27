from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional
from datetime import datetime
import re
from models.session import SessionStatus, SessionMode


class SessionBase(BaseModel):
    session_title: str = "Karaoke"
    session_host: Optional[str] = None
    use_all_songs: bool = True
    allow_song_reuse: bool = False
    session_mode: SessionMode
    songs_per_performer: int = 1
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    changeover_time: Optional[str] = None
    performance_time: Optional[str] = None
    status: SessionStatus = SessionStatus.Active

    @field_validator('start_time', 'end_time', 'changeover_time', 'performance_time')
    @classmethod
    def validate_time_format(cls, v):
        if v is not None and not re.match(r'^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$', v):
            raise ValueError('Time must be in HH:MM format (e.g., "09:30", "14:00")')
        return v


class SessionCreate(SessionBase):
    admin_user_id: int


class SessionUpdate(BaseModel):
    session_title: Optional[str] = None
    session_host: Optional[str] = None
    use_all_songs: Optional[bool] = None
    allow_song_reuse: Optional[bool] = None
    session_mode: Optional[SessionMode] = None
    songs_per_performer: Optional[int] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    changeover_time: Optional[str] = None
    performance_time: Optional[str] = None
    status: Optional[SessionStatus] = None


class SessionResponse(SessionBase):
    session_id: int
    admin_user_id: int
    created_date: datetime
    updated_date: datetime

    model_config = ConfigDict(from_attributes=True)
