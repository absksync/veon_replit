from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

from backend.database import get_db
from backend.models.models import ChatMessage, AIProfile, UserMemory
from backend.services.ai_service import AIService
from backend.services.voice_service import VoiceService

router = APIRouter()

class ChatRequest(BaseModel):
    profile_id: int
    user_id: str
    message: str
    scene_id: Optional[int] = None

class ChatResponse(BaseModel):
    id: int
    role: str
    content: str
    audio_url: Optional[str] = None
    is_pratfall: bool
    timestamp: datetime
    
    class Config:
        from_attributes = True


@router.post("/send", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    """Send a message to the AI and get a response"""
    
    # Get AI profile
    profile = db.query(AIProfile).filter(AIProfile.id == request.profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="AI Profile not found")
    
    # Save user message
    user_message = ChatMessage(
        profile_id=request.profile_id,
        user_id=request.user_id,
        role="user",
        content=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Get conversation history
    history = db.query(ChatMessage).filter(
        ChatMessage.profile_id == request.profile_id,
        ChatMessage.user_id == request.user_id
    ).order_by(ChatMessage.timestamp.desc()).limit(10).all()
    history.reverse()
    
    # Initialize AI service with database session
    ai_service = AIService(profile, db)
    
    # Decide if this is a "pratfall" moment
    is_pratfall = random.random() < profile.pratfall_probability
    
    # Generate response
    response_text = await ai_service.generate_response(
        request.message,
        history,
        request.user_id,
        is_pratfall=is_pratfall,
        scene_id=request.scene_id
    )
    
    # Generate voice response (uses default ElevenLabs voice if no custom voice)
    audio_url = None
    try:
        voice_service = VoiceService()
        audio_url = await voice_service.generate_speech(
            response_text,
            profile.voice_file_path or "",  # Empty string will use default voice
            profile.id
        )
    except Exception as e:
        print(f"⚠️ Voice generation failed: {e}")
    
    # Save AI response
    ai_message = ChatMessage(
        profile_id=request.profile_id,
        user_id=request.user_id,
        role="assistant",
        content=response_text,
        audio_url=audio_url,
        is_pratfall=is_pratfall
    )
    db.add(ai_message)
    db.commit()
    db.refresh(ai_message)
    
    # Extract and save new memories with emotional analysis
    await ai_service.extract_memories(request.message, request.user_id)
    
    return ai_message


@router.get("/history/{profile_id}/{user_id}", response_model=List[ChatResponse])
async def get_chat_history(
    profile_id: int,
    user_id: str,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get chat history for a user with a specific AI profile"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.profile_id == profile_id,
        ChatMessage.user_id == user_id
    ).order_by(ChatMessage.timestamp.desc()).limit(limit).all()
    
    messages.reverse()
    return messages


@router.delete("/history/{profile_id}/{user_id}")
async def clear_chat_history(profile_id: int, user_id: str, db: Session = Depends(get_db)):
    """Clear all chat history for a user with a specific AI profile"""
    db.query(ChatMessage).filter(
        ChatMessage.profile_id == profile_id,
        ChatMessage.user_id == user_id
    ).delete()
    db.commit()
    return {"message": "Chat history cleared"}
