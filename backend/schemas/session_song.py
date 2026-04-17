from pydantic import BaseModel, ConfigDict
from typing import Optional


class SessionSongBase(BaseModel):
    session_id: int
    song_id: int


class SessionSongCreate(SessionSongBase):
    pass


class SessionSongResponse(SessionSongBase):
    # Include song details in response
    song_title: Optional[str] = None
    artist: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
