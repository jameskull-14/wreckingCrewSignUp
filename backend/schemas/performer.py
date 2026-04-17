from pydantic import BaseModel, ConfigDict
from typing import Optional
from models.performer import PerformerStatus, PerformerType


class PerformerBase(BaseModel):
    performer_name: str
    performer_username: str = "Guest"
    queue_number: int
    status: PerformerStatus
    performer_type: PerformerType = PerformerType.individual


class PerformerCreate(PerformerBase):
    session_id: int


class PerformerUpdate(BaseModel):
    performer_name: Optional[str] = None
    performer_username: Optional[str] = None
    queue_number: Optional[int] = None
    status: Optional[PerformerStatus] = None
    performer_type: Optional[PerformerType] = None


class PerformerResponse(PerformerBase):
    performer_id: int
    session_id: int

    model_config = ConfigDict(from_attributes=True)
