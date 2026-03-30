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

        # Track unique song_ids for admin_allowed_song
        processed_song_ids = set()

        for idx, row in enumerate(rows):
            # Skip empty rows
            if not row or len(row) < 2 or not row[0].strip():
                continue

            raw_title = row[0].strip()
            raw_artist = row[1].strip() if len(row) > 1 and row[1] else ""

            try:
                # Find or create song
                song_id = self._find_or_create_song(
                    db=db,
                    title=raw_title,
                    artist=raw_artist
                )

                # Track song_id for admin_allowed_song
                processed_song_ids.add(song_id)

                # Create song_list_item
                song_list_item = models.SongListItemModel(
                    song_list_id=song_list.song_list_id,
                    song_id=song_id,
                    raw_title=raw_title,
                    raw_artist=raw_artist
                )
                db.add(song_list_item)

                results['processed'] += 1
                results['added'] += 1

            except Exception as e:
                # Track error but continue processing
                results['errors'].append({
                    'row': idx + 1,
                    'title': raw_title,
                    'artist': raw_artist,
                    'error': str(e)
                })

        # Commit all song_list_items
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

    def _find_or_create_song(self, db: Session, title: str, artist: str) -> int:
        """
        Find existing song or create new one.

        Args:
            db: Database session
            title: Song title
            artist: Artist name

        Returns:
            song_id of existing or newly created song

        Raises:
            Exception if song cannot be created
        """
        # Try to find existing song (case-insensitive)
        existing_song = db.query(models.SongModel).filter(
            models.SongModel.song_title.ilike(title),
            models.SongModel.artist.ilike(artist)
        ).first()

        if existing_song:
            return existing_song.song_id

        # Create new song
        new_song = models.SongModel(
            song_title=title,
            artist=artist
        )
        db.add(new_song)
        db.flush()  # Flush to get the ID without committing

        return new_song.song_id

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

        # Create new admin_allowed_song entries
        for song_id in new_song_ids:
            admin_allowed_song = models.AdminAllowedSongModel(
                admin_user_id=admin_user_id,
                song_id=song_id
            )
            db.add(admin_allowed_song)

        # Commit the new allowed songs
        db.commit()
