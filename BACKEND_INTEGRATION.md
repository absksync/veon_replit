# VEON Frontend-Backend Integration

This document explains how the VEON frontend connects to the backend API.

## 🔌 Backend Connection

### Environment Setup

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here

# Backend API URL
VITE_API_BASE_URL=http://localhost:8000

# WebSocket URL (optional)
VITE_WS_URL=ws://localhost:8000/ws
```

## 🚀 Running the Application

### 1. Start the Backend Server

Navigate to your backend directory and run:
```bash
cd /home/absksync/Desktop/backend
python -m uvicorn main:app --reload --port 8000
```

### 2. Start the Frontend Development Server

In the frontend directory:
```bash
cd /home/absksync/Desktop/veon_replit
npm run dev
```

The frontend will run on `http://localhost:5175` (or next available port)

## 📁 Project Structure

### Frontend Services
- `src/services/api.js` - API client for backend communication
  - `chatAPI` - Send messages, get history, analyze sentiment
  - `profileAPI` - Manage user profiles
  - `memoryAPI` - Memory management and decay
  - `voiceAPI` - Text-to-speech and speech-to-text

### Frontend Store
- `src/store/useStore.js` - Zustand state management
  - Profile management
  - Chat messages
  - Emotion tracking
  - Memory statistics
  - Voice recording state

### Frontend Hooks
- `src/hooks/useVoiceRecording.js` - Voice recording and transcription

## 🎭 Features Integrated

### ✅ Real-time Sentiment Analysis
- Local frontend analysis for instant feedback
- Backend sentiment analysis for accurate emotion detection
- 15 different facial expressions

### ✅ Chat with Memory
- Messages sent to backend with context
- Backend learns and remembers conversations
- Memory decay system (forgets over time)
- AI-powered responses

### ✅ Voice Features
- 🎤 **Speech-to-Text**: Record voice, convert to text
- 🔊 **Text-to-Speech**: AI responds with voice
- Audio responses automatically played

### ✅ Expression System
The face dynamically changes based on:
- User input sentiment (local analysis)
- AI response emotion (backend analysis)

### ✅ User Profiles
- Multiple conversation profiles
- Each profile has separate memory
- Personalized AI interactions

## 🔧 API Endpoints Used

### Chat Endpoints
- `POST /chat/message` - Send message, get AI response
- `GET /chat/history/{profile_id}` - Get conversation history
- `POST /chat/sentiment` - Analyze text sentiment

### Profile Endpoints
- `GET /profiles` - List all profiles
- `GET /profiles/{id}` - Get specific profile
- `POST /profiles` - Create new profile
- `PUT /profiles/{id}` - Update profile
- `DELETE /profiles/{id}` - Delete profile

### Memory Endpoints
- `GET /memories/{profile_id}` - Get all memories
- `GET /memories/{profile_id}/stats` - Memory statistics
- `POST /memories/{profile_id}/decay` - Trigger memory decay
- `POST /memories/{profile_id}/recall` - Recall memories by context

### Voice Endpoints
- `POST /voice/tts` - Text to speech conversion
- `POST /voice/stt` - Speech to text conversion

## 💬 How Chat Works

1. **User types message** → Local sentiment analysis updates face
2. **User sends message** → Message sent to backend via `chatAPI.sendMessage()`
3. **Backend processes**:
   - Sentiment analysis
   - Memory recall (retrieves relevant past conversations)
   - AI generates response
   - Optionally generates voice response
   - Updates memory
4. **Frontend receives response**:
   - AI message displayed in chat
   - Face expression updated based on AI emotion
   - Voice response auto-played if available

## 🎙️ How Voice Recording Works

1. **User clicks mic** → `startRecording()` initiated
2. **Recording in progress** → Mic button turns red, shows pulsing animation
3. **User clicks again** → `stopRecording()` captures audio
4. **Audio transcription** → Sent to backend `/voice/stt`
5. **Text appears in input** → User can edit before sending
6. **Send message** → Regular chat flow continues

## 🧠 Memory System

### How Memory Works
- Every conversation is stored as a memory
- Memories have **importance** scores
- Memories **decay** over time (forgotten)
- Recent and important memories retained longer

### Memory Decay
- Automatically triggered by backend
- Can manually trigger: `memoryAPI.processDecay(profileId)`
- Low-importance memories fade first
- Simulates human-like forgetting

### Memory Recall
- When user sends message, backend recalls relevant past memories
- Context-aware responses based on conversation history
- "Remembers" user preferences and past topics

## 🔐 Authentication

Uses Clerk for authentication:
- Sign in/Sign up buttons in top-right
- User profile management
- Protected API routes (if backend implements auth)

## 🎨 UI States

### Loading States
- `isLoading` - Backend is generating response
- `isProcessing` - Audio is being transcribed
- `isRecording` - Voice recording in progress
- `isSpeaking` - AI audio response playing

### Visual Feedback
- Input disabled during loading
- Placeholder changes to "VEON is thinking..."
- Mic button color changes when recording
- Send button appears when text entered

## 🐛 Troubleshooting

### Backend not connecting
1. Check backend is running on port 8000
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check browser console for CORS errors

### Voice recording not working
1. Grant microphone permissions in browser
2. Use HTTPS or localhost (required for getUserMedia)
3. Check browser compatibility (modern browsers only)

### Emotion not changing
1. Ensure backend returns `emotion` field in response
2. Check sentiment analysis keywords
3. Verify store is updating: `useStore.getState().currentEmotion`

## 📊 Data Flow

```
User Input → Local Sentiment → Face Expression Update
     ↓
Send Message → Backend API → AI Service
     ↓                          ↓
Voice Service ← AI Response ← Memory Service
     ↓
Audio Playback + Face Expression + Chat Display
```

## 🎯 Next Steps

1. **WebSocket Integration** - Real-time bidirectional communication
2. **Profile Sync with Clerk** - Link profiles to Clerk users
3. **Memory Visualization** - Show memory health/decay in UI
4. **Settings Panel** - Voice selection, memory settings
5. **Chat History UI** - Display past conversations

## 📝 Notes

- Frontend emotion analysis is **instant** (local keywords)
- Backend emotion analysis is **accurate** (AI-powered)
- Both work together for best UX
- Voice features require backend to be running
- Memory decay happens server-side automatically
