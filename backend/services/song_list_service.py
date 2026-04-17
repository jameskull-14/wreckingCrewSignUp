import csv
import io
from typing import Dict, List, Tuple
from sqlalchemy.orm import Session
from fastapi import UploadFile
import models


class SongListService:
    """Service for handling song list uploads and CSV processing."""

    async def process_csv_upload(
        self,
        file: UploadFile,
        admin_user_id: int,
        list_name: str,
        db: Session
    ) -> Dict:
        """
        Process CSV file upload and create song list with items.

        Args:
            file: Uploaded CSV file
            admin_user_id: ID of the admin user creating the list
            list_name: Name for the song list
            db: Database session

        Returns:
            Dictionary with upload results including counts and any errors
        """
        # Read and parse CSV
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        csv_reader = csv.reader(io.StringIO(csv_data))

        # Skip header row if present (optional - we'll detect)
        rows = list(csv_reader)

        # Detect and skip header
        if rows and self._is_header_row(rows[0]):
            rows = rows[1:]

        # Create song_list record
        song_list = models.SongListModel(
            admin_user_id=admin_user_id,
            list_name=list_name,
            original_filename=file.filename
        )
        db.add(song_list)
        db.commit()
        db.refresh(song_list)

        # Process each song
        results = {
            'total': len(rows),
            'processed': 0,
            'added': 0,
            'errors': [],
            'list_id': song_list.song_list_id
        }

        # Parse all CSV rows first
        csv_songs = []
        for idx, row in enumerate(rows):
            # Skip empty rows
            if not row or len(row) < 2 or not row[0].strip():
                continue

            raw_title = row[0].strip()
            raw_artist = row[1].strip() if len(row) > 1 and row[1] else ""

            csv_songs.append({
                'idx': idx,
                'title': raw_title,
                'artist': raw_artist
            })

        # Bulk find or create all songs
        song_map = self._bulk_find_or_create_songs(db, csv_songs)

        # Track unique song_ids for admin_allowed_song
        processed_song_ids = set()

        # Bulk create song_list_items
        song_list_items = []
        for song_data in csv_songs:
            try:
                song_id = song_map[(song_data['title'].lower(), song_data['artist'].lower())]
                processed_song_ids.add(song_id)

                song_list_items.append(models.SongListItemModel(
                    song_list_id=song_list.song_list_id,
                    song_id=song_id,
                    raw_title=song_data['title'],
                    raw_artist=song_data['artist']
                ))

                results['processed'] += 1
                results['added'] += 1

            except Exception as e:
                # Track error but continue processing
                results['errors'].append({
                    'row': song_data['idx'] + 1,
                    'title': song_data['title'],
                    'artist': song_data['artist'],
                    'error': str(e)
                })

        # Bulk insert all song_list_items
        db.bulk_save_objects(song_list_items)
        db.commit()

        # Add all processed songs to admin_allowed_song
        self._add_songs_to_admin_allowed(db, admin_user_id, processed_song_ids)

        return results

    def _is_header_row(self, row: List[str]) -> bool:
        """
        Detect if a row is likely a header row.

        Args:
            row: CSV row to check

        Returns:
            True if row appears to be a header
        """
        if not row or len(row) < 2:
            return False

        # Common header keywords
        headers = ['title', 'song', 'name', 'artist', 'performer', 'singer']
        first_col = row[0].lower().strip()
        second_col = row[1].lower().strip()

        return any(header in first_col for header in headers) or \
               any(header in second_col for header in headers)

    def _bulk_find_or_create_songs(self, db: Session, csv_songs: List[Dict]) -> Dict[Tuple[str, str], int]:
        """
        Bulk find or create songs from CSV data.

        Args:
            db: Database session
            csv_songs: List of dicts with 'title' and 'artist' keys

        Returns:
            Dictionary mapping (title.lower(), artist.lower()) to song_id
        """
        if not csv_songs:
            return {}

        # Get unique songs from CSV (case-insensitive deduplication)
        unique_songs = {}
        for song in csv_songs:
            key = (song['title'].lower(), song['artist'].lower())
            if key not in unique_songs:
                unique_songs[key] = {'title': song['title'], 'artist': song['artist']}

        # Query all existing songs in one go (case-insensitive)
        from sqlalchemy import func, tuple_

        # Build case-insensitive lookup
        song_pairs = [(s['title'], s['artist']) for s in unique_songs.values()]

        existing_songs = db.query(
            func.lower(models.SongModel.song_title).label('title_lower'),
            func.lower(models.SongModel.artist).label('artist_lower'),
            models.SongModel.song_id
        ).filter(
            tuple_(func.lower(models.SongModel.song_title), func.lower(models.SongModel.artist)).in_(
                [(t.lower(), a.lower()) for t, a in song_pairs]
            )
        ).all()

        # Map existing songs
        song_map = {}
        for row in existing_songs:
            song_map[(row.title_lower, row.artist_lower)] = row.song_id

        # Find songs that need to be created
        songs_to_create = []
        for key, song_data in unique_songs.items():
            if key not in song_map:
                songs_to_create.append(models.SongModel(
                    song_title=song_data['title'],
                    artist=song_data['artist']
                ))

        # Bulk insert new songs
        if songs_to_create:
            db.bulk_save_objects(songs_to_create, return_defaults=True)
            db.flush()

            # Add newly created songs to the map
            for song in songs_to_create:
                key = (song.song_title.lower(), song.artist.lower())
                song_map[key] = song.song_id

        return song_map

    def _add_songs_to_admin_allowed(self, db: Session, admin_user_id: int, song_ids: set) -> None:
        """
        Add songs to admin_allowed_song table if they don't already exist.

        Args:
            db: Database session
            admin_user_id: ID of the admin user
            song_ids: Set of song_ids to add
        """
        if not song_ids:
            return

        # Get existing allowed songs for this admin
        existing_allowed = db.query(models.AdminAllowedSongModel.song_id).filter(
            models.AdminAllowedSongModel.admin_user_id == admin_user_id,
            models.AdminAllowedSongModel.song_id.in_(song_ids)
        ).all()

        existing_song_ids = {row.song_id for row in existing_allowed}

        # Filter out songs that are already allowed
        new_song_ids = song_ids - existing_song_ids

        # Bulk create new admin_allowed_song entries
        if new_song_ids:
            allowed_songs = [
                models.AdminAllowedSongModel(
                    admin_user_id=admin_user_id,
                    song_id=song_id
                )
                for song_id in new_song_ids
            ]
            db.bulk_save_objects(allowed_songs)

        # Commit the new allowed songs
        db.commit()
