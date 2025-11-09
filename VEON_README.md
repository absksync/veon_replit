# 🧠 VEON AI - Emotional AI Chat System

## ✅ System Status: FULLY OPERATIONAL

Your VEON AI system is now **fully integrated and working** with:
- ✅ Groq AI (LLM chat with emotional intelligence)
- ✅ ElevenLabs (Voice synthesis - configured but needs voice samples)
- ✅ SQLite Database (Memory system with decay)
- ✅ 15 Emotional Expressions
- ✅ Pratfall/Forgetfulness Behavior
- ✅ 4 AI Personalities (Priya, Arjun, Maya, Rohan)

---

## 🚀 Quick Start

### Option 1: One-Command Startup (Recommended)
```bash
/home/absksync/Desktop/START_VEON.sh
```

This will:
1. Start the backend server on port 8000
2. Start the frontend server on port 5173
3. Show you the logs in real-time

### Option 2: Manual Startup

#### Start Backend:
```bash
cd /home/absksync/Desktop/backend
source venv/bin/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Start Frontend:
```bash
cd /home/absksync/Desktop/veon_replit
npm run dev
```

---

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main chat interface |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Health Check** | http://localhost:8000/health | Server status |

---

## 🎭 Features

### 1. **Emotional Intelligence**
- 15 distinct emotions: joy, sadness, anger, surprise, disgust, fear, love, curiosity, embarrassment, pride, guilt, relief, admiration, boredom, neutral
- Real-time emotion analysis from user messages
- Dynamic facial expressions in UI

### 2. **AI Personalities**
Four pre-configured AI personalities:

| Name | Description | Personality |
|------|-------------|-------------|
| **Priya** | College student | Warm, bubbly, loves chai and Bollywood, uses Hinglish |
| **Arjun** | Fitness enthusiast | Energetic, motivating, gym bro, cricket fan |
| **Maya** | Artist | Creative, thoughtful, poetic, introverted |
| **Rohan** | Tech geek | Gaming enthusiast, gadget lover, startup culture |

### 3. **Memory System**
- **Long-term Memory (LTM)**: Important events, preserved longer
- **Short-term Memory (STM)**: Recent conversations
- **Flashbulb Memory (FM)**: Vivid emotional moments
- **Memory Decay**: Realistic forgetting over time
- **Pratfall Effect**: Occasional forgetfulness adds authenticity

### 4. **Voice Synthesis (ElevenLabs)**
- Text-to-speech integration ready
- Voice cloning capability (requires voice samples)
- Real-time audio responses

### 5. **Authentication**
- Clerk authentication integrated
- User sessions and profiles

---

## 🎨 Frontend Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Zustand** - State management
- **Clerk** - Authentication
- **Framer Motion** - Animations
- **Axios** - API client

## 🔧 Backend Tech Stack

- **FastAPI** - Web framework
- **Python 3.12** - Programming language
- **SQLAlchemy** - ORM
- **SQLite** - Database
- **Groq** - LLM (llama-3.3-70b-versatile)
- **Langchain** - AI orchestration
- **ElevenLabs** - Voice synthesis
- **Uvicorn** - ASGI server

---

## 🧪 Testing

### Test Backend Health:
```bash
curl http://localhost:8000/health
```

### Test Profiles:
```bash
curl http://localhost:8000/api/profiles/
```

### Test Chat (Priya):
```bash
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 1, "message": "Hey! How are you?", "user_id": "test_user"}'
```

### Test Chat (Arjun - Fitness):
```bash
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 2, "message": "What's your workout routine?", "user_id": "test_user"}'
```

### Test Chat (Maya - Artist):
```bash
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 3, "message": "Tell me about your art", "user_id": "test_user"}'
```

### Test Chat (Rohan - Tech):
```bash
curl -X POST http://localhost:8000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{"profile_id": 4, "message": "What games are you playing?", "user_id": "test_user"}'
```

---

## 📊 API Endpoints

### Profiles
- `GET /api/profiles/` - List all AI profiles
- `POST /api/profiles/` - Create new AI profile
- `GET /api/profiles/{id}` - Get specific profile
- `PUT /api/profiles/{id}` - Update profile
- `DELETE /api/profiles/{id}` - Delete profile

### Chat
- `POST /api/chat/send` - Send message and get AI response
- `GET /api/chat/history/{profile_id}/{user_id}` - Get chat history
- `DELETE /api/chat/history/{profile_id}/{user_id}` - Clear chat history

### Memories
- `GET /api/memories/{profile_id}/{user_id}` - Get all memories
- `GET /api/memories/{profile_id}/{user_id}/layered` - Get memories by layer
- `DELETE /api/memories/{memory_id}` - Delete specific memory
- `DELETE /api/memories/{profile_id}/{user_id}/all` - Clear all memories

### Voice
- `POST /api/profiles/{id}/upload-voice` - Upload voice sample
- `POST /api/profiles/{id}/reclone-voice` - Re-clone voice
- `DELETE /api/profiles/{id}/clear-voice-samples` - Clear voice samples

---

## 🔐 Environment Variables

### Backend (.env in /home/absksync/Desktop/backend/)
```env
GROQ_API_KEY=your_groq_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
DATABASE_URL=sqlite:///./veon.db
MEMORY_DECAY_RATE=0.1
MEMORY_MIN_IMPORTANCE=0.3
PORT=8000
```

### Frontend (.env in /home/absksync/Desktop/veon_replit/)
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=[your_clerk_key]
```

