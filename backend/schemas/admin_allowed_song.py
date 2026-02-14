from pydantic import BaseModel, ConfigDict


class AdminAllowedSongBase(BaseModel):
    admin_user_id: int
    song_id: int


class AdminAllowedSongCreate(AdminAllowedSongBase):
    pass


class AdminAllowedSongResponse(AdminAllowedSongBase):
    model_config = ConfigDict(from_attributes=True)
