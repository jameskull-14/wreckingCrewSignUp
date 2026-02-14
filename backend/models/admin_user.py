from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class AdminUserModel(Base):
    __tablename__ = "admin_user"
    __table_args__ = {'schema': 'public'}

    admin_user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    created_on = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    login_attempts = Column(Integer, default=0, nullable=True)
    locked_until = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    admin_allowed_songs = relationship("AdminAllowedSongModel", back_populates="admin_user")
    admin_user_setting = relationship("AdminUserSettingModel", back_populates="admin_user", uselist=False)
    sessions = relationship("SessionModel", back_populates="admin_user")
