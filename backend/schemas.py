from pydantic import BaseModel, ConfigDict, Field
from typing import Optional

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
