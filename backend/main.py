from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
import models
from routers import songs, admin_time_slots, public


# Create database tables
Base.metadata.create_all(bind=engine)

# start the fastAPI 
app = FastAPI(title="My FastAPI Backend")

# CORS - Allow React frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(songs.router)
app.include_router(admin_time_slots.router)
app.include_router(public.router)

# Root endpoint
@app.get("/")
def read_root():
    return {"message": "Welcome to FastAPI!", "status": "running"}

# Health check
@app.get("/health")
def health_check():
    return {"status": "healthy"}