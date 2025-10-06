from sqlalchemy import Column, Integer, String, Text
from database import Base

class Songs(Base):
    __tablename__ = "Songs"
    __table_args__ = {'schema': 'public'}

    Id = Column(Integer, primary_key=True, index=True)
    Song = Column(String(100))
    Artist = Column(String(100))
    Genre = Column(String(100))
