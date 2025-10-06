from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="My FastAPI Backend")

# CORS - Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!", "status": "running"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# Get all users
@app.get("/api/songs")
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.Songs).all()
    return users

# Get single song
@app.get("/api/songs/{song_id}")
def get_song(song_id: int, db: Session = Depends(get_db)):
    song = db.query(models.Songs).filter(models.Songs.Id == song_id).first()
    if not song:
        raise HTTPException(status_code=404, detail="Song not found")
    return song

# Create Song
@app.post("/api/songs")
def create_song(song: str, artist: str, db: Session = Depends(get_db)):
    new_song = models.Songs(Song=song, Artist=artist)
    db.add(new_song)
    db.commit()
    db.refresh(new_song)
    return new_song