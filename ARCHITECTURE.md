# VEON Architecture

This document explains the technical architecture and design decisions behind VEON.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                 React + Vite App                      │  │
│  │                                                        │  │
│  │  ├─ Components                                        │  │
│  │  │  ├─ VeonAvatar (React Three Fiber)                │  │
│  │  │  ├─ ChatInterface (Framer Motion)                 │  │
│  │  │  └─ MemoryPanel                                    │  │
│  │                                                        │  │
│  │  ├─ Store (Zustand)                                   │  │
│  │  │  └─ Global state management                        │  │
│  │                                                        │  │
│  │  └─ Services                                          │  │
│  │     └─ Socket.io Client                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                    WebSocket (Socket.io)
                           │
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Node.js + Express Server                 │  │
│  │                                                        │  │
│  │  ├─ Socket.io Server                                  │  │
│  │  │  └─ Real-time bidirectional communication          │  │
│  │                                                        │  │
│  │  ├─ REST API                                          │  │
│  │  │  ├─ /api/health                                    │  │
│  │  │  ├─ /api/chat/message                              │  │
│  │  │  ├─ /api/chat/history                              │  │
│  │  │  └─ /api/chat/memories                             │  │
│  │                                                        │  │
│  │  ├─ Services                                          │  │
│  │  │  ├─ HuggingFaceService                             │  │
│  │  │  │  ├─ Text Generation                             │  │
│  │  │  │  └─ Emotion Detection                           │  │
│  │  │  └─ MemoryService                                  │  │
│  │  │     ├─ CRUD operations                             │  │
│  │  │     └─ Decay calculations                          │  │
│  │                                                        │  │
│  │  └─ Database                                          │  │
│  │     └─ SQLite                                         │  │
│  │        ├─ memories table                              │  │
│  │        └─ conversations table                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Hugging Face API                           │
│  ├─ mistralai/Mistral-7B-Instruct-v0.2                     │
│  └─ j-hartmann/emotion-english-distilroberta-base          │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### Frontend Architecture

#### 1. State Management (Zustand)
- **Why Zustand?** Lightweight, no boilerplate, simple API
- **State Structure:**
  - `messages`: Array of conversation messages
  - `currentEmotion`: Current detected emotion
  - `emotionConfidence`: Confidence score (0-1)
  - `memories`: Array of stored memories
  - `isConnected`: Socket connection status
  - `isLoading`: Loading state for API calls

#### 2. 3D Avatar (React Three Fiber)
- **Technology:** Three.js via React Three Fiber + Drei helpers
- **Features:**
  - Emotion-based color mapping
  - Pulsing animation based on confidence
  - Glow effect with layered spheres
  - Orbital controls for interaction
- **Design Decision:** Simple sphere chosen over complex 3D face for:
  - Better performance
  - Abstract representation fits AI nature
  - Easier to animate smoothly

#### 3. Real-time Communication
- **Socket.io Client**
  - Auto-reconnection
  - Fallback to long-polling if WebSocket fails
  - Event-driven architecture

### Backend Architecture

#### 1. Memory System

**Memory Structure:**
```javascript
{
  id: INTEGER,
  content: TEXT,
  emotion: TEXT,
  importance: REAL (0-1),
  decay_rate: REAL,
  strength: REAL (0-1),
  created_at: DATETIME,
  last_accessed: DATETIME
}
```

**Decay Algorithm:**
```
strength_new = strength_old * e^(-decay_rate * hours_passed)
decay_rate = max(0.01, 0.2 * (1 - importance))
```

**Design Decisions:**
- **Exponential Decay:** Mimics human memory better than linear
- **Importance-based:** High importance = slower decay
- **Time-based:** Hours since last access determines decay
- **Pruning:** Memories with strength < 0.1 are deleted

#### 2. Emotion Detection Pipeline

1. User sends message
2. Detect emotion using DistilRoBERTa
3. Calculate importance from emotion confidence
4. Generate AI response with context
5. Detect emotion in response
6. Update avatar in real-time
7. Store as memory with decay rate

#### 3. AI Integration

