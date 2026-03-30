from pydantic import BaseModel, ConfigDict
from typing import Optional


class AdminAllowedSongBase(BaseModel):
    admin_user_id: int
    song_id: int


class AdminAllowedSongCreate(AdminAllowedSongBase):
    pass


class AdminAllowedSongResponse(AdminAllowedSongBase):
    # Include song details in response
    song_title: Optional[str] = None
    artist: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
