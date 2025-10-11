from pydantic import BaseModel, ConfigDict
from typing import Optional


class SongBase(BaseModel):
    Song: str
    Artist: str
    Genre: Optional[str] = None


class SongCreate(SongBase):
    pass


class SongUpdate(BaseModel):
    Song: Optional[str] = None
    Artist: Optional[str] = None
    Genre: Optional[str] = None


class SongResponse(SongBase):
    Id: int

    model_config = ConfigDict(from_attributes=True)
