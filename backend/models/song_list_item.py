from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class SongListItemModel(Base):
    __tablename__ = "song_list_item"
    __table_args__ = {'schema': 'public'}

    item_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    song_list_id = Column(Integer, ForeignKey('public.song_list.song_list_id', ondelete='CASCADE'), nullable=False, index=True)
    song_id = Column(Integer, ForeignKey('public.song.song_id', ondelete='CASCADE'), nullable=False, index=True)
    raw_title = Column(String(255), nullable=False)
    raw_artist = Column(String(255), nullable=True)

    # Relationships
    song_list = relationship("SongListModel", back_populates="song_list_items")
    song = relationship("SongModel", back_populates="song_list_items")
