from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from models.performer import PerformerStatus


class PerformerSongSelectionBase(BaseModel):
    selection_order: str
    is_singing: bool
    instrument: Optional[str] = None
    status: PerformerStatus


class PerformerSongSelectionCreate(PerformerSongSelectionBase):
    performer_id: int
    song_id: int


class PerformerSongSelectionUpdate(BaseModel):
    selection_order: Optional[str] = None
    is_singing: Optional[bool] = None
    instrument: Optional[str] = None
    status: Optional[PerformerStatus] = None


class PerformerSongSelectionResponse(PerformerSongSelectionBase):
    performer_selection_id: int
    performer_id: int
    song_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