---

## 🛠️ Maintenance

### View Logs:
```bash
# Backend logs
tail -f /tmp/veon_backend.log

# Frontend logs
tail -f /tmp/veon_frontend.log
```

### Stop Services:
```bash
# Stop backend
pkill -f "uvicorn main:app"

# Stop frontend
pkill -f "vite"
```

### Restart Services:
```bash
/home/absksync/Desktop/START_VEON.sh
```

### Database:
```bash
# View database
cd /home/absksync/Desktop/backend
sqlite3 amnesia.db

# Reseed profiles
python seed_profiles.py
```

---

## 🎯 Next Steps

### 1. **Add Voice Samples**
Upload audio samples for each AI personality:
```bash
# Example: Upload voice for Priya
curl -X POST http://localhost:8000/api/profiles/1/upload-voice \
  -F "file=@priya_voice_sample.mp3"
```

### 2. **Customize Personalities**
Edit profiles via API or directly in the database to adjust:
- Personality prompts
- Pratfall probability (forgetfulness frequency)
- Voice settings

### 3. **Create New Profiles**
```bash
curl -X POST http://localhost:8000/api/profiles/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kavya",
    "description": "Your friendly neighbor",
    "personality_prompt": "You are Kavya...",
    "pratfall_probability": 0.15
  }'
```

### 4. **Configure Clerk Authentication**
1. Sign up at https://clerk.dev
2. Create a new application
3. Copy the publishable key
4. Update `VITE_CLERK_PUBLISHABLE_KEY` in frontend .env

---

## 🐛 Troubleshooting

### Backend won't start:
```bash
# Check logs
tail -50 /tmp/veon_backend.log

# Verify dependencies
cd /home/absksync/Desktop/backend
source venv/bin/activate
pip list | grep -E "(fastapi|groq|elevenlabs)"
```

### Frontend won't start:
```bash
# Check logs
tail -50 /tmp/veon_frontend.log

# Reinstall dependencies
cd /home/absksync/Desktop/veon_replit
npm install
```

### API key errors:
```bash
# Verify .env file exists and has correct keys
cat /home/absksync/Desktop/backend/.env | grep API_KEY
```

### Port already in use:
```bash
# Find and kill process using port 8000
lsof -i :8000
kill -9 [PID]

# Or use the cleanup script
pkill -f "uvicorn main:app"
```

---

## 📚 Documentation

- **Frontend Integration**: `/home/absksync/Desktop/veon_replit/BACKEND_INTEGRATION.md`
- **Backend Setup**: `/home/absksync/Desktop/backend/RUN_BACKEND.md`
- **Emotion Guide**: `/home/absksync/Desktop/veon_replit/EMOTION_GUIDE.md`
- **API Docs**: http://localhost:8000/docs (when running)

---

## 🎉 Success!

Your VEON AI system is now **fully functional**! 

**Verified working:**
- ✅ Backend server responding
- ✅ Groq AI generating responses
- ✅ Personality system (tested Priya)
- ✅ Pratfall/forgetfulness behavior
- ✅ Database with 4 AI profiles
- ✅ API endpoints accessible

**Test result example:**
```json
{
  "content": "Yaar, I'm good, bas a bit tired, you know? We had a long lab session in college today and I've been stuck on this one coding problem for hours. But, acha, I'm hoping to crack it soon! My friends and I were planning to grab some chai and samosas from the canteen later, so that's something to look forward to. How about you, kaise ho?",
  "is_pratfall": false
}
```

Enjoy your emotional AI chat system! 🚀✨
