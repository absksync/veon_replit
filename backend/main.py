from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
import sys
from dotenv import load_dotenv

# Add parent directory to path to fix imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, get_db, Base
from backend.routers import profiles, chat, memories, voice
# Import models so they're registered with Base before create_all()
from backend.models import models

load_dotenv()

# Create database tables (models must be imported first!)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Amnesia AI API",
    description="AI chatbot profiles with emotional intelligence and voice cloning",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000"],  # Vite ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Include routers
app.include_router(profiles.router, prefix="/api/profiles", tags=["AI Profiles"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(memories.router, prefix="/api/memories", tags=["Memories"])
app.include_router(voice.router, tags=["Voice"])

@app.get("/")
async def root():
    return {
        "message": "🧠 Amnesia AI - The AI That Forgets to Feel Alive",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False, log_level="debug")
