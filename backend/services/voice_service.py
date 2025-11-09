import os
import uuid
import json
from typing import Optional, List
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs


class VoiceService:
    def __init__(self):
        """Initialize ElevenLabs TTS service"""
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            print("⚠️  Warning: ELEVENLABS_API_KEY not found in .env file")
            self.client = None
        else:
            self.client = ElevenLabs(api_key=api_key)
            print("✅ ElevenLabs voice cloning enabled!")
        
        # Cache for cloned voice IDs
        self.voice_cache = {}
    
    def _initialize_tts(self):
        """No additional initialization needed for ElevenLabs"""
        pass
    
    def delete_cloned_voice(self, profile_id: int, speaker_wav: str = None):
        """Delete a cloned voice from ElevenLabs and cache"""
        cache_key = f"{profile_id}_{speaker_wav}" if speaker_wav else None
        
        # Remove from cache
        if cache_key and cache_key in self.voice_cache:
            voice_id = self.voice_cache[cache_key]
            try:
                if self.client:
                    self.client.voices.delete(voice_id)
                    print(f"🗑️  Deleted voice ID: {voice_id}")
            except Exception as e:
                print(f"⚠️  Could not delete voice: {e}")
            del self.voice_cache[cache_key]
        
        # Clear all cached voices for this profile
        keys_to_delete = [k for k in self.voice_cache.keys() if k.startswith(f"{profile_id}_")]
        for key in keys_to_delete:
            voice_id = self.voice_cache[key]
            try:
                if self.client:
                    self.client.voices.delete(voice_id)
            except:
                pass
            del self.voice_cache[key]
    
    def _get_or_create_cloned_voice(self, speaker_wav: str, profile_id: int, force_recreate: bool = False) -> Optional[str]:
        """
        Upload audio sample(s) to ElevenLabs and get a cloned voice ID
        Supports multiple audio samples for better voice cloning
        
        Args:
            speaker_wav: Path to audio file OR JSON array of paths
            profile_id: Profile ID for naming the voice
            force_recreate: Force recreation of voice even if cached
            
        Returns:
            voice_id string or None
        """
        if not self.client:
            return None
        
        # Parse audio files (single or multiple)
        audio_files = []
        try:
            # Try to parse as JSON array
            parsed = json.loads(speaker_wav)
            if isinstance(parsed, list):
                audio_files = [f for f in parsed if os.path.exists(f)]
            else:
                audio_files = [speaker_wav] if os.path.exists(speaker_wav) else []
        except:
            # Not JSON, treat as single file
            if os.path.exists(speaker_wav):
                audio_files = [speaker_wav]
        
        if not audio_files:
            print("⚠️  No valid audio files found")
            return None
        
        # Check cache first (unless force recreate)
        cache_key = f"{profile_id}_{speaker_wav}"
        if not force_recreate and cache_key in self.voice_cache:
            print(f"🎯 Using cached voice ID: {self.voice_cache[cache_key]}")
            return self.voice_cache[cache_key]
        
        # If force recreate, delete old voice first
        if force_recreate:
            self.delete_cloned_voice(profile_id, speaker_wav)
        
        try:
            print(f"🎤 Creating HIGH-QUALITY cloned voice from {len(audio_files)} sample(s)")
            for i, f in enumerate(audio_files, 1):
                print(f"   📁 Sample {i}: {os.path.basename(f)}")
            
            # Read all audio files
            audio_bytes_list = []
            for audio_file in audio_files:
                with open(audio_file, 'rb') as f:
                    audio_bytes_list.append(f.read())
            
            print(f"   🔬 Total samples: {len(audio_bytes_list)} (more samples = better accent cloning!)")
            
            # Create a new voice using voice cloning with multiple samples
            voice = self.client.voices.add(
                name=f"Profile_{profile_id}_Voice_V2",
                description="Professional voice clone with Indian accent - Multiple samples for accuracy",
                files=audio_bytes_list,  # Multiple audio samples!
                labels={
                    "accent": "indian",
                    "use_case": "conversational",
                    "language": "english", 
                    "quality": "professional",
                    "samples": str(len(audio_bytes_list))
                },
                remove_background_noise=True
            )
            
            voice_id = voice.voice_id
            print(f"✅ Voice cloned successfully with {len(audio_bytes_list)} samples! ID: {voice_id}")
            print(f"   📊 Enhanced with: Indian accent labels, {len(audio_bytes_list)}x audio diversity")
            
            # Cache the voice ID
            self.voice_cache[cache_key] = voice_id
            
            return voice_id
            
        except Exception as e:
            print(f"❌ Voice cloning error: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    async def generate_speech(
        self,
        text: str,
        speaker_wav: str,
        profile_id: int
    ) -> Optional[str]:
        """
        Generate speech using ElevenLabs voice cloning
        
        Args:
            text: Text to convert to speech
            speaker_wav: Path to reference audio file for voice cloning
            profile_id: AI profile ID for organizing output files
        
        Returns:
            URL path to generated audio file, or None if generation failed
        """
        if not self.client:
            print("⚠️  ElevenLabs client not initialized")
            return None
            
        try:
            # Generate unique filename
            filename = f"profile_{profile_id}_{uuid.uuid4()}.mp3"
            output_path = f"backend/static/audio/generated/{filename}"
            
            # Ensure directory exists
            os.makedirs("backend/static/audio/generated", exist_ok=True)
            
            # Determine which voice to use
            voice_id = None
            
            # Check if we have a voice sample to clone from
            if speaker_wav and os.path.exists(speaker_wav):
                print(f"🎤 Attempting to clone voice from: {speaker_wav}")
                voice_id = self._get_or_create_cloned_voice(speaker_wav, profile_id)
            
            # If no voice cloning or it failed, use default high-quality voice based on profile
            if not voice_id:
                # Map profile IDs to appropriate ElevenLabs voices with Indian/Hinglish accents
                # Using multilingual model for better accent support
                voice_map = {
                    # Priya - Young college girl, bubbly, friendly (Female, Indian accent)
                    # Using custom voice from ElevenLabs
                    1: ("1zUSi8LeHs9M2mV8X6YS", "Priya - Custom Indian Female Voice"),
                    
                    # Arjun - Fitness enthusiast, energetic, motivational (Male, deeper voice, Indian accent)
                    # Using Clyde - strong, confident male (multilingual)
                    2: ("2EiwWnXFnvU5JabPnv8n", "Arjun - Male, Deep, Motivational, Indian accent"),
                    
                    # Maya - Artist, soft, thoughtful, poetic (Female, gentle, Indian accent)
                    # Using Grace - calm, soft female (multilingual)
                    3: ("oWAxZDx7w5VEj9dCyTzz", "Maya - Soft Female, Artistic, Indian accent"),
                    
                    # Rohan - Tech geek, young, casual (Male, friendly, Indian accent)
                    # Using custom voice from ElevenLabs
                    4: ("nZrzehiJO7UYXi9GOxS8", "Rohan - Custom Indian Male Voice")
                }
                
                if profile_id in voice_map:
                    voice_id, voice_name = voice_map[profile_id]
                    print(f"🔊 Using ElevenLabs voice: {voice_name}")
                else:
                    # Default fallback
                    voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel
                    print("🔊 Using default ElevenLabs voice (Rachel)")
            
            # Generate speech with the selected voice
            print(f"🎙️  Generating speech with voice ID: {voice_id}")
            audio_generator = self.client.text_to_speech.convert(
                voice_id=voice_id,
                optimize_streaming_latency="0",
                output_format="mp3_44100_128",
                text=text,
                model_id="eleven_multilingual_v2",
                voice_settings=VoiceSettings(
                    stability=0.3,  # Lower stability for more natural accent variation
                    similarity_boost=0.95,  # Maximum similarity for accent preservation
                    style=0.5,  # Add some style variation for naturalness
                    use_speaker_boost=True  # Enhance speaker characteristics including accent
                )
            )
            
            # Save the audio
            with open(output_path, 'wb') as f:
                for chunk in audio_generator:
                    if chunk:
                        f.write(chunk)
            
            print(f"✅ Generated voice: {output_path}")
            # Return URL path
            return f"/static/audio/generated/{filename}"
        
        except Exception as e:
            print(f"❌ Voice generation error: {e}")
            return None
    
    async def generate_speech_without_cloning(self, text: str, profile_id: int) -> Optional[str]:
        """Generate speech with ElevenLabs default voice"""
        return await self.generate_speech(text, "", profile_id)
