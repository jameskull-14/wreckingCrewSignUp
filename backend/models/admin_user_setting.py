from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class AdminUserSettingModel(Base):
    __tablename__ = "admin_user_setting"
    __table_args__ = {'schema': 'public'}

    admin_setting_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    admin_user_id = Column(Integer, ForeignKey('public.admin_user.admin_user_id', ondelete='CASCADE'), unique=True, nullable=False)
    session_title = Column(String(255), default="Karaoke", nullable=False)
    use_all_songs = Column(Boolean, default=True, nullable=False)
    allow_song_reuse = Column(Boolean, default=False, nullable=False)
    session_mode = Column(String(50), nullable=False)
    songs_per_performer = Column(Integer, default=1, nullable=False)
    start_time= Column(String(5), nullable=True)
    end_time = Column(String(5), nullable=True)
    changeover_time = Column(String(5), nullable=True)
    performance_time = Column(String(5), nullable=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    admin_user = relationship("AdminUserModel", back_populates="admin_user_setting")
