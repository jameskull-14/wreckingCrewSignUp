from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class SongListModel(Base):
    __tablename__ = "song_list"
    __table_args__ = {'schema': 'public'}

    song_list_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_user_id = Column(Integer, ForeignKey('public.admin_user.admin_user_id', ondelete='CASCADE'), nullable=False, index=True)
    list_name = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    admin_user = relationship("AdminUserModel", back_populates="song_lists")
    song_list_items = relationship("SongListItemModel", back_populates="song_list", cascade="all, delete-orphan")
    session_song_lists = relationship("SessionSongListModel", back_populates="song_list", cascade="all, delete-orphan")
