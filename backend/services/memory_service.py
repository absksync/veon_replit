"""
Three-Layered Memory Architecture for Amnesia AI

Memory Layers:
- STM (Short-Term Memory): Recent facts, quickly accessible, temporary
- LTM (Long-Term Memory): Emotionally significant or reinforced moments
- FM (Faded Memory): Decayed memories - vague, uncertain recollections

Memory Properties:
- emotion_score: How emotionally charged (0.0-1.0)
- weight: Memory strength (reinforced through emotion/repetition)
- layer: STM, LTM, or FM
- decay_rate: How quickly memory fades
"""

from datetime import datetime, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
import math
import re

from backend.models.models import UserMemory


class MemoryService:
    """Manages three-layered memory architecture with decay"""
    
    # Memory layer thresholds
    STM_THRESHOLD = 0.7  # Above this weight = Short-Term Memory
    LTM_THRESHOLD = 1.5  # Above this weight = Long-Term Memory (reinforced)
    FM_THRESHOLD = 0.3   # Below this confidence = Faded Memory
    
    # Decay rates (per day) - simulating human forgetting
    INSTANT_DECAY = 24.0   # Ultra-fast decay (time, weather, etc.) - forgotten in 1 hour
    STM_DECAY = 0.25       # Short-term memories fade quickly (what you ate for breakfast)
    LTM_DECAY = 0.01       # Long-term memories persist for lifetime (accidents, trauma, love)
    FM_DECAY = 0.35        # Faded memories disappear very quickly
    
    # Temporary/contextual keywords (forgotten in minutes/hours)
    TEMPORARY_KEYWORDS = [
        'time', 'what time', "what's the time", 'clock', 'hour', 'minute',
        'weather', "what's the weather", 'temperature', 'raining', 'sunny',
        'right now', 'currently', 'at the moment', 'this second', 'this minute',
        'online', 'offline', 'available', 'busy', 'free right now',
        'where are you', 'what are you doing', 'doing right now'
    ]
    
    # Emotional keywords for scoring
    EMOTION_KEYWORDS = {
        'high': [
            # Life-changing events
            'accident', 'crash', 'hospital', 'surgery', 'died', 'death', 'funeral', 'cancer', 
            'disease', 'illness', 'injury', 'hurt', 'pain', 'emergency',
            # Major life events
            'married', 'wedding', 'divorce', 'born', 'baby', 'pregnant', 'graduation', 
            'promoted', 'fired', 'job', 'new job', 'moved', 'moving',
            # Extreme emotions
            'love', 'hate', 'devastated', 'heartbroken', 'betrayed', 'betrayal', 
            'trauma', 'traumatic', 'terrified', 'scared', 'fear', 'nightmare',
            # Family & relationships
            'mom', 'dad', 'mother', 'father', 'parent', 'child', 'son', 'daughter',
            'family', 'grandma', 'grandpa', 'brother', 'sister',
            # Critical moments
            'miracle', 'amazing', 'terrible', 'worst', 'best', 'ever', 'never forget',
            'proposal', 'engaged', 'broke up', 'breakup', 'cheated', 'lost', 'found'
        ],
        'medium': [
            # Moderate emotions
            'happy', 'sad', 'angry', 'upset', 'excited', 'nervous', 'worried', 'anxious',
            'stressed', 'relieved', 'proud', 'disappointed', 'frustrated', 'jealous',
            # Relationships
            'friend', 'girlfriend', 'boyfriend', 'partner', 'colleague', 'boss',
            'date', 'dating', 'relationship', 'crush',
            # Events
            'birthday', 'anniversary', 'celebration', 'party', 'trip', 'vacation',
            'exam', 'test', 'interview', 'meeting', 'project',
            # Moderate life details
            'like', 'dislike', 'enjoy', 'prefer', 'hope', 'wish', 'dream', 'plan',
            'miss', 'remember', 'forget'
        ],
        'low': [
            # Casual/mundane
            'okay', 'fine', 'alright', 'good', 'nice', 'cool', 'sure', 'yeah',
            'maybe', 'sometimes', 'usually', 'often', 'rarely', 'occasionally',
            # Daily activities
            'ate', 'eat', 'breakfast', 'lunch', 'dinner', 'food', 'coffee', 'tea',
            'sleep', 'slept', 'woke', 'shower', 'walk', 'run', 'gym', 'exercise',
            'watch', 'watched', 'movie', 'show', 'game', 'read', 'book',
            'work', 'working', 'study', 'studying', 'homework'
        ]
    }
    
    def __init__(self, db: Session, profile=None):
        self.db = db
        self.profile = profile
        
        # Use profile-specific decay rate or default
        if profile and hasattr(profile, 'memory_decay_rate'):
            self.STM_DECAY = profile.memory_decay_rate
        else:
            self.STM_DECAY = 0.25
    
    def calculate_emotion_score(self, text: str) -> float:
        """
        Analyze text to determine emotional intensity
        Returns: 0.0 (neutral) to 1.0 (highly emotional)
        """
        text_lower = text.lower()
        
        # Count emotional keywords
        high_count = sum(1 for word in self.EMOTION_KEYWORDS['high'] if word in text_lower)
        medium_count = sum(1 for word in self.EMOTION_KEYWORDS['medium'] if word in text_lower)
        low_count = sum(1 for word in self.EMOTION_KEYWORDS['low'] if word in text_lower)
        
        # Exclamation marks add emotion
        exclamation_boost = min(text.count('!') * 0.1, 0.3)
        
        # Question marks show curiosity/concern
        question_boost = min(text.count('?') * 0.05, 0.15)
        
        # Capital letters indicate intensity
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        caps_boost = min(caps_ratio * 0.2, 0.2)
        
        # Calculate base score
        base_score = (
            high_count * 0.3 +
            medium_count * 0.15 +
            low_count * 0.05
        )
        
        # Total emotion score
        emotion_score = min(base_score + exclamation_boost + question_boost + caps_boost, 1.0)
        
        # Ensure minimum of 0.1 for any text
        return max(emotion_score, 0.1)
    
    def is_temporary_info(self, text: str) -> bool:
        """
        Check if the information is temporary/contextual (time, weather, current status)
        These should be forgotten in minutes/hours
        """
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.TEMPORARY_KEYWORDS)
    
    def calculate_decay(self, memory: UserMemory) -> float:
        """
        Calculate memory decay based on time and layer
        Returns: New confidence value
        """
        now = datetime.utcnow()
        time_delta = now - memory.last_accessed
        days_passed = time_delta.total_seconds() / 86400  # Convert to days
        
        # Determine decay rate based on layer
        if memory.layer == "LTM":
            decay_rate = self.LTM_DECAY
        elif memory.layer == "FM":
            decay_rate = self.FM_DECAY
        else:  # STM
            decay_rate = self.STM_DECAY
        
        # Apply custom decay rate if set
        if memory.decay_rate > 0:
            decay_rate = memory.decay_rate
        
        # Exponential decay: confidence = initial * e^(-decay_rate * time)
        new_confidence = memory.confidence * math.exp(-decay_rate * days_passed)
        
        return max(new_confidence, 0.0)
    
    def update_memory_layer(self, memory: UserMemory):
        """
        Update memory layer based on weight and confidence
        """
        # High weight + high confidence = Long-Term Memory
        if memory.weight >= self.LTM_THRESHOLD and memory.confidence > 0.7:
            memory.layer = "LTM"
        
        # Low confidence = Faded Memory
        elif memory.confidence < self.FM_THRESHOLD:
            memory.layer = "FM"
        
        # Normal weight = Short-Term Memory
        elif memory.weight >= self.STM_THRESHOLD:
            memory.layer = "STM"
        
        # Very low weight and confidence = Faded Memory
        else:
            memory.layer = "FM"
    
    def reinforce_memory(self, memory: UserMemory, emotion_boost: float = 0.0):
        """
        Strengthen memory through repetition or emotional significance
        """
        # Increase weight (capped at 3.0)
        memory.weight = min(memory.weight + 0.3 + emotion_boost, 3.0)
        
        # Restore confidence partially
        memory.confidence = min(memory.confidence + 0.2, 1.0)
        
        # Update timestamps
        memory.last_reinforced = datetime.utcnow()
        memory.last_accessed = datetime.utcnow()
        
        # Recalculate layer
        self.update_memory_layer(memory)
    
    def create_memory(
        self,
        profile_id: int,
        user_id: str,
        memory_key: str,
        memory_value: str,
        text_context: str = ""
    ) -> UserMemory:
        """
        Create a new memory with emotional analysis
        """
        # Check if this is temporary/contextual information (time, weather, etc.)
        is_temporary = self.is_temporary_info(text_context or memory_value or memory_key)
        
        # Calculate emotion score from context
        emotion_score = self.calculate_emotion_score(text_context or memory_value)
        
        # TEMPORARY INFO (time, weather, "what are you doing now")
        # These should be forgotten in 20 mins to 1 hour
        if is_temporary:
            initial_weight = 0.3  # Very weak
            layer = "STM"
            decay_rate = self.INSTANT_DECAY  # 24.0 per day = forgotten in 1 hour
            emotion_score = 0.0  # No emotional value
        # HIGH EMOTION (accident, trauma, love) → LTM forever
        elif emotion_score >= 0.7:
            initial_weight = 1.5 + (emotion_score * 0.5)  # 1.5 to 2.0
            layer = "LTM"
            decay_rate = self.LTM_DECAY  # 1% per day - lasts years
        # MEDIUM EMOTION (birthday, friend) → STM for weeks
        elif emotion_score >= 0.4:
            initial_weight = 0.8 + (emotion_score * 0.4)  # 0.8 to 1.2
            layer = "STM"
            decay_rate = self.STM_DECAY * 0.7  # Slower than mundane
        # LOW EMOTION (breakfast, coffee) → STM for days
        else:
            initial_weight = 0.5 + (emotion_score * 0.3)  # 0.5 to 0.7
            layer = "STM"
            decay_rate = self.STM_DECAY  # 25% per day - forgotten in days
        
        memory = UserMemory(
            profile_id=profile_id,
            user_id=user_id,
            memory_key=memory_key,
            memory_value=memory_value,
            emotion_score=emotion_score,
            weight=initial_weight,
            layer=layer,
            decay_rate=decay_rate,
            confidence=1.0
        )
        
        self.db.add(memory)
        return memory
    
    def decay_all_memories(self, profile_id: int, user_id: str):
        """
        Apply decay to all memories for a user
        Run this periodically or before fetching memories
        """
        memories = self.db.query(UserMemory).filter(
            UserMemory.profile_id == profile_id,
            UserMemory.user_id == user_id
        ).all()
        
        for memory in memories:
            # Calculate and apply decay
            new_confidence = self.calculate_decay(memory)
            memory.confidence = new_confidence
            
            # Update layer based on new confidence
            self.update_memory_layer(memory)
            
            # Delete memories that are too faded (confidence < 0.05)
            if memory.confidence < 0.05:
                self.db.delete(memory)
        
        self.db.commit()
    
    def get_layered_memories(
        self,
        profile_id: int,
        user_id: str
    ) -> Dict[str, List[UserMemory]]:
        """
        Get memories organized by layer
        Returns: Dict with keys 'LTM', 'STM', 'FM'
        """
        # Apply decay first
        self.decay_all_memories(profile_id, user_id)
        
        memories = self.db.query(UserMemory).filter(
            UserMemory.profile_id == profile_id,
            UserMemory.user_id == user_id
        ).order_by(UserMemory.weight.desc()).all()
        
        return {
            'LTM': [m for m in memories if m.layer == 'LTM'],
            'STM': [m for m in memories if m.layer == 'STM'],
            'FM': [m for m in memories if m.layer == 'FM']
        }
    
    def format_memories_for_ai(
        self,
        profile_id: int,
        user_id: str
    ) -> str:
        """
        Format memories in a human-readable way for AI context
        """
        layered = self.get_layered_memories(profile_id, user_id)
        
        output = ""
        
        # Long-Term Memories (most certain)
        if layered['LTM']:
            output += "**Long-Term Memories** (Clear & Strong):\n"
            for m in layered['LTM']:
                output += f"  - {m.memory_key}: {m.memory_value} (confident: {m.confidence:.1%})\n"
        
        # Short-Term Memories (recent)
        if layered['STM']:
            output += "\n**Short-Term Memories** (Recent):\n"
            for m in layered['STM']:
                output += f"  - {m.memory_key}: {m.memory_value}\n"
        
        # Faded Memories (vague recollections)
        if layered['FM']:
            output += "\n**Faded Memories** (Vague, Uncertain):\n"
            for m in layered['FM']:
                output += f"  - {m.memory_key}: {m.memory_value}... I think? (fuzzy: {m.confidence:.1%})\n"
        
        return output if output else "No memories yet."
