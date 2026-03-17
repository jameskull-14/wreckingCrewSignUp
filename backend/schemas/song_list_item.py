from pydantic import BaseModel, ConfigDict
from typing import Optional


class SongListItemBase(BaseModel):
    raw_title: str
    raw_artist: Optional[str] = None


class SongListItemCreate(SongListItemBase):
    song_list_id: int
    song_id: int


class SongListItemUpdate(BaseModel):
    raw_title: Optional[str] = None
    raw_artist: Optional[str] = None


class SongListItemResponse(SongListItemBase):
    item_id: int
    song_list_id: int
    song_id: int

    model_config = ConfigDict(from_attributes=True)
