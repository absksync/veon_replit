# VEON Backend Setup & Run Guide

## 🎯 Quick Start

### 1. Navigate to Backend Directory
```bash
cd /home/absksync/Desktop/backend
```

### 2. Run the Startup Script
```bash
./start.sh
```

That's it! The script will:
- Create virtual environment if needed
- Install all dependencies
- Initialize the database
- Seed default profiles
- Start the server on `http://localhost:8000`

## 📋 Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment support

## 🔑 API Keys Configuration

Your `.env` file is already configured with:

```env
# AI Service (Groq)
GROQ_API_KEY=your_groq_api_key_here

# Voice Service (ElevenLabs)
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## 🚀 Manual Setup (Alternative)

If you prefer manual setup:

### Step 1: Create Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Step 2: Install Dependencies
```bash
# Full installation with voice features
pip install -r requirements.txt

# OR without voice features (lighter)
pip install -r requirements-no-voice.txt
```

### Step 3: Initialize Database
```bash
python -c "from database import init_db; init_db()"
```

### Step 4: Seed Default Profiles
```bash
python seed_profiles.py
```

### Step 5: Start Server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🌟 Features Enabled

✅ **AI Chat** - Groq-powered conversations  
✅ **Sentiment Analysis** - Real-time emotion detection  
✅ **Voice Synthesis** - ElevenLabs text-to-speech  
✅ **Voice Recognition** - Speech-to-text transcription  
✅ **Memory System** - Learning and forgetting  
✅ **Multiple Profiles** - Separate conversation contexts  
✅ **Memory Decay** - Simulates human-like forgetting  

## 📡 API Endpoints

Once running, access:

- **API Documentation**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/

### Available Routes:

#### Chat
- `POST /chat/message` - Send message and get AI response
- `GET /chat/history/{profile_id}` - Get conversation history
- `POST /chat/sentiment` - Analyze sentiment

#### Profiles
- `GET /profiles` - List all profiles
- `GET /profiles/{id}` - Get specific profile
- `POST /profiles` - Create new profile
- `PUT /profiles/{id}` - Update profile
- `DELETE /profiles/{id}` - Delete profile

#### Memories
- `GET /memories/{profile_id}` - Get memories
- `GET /memories/{profile_id}/stats` - Memory statistics
- `POST /memories/{profile_id}/decay` - Trigger memory decay
- `POST /memories/{profile_id}/recall` - Recall memories

#### Voice
- `POST /voice/tts` - Text to speech
- `POST /voice/stt` - Speech to text

## 🗄️ Database

The backend uses SQLite by default:
- Database file: `veon.db`
- Automatically created on first run
- Includes tables for: profiles, messages, memories

## 🧠 Memory System

### How It Works:
1. **Learning**: Every conversation creates memories
2. **Importance Scoring**: System rates memory importance
3. **Decay**: Low-importance memories fade over time
4. **Recall**: Relevant memories retrieved for context

### Configuration:
- `MEMORY_DECAY_RATE=0.1` - How fast memories decay
- `MEMORY_MIN_IMPORTANCE=0.3` - Minimum score to keep

## 🎤 Voice Configuration

### ElevenLabs Settings:
- Default voice: Rachel (`21m00Tcm4TlvDq8ikWAM`)
- Model: `eleven_monolingual_v1`

### Change Voice:
Update `ELEVENLABS_VOICE_ID` in `.env` with any ElevenLabs voice ID.

Popular voices:
- Rachel: `21m00Tcm4TlvDq8ikWAM`
- Adam: `pNInz6obpgDQGcFmaJgB`
- Antoni: `ErXwobaYiN019PkySvjV`
- Bella: `EXAVITQu4vr4xnSDxMaL`

## 🐛 Troubleshooting

### Port 8000 Already in Use
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn main:app --reload --port 8001
```

### Database Errors
```bash
# Reset database
rm veon.db
python -c "from database import init_db; init_db()"
python seed_profiles.py
```

### Missing Dependencies
```bash
# Reinstall
pip install -r requirements.txt --force-reinstall
```

### API Key Errors
- Verify `.env` file exists in backend directory
- Check API keys are valid and not expired
- Ensure no extra spaces in `.env` file

## 📊 Testing the Backend

### Test with curl:
```bash
# Health check
curl http://localhost:8000/

# Get profiles
curl http://localhost:8000/profiles

# Send chat message
curl -X POST http://localhost:8000/chat/message \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 1, "message": "Hello VEON!"}'
```

### Test with Python:
```python
import requests

# Send message
response = requests.post(
    "http://localhost:8000/chat/message",
    json={"profile_id": 1, "message": "Hello VEON!"}
)
print(response.json())
```

## 🔄 Restarting the Server

### With Script:
```bash
# Stop: Ctrl+C
# Start: ./start.sh
```

### Manual:
```bash
# Stop: Ctrl+C
# Start:
source venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 📝 Logs

Server logs show:
- Incoming requests
- AI responses
- Memory operations
- Voice synthesis
- Errors and warnings

## 🔐 Security Notes

- `.env` file contains sensitive API keys
- Don't commit `.env` to git
- Keep API keys private
- Use environment-specific keys for production

## 🎯 Next Steps

1. ✅ Backend is running
2. Start frontend: `cd /home/absksync/Desktop/veon_replit && npm run dev`
3. Open browser: `http://localhost:5175`
4. Start chatting with VEON!

## 💡 Tips

- Keep terminal open while using VEON
- Check logs for debugging
- Visit `/docs` for interactive API testing
- Memory decay runs automatically
- Voice responses saved in `static/audio/`

## 🆘 Support

If issues persist:
1. Check all dependencies installed
2. Verify API keys are valid
3. Ensure port 8000 is available
4. Check Python version (3.8+)
5. Review server logs for errors
