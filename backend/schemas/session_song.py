from pydantic import BaseModel, ConfigDict


class SessionSongBase(BaseModel):
    session_id: int
    song_id: int


class SessionSongCreate(SessionSongBase):
    pass


class SessionSongResponse(SessionSongBase):
    model_config = ConfigDict(from_attributes=True)
