from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum


class SessionStatus(enum.Enum):
    Active = "Active"
    Completed = "Completed"
    Paused = "Paused"


class SessionMode(enum.Enum):
    Time = "Time"
    Order = "Order"


class SessionModel(Base):
    __tablename__ = "session"
    __table_args__ = {'schema': 'public'}

    session_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_user_id = Column(Integer, ForeignKey('public.admin_user.admin_user_id', ondelete='CASCADE'), nullable=False, index=True)
    status = Column(Enum(SessionStatus, name='session_status'), default=SessionStatus.Active, nullable=False, index=True)
    session_title = Column(String(255), default="Karaoke", nullable=False)
    session_host = Column(String(255), nullable=True)
    use_all_songs = Column(Boolean, default=True, nullable=False)
    allow_song_reuse = Column(Boolean, default=False, nullable=False)
    session_mode = Column(Enum(SessionMode, name='session_mode'), nullable=False)
    songs_per_performer = Column(Integer, default=1, nullable=False)
    start_time = Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    changeover_time = Column(String(5), nullable=True)
    performance_time = Column(String(5), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    updated_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    performers = relationship("PerformerModel", back_populates="session")
    admin_user = relationship("AdminUserModel", back_populates="sessions")
    session_songs = relationship("SessionSongModel", back_populates="session")