**Text Generation:**
- Model: Mistral-7B-Instruct-v0.2
- Context: Last 5 memories injected into prompt
- Parameters: temperature=0.7, max_tokens=150

**Emotion Detection:**
- Model: emotion-english-distilroberta-base
- Returns: 7 emotions (joy, sadness, anger, fear, surprise, disgust, neutral)
- Used for: Avatar color, memory importance

## Database Schema

### Memories Table
```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL,
  emotion TEXT,
  importance REAL DEFAULT 1.0,
  decay_rate REAL DEFAULT 0.1,
  strength REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  emotion TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Communication Flow

### Chat Message Flow
```
1. User types message in ChatInterface
2. Frontend sends via Socket.io: emit('message', {message})
3. Backend receives message
4. Parallel processing:
   a. Detect user emotion
   b. Get memory context
   c. Generate AI response
   d. Detect AI emotion
5. Store message as memory
6. Apply decay to all memories
7. Backend emits: response + emotionUpdate
8. Frontend updates UI + avatar
```

### Memory Decay Flow
```
1. Triggered on every message
2. Query all memories from database
3. For each memory:
   - Calculate time since last_accessed
   - Apply exponential decay formula
   - Update strength in database
4. Prune memories with strength < 0.1
5. Return updated memories to frontend
```

## Design Patterns

### 1. Service Layer Pattern
- Separation of concerns
- Business logic in services
- Controllers handle HTTP/Socket
- Models handle data

### 2. Event-Driven Architecture
- Socket.io for real-time events
- Loose coupling between frontend/backend
- Easy to add new event handlers

### 3. Repository Pattern
- Database abstraction
- Easy to swap SQLite for other DBs
- Centralized data access

## Performance Considerations

### Frontend
- React.memo for expensive components
- Debounced scroll events
- Lazy loading for heavy imports
- WebGL optimization with Three.js

### Backend
- In-memory caching (could be added)
- Batch database operations
- Async/await for non-blocking I/O
- Connection pooling for HuggingFace API

## Security Measures

1. **API Key Protection:** Environment variables only
2. **Input Validation:** Sanitize user messages
3. **Rate Limiting:** Should be added for production
4. **CORS:** Configured for specific origins
5. **No XSS:** React escapes by default

## Scalability

### Current Limitations
- Single SQLite database
- In-memory Socket.io (no Redis adapter)
- Sequential AI requests

### Future Improvements
- PostgreSQL for production
- Redis for Socket.io scaling
- Message queue for AI requests
- CDN for frontend assets
- Horizontal scaling with load balancer

## Technology Choices Rationale

| Technology | Why? | Alternatives Considered |
|-----------|------|------------------------|
| React | Industry standard, large ecosystem | Vue, Svelte |
| Vite | Fast dev server, modern tooling | Create React App, Webpack |
| Tailwind | Rapid development, consistent design | CSS Modules, Styled Components |
| Three.js | Best WebGL library for React | Babylon.js, PlayCanvas |
| Zustand | Simple, no boilerplate | Redux, MobX, Recoil |
| Socket.io | Easy real-time, fallbacks | Native WebSocket, SSE |
| Express | Minimal, flexible | Fastify, Koa |
| SQLite | Embedded, zero config | PostgreSQL, MongoDB |
| Hugging Face | Free tier, good models | OpenAI (requires payment) |

## Development Workflow

```bash
# Development
npm run dev:backend  # Start backend with hot reload
npm run dev:frontend # Start frontend with HMR

# Production
npm run build:frontend  # Build optimized frontend
npm run start:backend   # Start production backend
npm run start:frontend  # Serve built frontend
```

## Future Enhancements

1. **Voice Interface:** Speech-to-text and text-to-speech
2. **Avatar Customization:** User-selectable avatar styles
3. **Persistent Sessions:** User accounts and login
4. **Memory Search:** Full-text search in memories
5. **Export/Import:** Download conversation history
6. **Analytics:** Track emotion trends over time
7. **Mobile App:** React Native version
8. **Multi-language:** i18n support

---

For questions or suggestions about the architecture, please open an issue!
