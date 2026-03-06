from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
import enum


class PerformerStatus(enum.Enum):
    waiting = "waiting"
    performing = "performing"
    completed = "completed"
    skipped = "skipped"


class PerformerModel(Base):
    __tablename__ = "performer"
    __table_args__ = {'schema': 'public'}

    performer_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    session_id = Column(Integer, ForeignKey('public.session.session_id', ondelete='CASCADE'), nullable=False, index=True)
    performer_name = Column(String(255), nullable=False)
    performer_username = Column(String(255), default="Guest", nullable=False)
    queue_number = Column(Integer, nullable=False, index=True)
    status = Column(Enum(PerformerStatus), nullable=False, index=True)

    # Relationships
    session = relationship("SessionModel", back_populates="performers")
    performer_song_selections = relationship("PerformerSongSelectionModel", back_populates="performer")
