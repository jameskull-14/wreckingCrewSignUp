import os
import builtins

# Disable all print logging in production
if os.getenv("ENVIRONMENT", "development").lower() == "production" and os.getenv("ENABLE_LOGGING", "false").lower() != "true":
    def noop(*args, **kwargs):
        pass
    builtins.print = noop

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import (
    auth,
    songs,
    performer_song_selections,
    admin_allowed_songs,
    admin_users,
    performers,
    admin_user_settings,
    sessions,
    session_songs,
    websockets,
    song_lists,
    song_list_items,
    session_song_lists
)


# Create database tables
Base.metadata.create_all(bind=engine)

# start the fastAPI
app = FastAPI(title="My FastAPI Backend", redirect_slashes=False)

# CORS - Allow React frontend to connect
import os

# Allow both local development and production domains
allowed_origins = [
    "http://localhost:5173",  # Local Vite dev server
    "http://localhost:5174",  # Alternative local port
]

# Add production frontend URL from environment variable
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(songs.router)
app.include_router(performer_song_selections.router)
app.include_router(admin_allowed_songs.router)
app.include_router(admin_users.router)
app.include_router(performers.router)
app.include_router(admin_user_settings.router)
app.include_router(sessions.router)
app.include_router(session_songs.router)
app.include_router(websockets.router)
app.include_router(song_lists.router)
app.include_router(song_list_items.router)
app.include_router(session_song_lists.router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!", "status": "running"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}