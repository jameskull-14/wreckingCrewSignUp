from models import SongModel
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Tuple


class CreateSongService:

    def does_song_exist(self, db: Session, artist: str, song_title: str) -> bool:
        """
        Check if a song already exists in the database.

        Queries the database to determine if a song with the given title
        and artist combination already exists.

        Args:
            db: Database session
            artist: The artist name
            song_title: The song title

        Returns:
            True if the song exists, False otherwise
        """
        # query if the song exists
        existing_song = db.query(SongModel).filter(
            SongModel.song_title == song_title,
            SongModel.artist == artist
        ).first()

        return existing_song is not None

    def filter_new_songs(self, db: Session, songs_to_check: list) -> Tuple[list, List[Tuple[str, str]]]:
        """
        Filter out songs that already exist in the database

        Args:
            db: Database session
            songs_to_check: List of song objects (with .title and .artist attributes)

        Returns:
            Tuple of (songs_to_create, existing_songs)
            - songs_to_create: List of new song objects to insert
            - existing_songs: List of (title, artist) tuples that already exist
        """
        if not songs_to_check:
            return [], []

        # Build a query with OR conditions for each song
        song_tuples = [(song.title, song.artist) for song in songs_to_check]
        conditions = [
            and_(
                SongModel.song_title == title,
                SongModel.artist == artist
            )
            for title, artist in song_tuples
        ]

        # Single query to find all existing songs
        existing_songs_db = db.query(
            SongModel.song_title,
            SongModel.artist
        ).filter(or_(*conditions)).all()

        # Convert to set for fast lookup
        existing_set = {(song.song_title, song.artist) for song in existing_songs_db}

        # Filter songs: only keep new ones
        songs_to_create = [
            song for song in songs_to_check
            if (song.title, song.artist) not in existing_set
        ]

        # Return existing as list of tuples
        existing_songs = list(existing_set)

        return songs_to_create, existing_songs

