"""
Voice API Router - Speech-to-Text using Groq Whisper via HTTP API
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import os
import tempfile
import requests

router = APIRouter(prefix="/voice", tags=["voice"])


@router.post("/stt")
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Convert speech to text using Groq Whisper model
    
    Args:
        audio: Audio file (webm, mp3, wav, etc.)
        
    Returns:
        JSON with transcribed text
    """
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = await audio.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        print(f"🎤 Transcribing audio file: {temp_file_path}")
        
        # Transcribe using Groq Whisper API directly
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not configured")
        
        with open(temp_file_path, "rb") as audio_file:
            files = {
                "file": (audio.filename or "audio.webm", audio_file, "audio/webm"),
            }
            data = {
                "model": "whisper-large-v3-turbo",
                # For Indian Hinglish: transcribe phonetically in Roman/Latin script
                # Whisper will output: "Yaar", "Aaj", "Kya", "Bahut" etc.
                "response_format": "verbose_json",
                "temperature": 0.0,
                # Prompt with Romanized Hindi words to bias toward Roman script output
                "prompt": "Yaar kya haal hai boss aaj bahut acha scene tha bhai matlab ekdum mast"
            }
            headers = {
                "Authorization": f"Bearer {groq_api_key}"
            }
            
            response = requests.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                files=files,
                data=data,
                headers=headers
            )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        if response.status_code != 200:
            print(f"❌ Groq API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail=f"Groq API error: {response.text}")
        
        # Extract text from response
        result = response.json()
        transcribed_text = result.get("text", "")
        detected_language = result.get("language", "unknown")
        
        print(f"✅ Transcription ({detected_language}): {transcribed_text}")
        
        return JSONResponse(content={
            "text": transcribed_text,
            "language": detected_language,
            "success": True
        })
        
    except Exception as e:
        print(f"❌ Transcription error: {e}")
        # Clean up temp file if it exists
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.get("/test")
async def test_voice_endpoint():
    """Test endpoint to verify voice router is working"""
    return {"message": "Voice router is working!", "groq_configured": bool(os.getenv("GROQ_API_KEY"))}
