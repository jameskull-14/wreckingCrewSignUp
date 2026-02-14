from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class PerformerSongSelectionModel(Base):
    __tablename__ = "performer_song_selection"
    __table_args__ = {'schema': 'public'}

    performer_selection_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    performer_id = Column(Integer, ForeignKey('public.performer.performer_id', ondelete='CASCADE'), nullable=False, index=True)
    song_id = Column(Integer, ForeignKey('public.song.song_id', ondelete='CASCADE'), nullable=False, index=True)
    selection_order = Column(String(10), nullable=False, index=True)
    is_singing = Column(Boolean, nullable=False)
    instrument = Column(String(100), nullable=True)
    status = Column(String(50), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    performer = relationship("PerformerModel", back_populates="performer_song_selections")
    song = relationship("SongModel", back_populates="performer_song_selections")
