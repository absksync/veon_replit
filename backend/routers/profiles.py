from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import shutil
import os
import uuid
import json

from backend.database import get_db
from backend.models.models import AIProfile, Scene

router = APIRouter()

# Pydantic schemas
class AIProfileCreate(BaseModel):
    name: str
    creator_username: str
    description: str = ""
    personality_prompt: str
    avatar_url: str = ""
    pratfall_probability: float = 0.15

class AIProfileResponse(BaseModel):
    id: int
    name: str
    creator_username: str
    description: str
    personality_prompt: str
    avatar_url: str
    voice_file_path: Optional[str] = None
    pratfall_probability: float
    memory_decay_rate: float
    recall_depth: int
    emotion_weight: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class SceneCreate(BaseModel):
    title: str
    description: str
    scenario_prompt: str
    thumbnail_url: str = ""

class SceneResponse(BaseModel):
    id: int
    title: str
    description: str
    scenario_prompt: str
    thumbnail_url: str
    
    class Config:
        from_attributes = True


@router.post("/", response_model=AIProfileResponse)
async def create_profile(profile: AIProfileCreate, db: Session = Depends(get_db)):
    """Create a new AI profile"""
    db_profile = AIProfile(**profile.model_dump())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/", response_model=List[AIProfileResponse])
async def list_profiles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all AI profiles"""
    profiles = db.query(AIProfile).offset(skip).limit(limit).all()
    return profiles

@router.get("/{profile_id}", response_model=AIProfileResponse)
async def get_profile(profile_id: int, db: Session = Depends(get_db)):
    """Get a specific AI profile"""
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/{profile_id}", response_model=AIProfileResponse)
async def update_profile(profile_id: int, profile_update: AIProfileCreate, db: Session = Depends(get_db)):
    """Update an AI profile"""
    db_profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    for key, value in profile_update.model_dump().items():
        setattr(db_profile, key, value)
    
    db_profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.delete("/{profile_id}")
async def delete_profile(profile_id: int, db: Session = Depends(get_db)):
    """Delete an AI profile"""
    db_profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not db_profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db.delete(db_profile)
    db.commit()
    return {"message": "Profile deleted successfully"}

@router.post("/{profile_id}/upload-voice")
async def upload_voice_sample(
    profile_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload voice sample for tone cloning - can upload multiple samples for better cloning"""
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Validate file type
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_extension}"
    file_path = f"backend/static/audio/{filename}"
    
    # Ensure directory exists
    os.makedirs("backend/static/audio", exist_ok=True)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Load existing voice samples or create new list
    existing_samples = []
    if profile.voice_file_path:
        try:
            existing_samples = json.loads(profile.voice_file_path)
            if not isinstance(existing_samples, list):
                existing_samples = [profile.voice_file_path]
        except:
            existing_samples = [profile.voice_file_path] if profile.voice_file_path else []
    
    # Add new sample
    existing_samples.append(file_path)
    
    # Store as JSON array
    profile.voice_file_path = json.dumps(existing_samples)
    db.commit()
    
    return {
        "message": f"Voice sample {len(existing_samples)} uploaded successfully!",
        "total_samples": len(existing_samples),
        "samples": existing_samples,
        "tip": "Upload 3-5 samples (each 10-30 seconds) for BEST Indian accent cloning! Different sentences help capture your voice better."
    }

@router.post("/{profile_id}/reclone-voice")
async def reclone_voice(profile_id: int, db: Session = Depends(get_db)):
    """Force re-clone the voice with current audio sample(s) - Use after uploading all samples"""
    from backend.services.voice_service import VoiceService
    
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    if not profile.voice_file_path:
        raise HTTPException(status_code=400, detail="No voice samples uploaded")
    
    voice_service = VoiceService()
    
    # Delete old cloned voice and recreate
    voice_service.delete_cloned_voice(profile_id, profile.voice_file_path)
    
    # Create new voice with force_recreate flag
    voice_id = voice_service._get_or_create_cloned_voice(
        profile.voice_file_path, 
        profile_id, 
        force_recreate=True
    )
    
    if voice_id:
        # Count samples
        try:
            samples = json.loads(profile.voice_file_path)
            sample_count = len(samples) if isinstance(samples, list) else 1
        except:
            sample_count = 1
            
        return {
            "message": f"Voice re-cloned successfully with {sample_count} sample(s)!",
            "voice_id": voice_id,
            "samples_used": sample_count,
            "settings": "Indian accent, conversational style, professional quality"
        }
    else:
        raise HTTPException(status_code=500, detail="Voice cloning failed")

@router.delete("/{profile_id}/clear-voice-samples")
async def clear_voice_samples(profile_id: int, db: Session = Depends(get_db)):
    """Clear all voice samples and start fresh"""
    from backend.services.voice_service import VoiceService
    
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    # Delete cloned voice from ElevenLabs
    if profile.voice_file_path:
        voice_service = VoiceService()
        voice_service.delete_cloned_voice(profile_id, profile.voice_file_path)
        
        # Delete audio files
        try:
            samples = json.loads(profile.voice_file_path)
            if isinstance(samples, list):
                for sample in samples:
                    if os.path.exists(sample):
                        os.remove(sample)
            elif os.path.exists(profile.voice_file_path):
                os.remove(profile.voice_file_path)
        except:
            if os.path.exists(profile.voice_file_path):
                os.remove(profile.voice_file_path)
    
    profile.voice_file_path = None
    db.commit()
    
    return {"message": "All voice samples cleared. Upload new samples for better accent cloning!"}

@router.post("/{profile_id}/scenes", response_model=SceneResponse)
async def create_scene(profile_id: int, scene: SceneCreate, db: Session = Depends(get_db)):
    """Create a new scene/roleplay scenario for this AI"""
    profile = db.query(AIProfile).filter(AIProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    db_scene = Scene(profile_id=profile_id, **scene.model_dump())
    db.add(db_scene)
    db.commit()
    db.refresh(db_scene)
    return db_scene

@router.get("/{profile_id}/scenes", response_model=List[SceneResponse])
async def list_scenes(profile_id: int, db: Session = Depends(get_db)):
    """List all scenes for this AI profile"""
    scenes = db.query(Scene).filter(Scene.profile_id == profile_id).all()
    return scenes
