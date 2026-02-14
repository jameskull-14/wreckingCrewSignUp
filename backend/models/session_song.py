from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class SessionSongModel(Base):
    __tablename__ = "session_song"
    __table_args__ = {'schema': 'public'}

    session_id = Column(Integer, ForeignKey('public.session.session_id', ondelete='CASCADE'), primary_key=True, index=True)
    song_id = Column(Integer, ForeignKey('public.song.song_id', ondelete='CASCADE'), primary_key=True, index=True)

    # Relationships
    session = relationship("SessionModel", back_populates="session_songs")
    song = relationship("SongModel", back_populates="session_songs")
