from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from database import Base


class SongModel(Base):
    __tablename__ = "song"
    __table_args__ = {'schema': 'public'}

    song_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    song_title = Column(String(255), nullable=False, index=True)
    artist = Column(String(255), nullable=False, index=True)
    genre = Column(String(100), nullable=True)
    year_released = Column(Integer, nullable=True)
    verified = Column(Boolean, default=False, index=True)

    # Relationships
    admin_allowed_songs = relationship("AdminAllowedSongModel", back_populates="song")
    performer_song_selections = relationship("PerformerSongSelectionModel", back_populates="song")
    session_songs = relationship("SessionSongModel", back_populates="song")
    song_list_items = relationship("SongListItemModel", back_populates="song")
