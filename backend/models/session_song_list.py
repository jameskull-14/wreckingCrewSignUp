from sqlalchemy import Column, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class SessionSongListModel(Base):
    __tablename__ = "session_song_list"
    __table_args__ = (
        UniqueConstraint('session_id', 'song_list_id', name='unique_session_song_list'),
        {'schema': 'public'}
    )

    session_song_list_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey('public.session.session_id', ondelete='CASCADE'), nullable=False, index=True)
    song_list_id = Column(Integer, ForeignKey('public.song_list.song_list_id', ondelete='CASCADE'), nullable=False, index=True)
    applied_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    session = relationship("SessionModel", back_populates="session_song_lists")
    song_list = relationship("SongListModel", back_populates="session_song_lists")
