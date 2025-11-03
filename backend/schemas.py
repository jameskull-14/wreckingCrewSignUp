from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime

class SongBase(BaseModel):
    title: str = Field(..., description="Song title")
    artist: str = Field(..., description="Artist name")
    genre: str = Field(..., description="Genre")

class SongCreate(SongBase):
    pass

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    genre: Optional[str] = None

class SongResponse(BaseModel):
    id: int = Field(..., alias="Id")
    title: str = Field(..., alias="Song")
    artist: str = Field(..., alias="Artist")
    genre: Optional[str] = Field(None, alias="Genre")

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

# AdminSession schemas
class AdminSessionBase(BaseModel):
    admin_username: str
    title: Optional[str] = None
    is_active: Optional[bool] = False
    use_all_songs: Optional[bool] = True
    allow_song_reuse: Optional[bool] = False
    session_mode: Optional[str] = 'time_slot'
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    time_increment: Optional[int] = 15
    changeover_time: Optional[int] = 0
    performer_song_limit: Optional[int] = 1

class AdminSessionCreate(AdminSessionBase):
    pass

class AdminSessionUpdate(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None
    use_all_songs: Optional[bool] = None
    allow_song_reuse: Optional[bool] = None
    session_mode: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    time_increment: Optional[int] = None
    changeover_time: Optional[int] = None
    performer_song_limit: Optional[int] = None

class AdminSessionResponse(AdminSessionBase):
    id: int
    created_date: Optional[datetime] = None
    updated_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# AdminTimeSlot schemas
class AdminTimeSlotBase(BaseModel):
    admin_username: str
    time: str
    user_name: Optional[str] = None
    song_id: Optional[int] = None
    song_ids: Optional[List[int]] = []
    is_taken: Optional[bool] = False
    instruments: Optional[List[str]] = []
    custom_instrument: Optional[str] = None
    singing_along: Optional[bool] = False

class AdminTimeSlotCreate(AdminTimeSlotBase):
    pass

class AdminTimeSlotUpdate(BaseModel):
    user_name: Optional[str] = None
    song_id: Optional[int] = None
    song_ids: Optional[List[int]] = None
    is_taken: Optional[bool] = None
    instruments: Optional[List[str]] = None
    custom_instrument: Optional[str] = None
    singing_along: Optional[bool] = None

class AdminTimeSlotResponse(AdminTimeSlotBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# AdminSongSelection schemas
class AdminSongSelectionBase(BaseModel):
    admin_username: str
    song_id: int
    is_available: Optional[bool] = True

class AdminSongSelectionCreate(AdminSongSelectionBase):
    pass

class AdminSongSelectionUpdate(BaseModel):
    is_available: Optional[bool] = None

class AdminSongSelectionResponse(AdminSongSelectionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)

# QueueEntry schemas
class QueueEntryBase(BaseModel):
    admin_username: str
    user_name: str
    song_id: Optional[int] = None
    song_ids: Optional[List[int]] = []
    queue_position: int
    status: Optional[str] = 'waiting'
    instruments: Optional[List[str]] = []
    custom_instrument: Optional[str] = None
    singing_along: Optional[bool] = False

class QueueEntryCreate(QueueEntryBase):
    pass

class QueueEntryUpdate(BaseModel):
    queue_position: Optional[int] = None
    status: Optional[str] = None
    instruments: Optional[List[str]] = None
    custom_instrument: Optional[str] = None
    singing_along: Optional[bool] = None

class QueueEntryResponse(QueueEntryBase):
    id: int
    created_date: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)



# class SongBase(BaseModel):
#     Song: str
#     Artist: str
#     Genre: Optional[str] = None


# class SongCreate(SongBase):
#     pass


# class SongUpdate(BaseModel):
#     Song: Optional[str] = None
#     Artist: Optional[str] = None
#     Genre: Optional[str] = None


# class SongResponse(SongBase):
#     Id: int

#     model_config = ConfigDict(from_attributes=True)
