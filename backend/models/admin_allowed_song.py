from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class AdminAllowedSongModel(Base):
    __tablename__ = "admin_allowed_song"
    __table_args__ = {'schema': 'public'}

    admin_user_id = Column(Integer, ForeignKey('public.admin_user.admin_user_id', ondelete='CASCADE'), primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey('public.song.song_id', ondelete='CASCADE'), primary_key=True, index=True)

    # Relationships
    admin_user = relationship("AdminUserModel", back_populates="admin_allowed_songs")
    song = relationship("SongModel", back_populates="admin_allowed_songs")
