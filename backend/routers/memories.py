from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

from backend.database import get_db
from backend.models.models import UserMemory
from backend.services.memory_service import MemoryService

router = APIRouter()

class MemoryResponse(BaseModel):
    id: int
    memory_key: str
    memory_value: str
    emotion_score: float
    weight: float
    layer: str
    decay_rate: float
    confidence: float
    last_accessed: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True


@router.get("/{profile_id}/{user_id}", response_model=List[MemoryResponse])
async def get_memories(profile_id: int, user_id: str, db: Session = Depends(get_db)):
    """Get all memories the AI has about this user (with decay applied)"""
    memory_service = MemoryService(db)
    
    # Apply decay before returning
    memory_service.decay_all_memories(profile_id, user_id)
    
    memories = db.query(UserMemory).filter(
        UserMemory.profile_id == profile_id,
        UserMemory.user_id == user_id
    ).order_by(UserMemory.weight.desc()).all()
    
    return memories


@router.get("/{profile_id}/{user_id}/layered")
async def get_layered_memories(profile_id: int, user_id: str, db: Session = Depends(get_db)):
    """Get memories organized by layer (LTM, STM, FM)"""
    memory_service = MemoryService(db)
    layered = memory_service.get_layered_memories(profile_id, user_id)
    
    return {
        "long_term": [MemoryResponse.model_validate(m) for m in layered['LTM']],
        "short_term": [MemoryResponse.model_validate(m) for m in layered['STM']],
        "faded": [MemoryResponse.model_validate(m) for m in layered['FM']]
    }


@router.delete("/{memory_id}")
async def delete_memory(memory_id: int, db: Session = Depends(get_db)):
    """Delete a specific memory"""
    memory = db.query(UserMemory).filter(UserMemory.id == memory_id).first()
    if not memory:
        raise HTTPException(status_code=404, detail="Memory not found")
    
    db.delete(memory)
    db.commit()
    return {"message": "Memory deleted"}


@router.delete("/{profile_id}/{user_id}/all")
async def clear_all_memories(profile_id: int, user_id: str, db: Session = Depends(get_db)):
    """Clear all memories for a user with a specific AI profile"""
    db.query(UserMemory).filter(
        UserMemory.profile_id == profile_id,
        UserMemory.user_id == user_id
    ).delete()
    db.commit()
    return {"message": "All memories cleared"}
