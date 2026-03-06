from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List


class SongBase(BaseModel):
    song_title: str = Field(..., description="Song title")
    artist: str = Field(..., description="Artist name")
    genre: Optional[str] = Field(None, description="Genre")
    year_released: Optional[int] = None
    verified: bool = False


class SongCreate(BaseModel):
    title: str = Field(..., description="Song title", alias="song_title")
    artist: str = Field(..., description="Artist name")
    genre: Optional[str] = Field(None, description="Genre")
    year_released: Optional[int] = None

    model_config = ConfigDict(populate_by_name=True)


class SongUpdate(BaseModel):
    song_title: Optional[str] = None
    artist: Optional[str] = None
    genre: Optional[str] = None
    year_released: Optional[int] = None
    verified: Optional[bool] = None


class SongResponse(BaseModel):
    song_id: int
    song_title: str
    artist: str
    genre: Optional[str] = None
    year_released: Optional[int] = None
    verified: bool = False

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class SkippedSong(BaseModel):
    title: str
    artist: str
    reason: str = "Already exists"


class BulkCreateResponse(BaseModel):
    created: List[SongResponse]
    skipped: List[SkippedSong]
    total_submitted: int
    total_created: int
    total_skipped: int
