from sqlalchemy import Column, Integer, String, Text, Boolean, ARRAY, DateTime
from sqlalchemy.sql import func
from database import Base

# this table holds the admin users with authentication
class AdminUser(Base):
    __tablename__ = "AdminUser"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    is_active = Column(Boolean, default=True)
    created_on = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True))
    failed_login_attempts = Column(Integer, default=0)
    account_locked_until = Column(DateTime(timezone=True))

# this table holds the songs, artists, and optionally the genre
class Songs(Base):
    __tablename__ = "Songs"
    __table_args__ = {'schema': 'public'}

    Id = Column(Integer, primary_key=True, index=True)
    Song = Column(String(100))
    Artist = Column(String(100))
    Genre = Column(String(100))

# this table is intended to hold the live session info
class AdminSession(Base):
    __tablename__ = "AdminSession"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String(100), nullable=False, index=True)
    title = Column(String(200))
    is_active = Column(Boolean, default=False)
    use_all_songs = Column(Boolean, default=True)
    allow_song_reuse = Column(Boolean, default=False)
    session_mode = Column(String(50), default='time_slot')  # 'time_slot' or 'order'
    start_time = Column(String(10))  # e.g., '19:00'
    end_time = Column(String(10))  # e.g., '23:00'
    time_increment = Column(Integer, default=15)  # minutes
    changeover_time = Column(Integer, default=0)  # minutes
    performer_song_limit = Column(Integer, default=1)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
    updated_date = Column(DateTime(timezone=True), onupdate=func.now())

# this table is the settings for specific time slots during the karaoke session for a specific admin
class AdminTimeSlot(Base):
    __tablename__ = "AdminTimeSlot"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String(100), nullable=False, index=True)
    time = Column(String(20), nullable=False)  # e.g., '7:00 PM'
    user_name = Column(String(100))
    song_id = Column(Integer)  # Primary song
    song_ids = Column(ARRAY(Integer), default=[])  # Multiple songs
    is_taken = Column(Boolean, default=False)
    instruments = Column(ARRAY(String), default=[])
    custom_instrument = Column(String(100))
    singing_along = Column(Boolean, default=False)

# this table is the settings which songs are still available for a user to select
class AdminSongSelection(Base):
    __tablename__ = "AdminSongSelection"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String(100), nullable=False, index=True)
    song_id = Column(Integer, nullable=False)
    is_available = Column(Boolean, default=True)

# this table is the list of users in the queue and their settings
class QueueEntry(Base):
    __tablename__ = "QueueEntry"
    __table_args__ = {'schema': 'public'}

    id = Column(Integer, primary_key=True, index=True)
    admin_username = Column(String(100), nullable=False, index=True)
    user_name = Column(String(100), nullable=False)
    song_id = Column(Integer)  # Primary song
    song_ids = Column(ARRAY(Integer), default=[])  # Multiple songs
    queue_position = Column(Integer, nullable=False)
    status = Column(String(20), default='waiting')  # 'waiting', 'performing', 'done'
    instruments = Column(ARRAY(String), default=[])
    custom_instrument = Column(String(100))
    singing_along = Column(Boolean, default=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
