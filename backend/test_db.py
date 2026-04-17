from database import SessionLocal
from models import Songs

# Create a database session
db = SessionLocal()

try:
    # Run a simple query to get all songs
    songs = db.query(Songs).all()

    print(f"✓ Database connection successful!")
    print(f"✓ Found {len(songs)} songs in the database")

    # Print the songs if any exist
    if songs:
        print("\nSongs in database:")
        for song in songs:
            print(f"  - ID: {song.Id}, Song: {song.Song}, Artist: {song.Artist}, Genre: {song.Genre}")
    else:
        print("\nNo songs in database yet.")

except Exception as e:
    print(f"✗ Database connection failed: {e}")

finally:
    db.close()
