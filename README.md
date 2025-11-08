# VEON - Emotionally Adaptive AI Companion

VEON is an emotionally intelligent AI companion that lives, learns, and forgets. It features a beautiful 3D avatar that reacts to emotions in real-time, sophisticated memory decay logic, and natural conversations powered by Hugging Face models.

## Features

🌟 **Emotionally Adaptive Avatar**
- Real-time 3D glowing face using React Three Fiber
- Color and animation changes based on detected emotions
- Smooth transitions and pulsing effects

🧠 **Memory System with Decay**
- Memories stored in SQLite database
- Exponential decay algorithm based on importance
- Memories strengthen or weaken based on access patterns

💬 **Natural Conversations**
- Text generation using Mistral-7B-Instruct model
- Emotion detection using DistilRoBERTa
- Context-aware responses using memory recall

⚡ **Real-time Communication**
- Socket.io for instant bidirectional communication
- Live emotion updates across all clients
- Seamless chat experience

## Tech Stack

### Frontend
- **React** (with Vite) - Fast, modern React development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Three Fiber** - 3D graphics and WebGL
- **Zustand** - Lightweight state management
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express** - Server framework
- **Socket.io** - WebSocket server
- **SQLite** - Lightweight database
- **Hugging Face Inference API** - AI models
  - `mistralai/Mistral-7B-Instruct-v0.2` - Text generation
  - `j-hartmann/emotion-english-distilroberta-base` - Emotion detection

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Hugging Face API key (free at https://huggingface.co)

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/absksync/veon_replit.git
cd veon_replit
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and add your Hugging Face API key:
```
PORT=3001
HUGGINGFACE_API_KEY=your_actual_api_key_here
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install
cp .env.example .env
```

Edit `.env` if needed (default should work):
```
VITE_SOCKET_URL=http://localhost:3001
```

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
The backend will start on http://localhost:3001

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on http://localhost:5173

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## Usage

1. Open your browser to `http://localhost:5173`
2. Wait for the connection indicator to turn green
3. Start chatting with VEON!
4. Watch the 3D avatar change colors based on emotions
5. View memories in the Memory Core panel

### Emotion Colors
- 😊 **Joy/Happy** - Gold
- ❤️ **Love** - Pink
- 😮 **Surprise** - Tomato Red
- 😠 **Anger** - Red
- 😨 **Fear** - Purple
- 😢 **Sadness** - Blue
- 😐 **Neutral** - Sky Blue
- 🤢 **Disgust** - Green

## Memory Decay Logic

VEON's memory system simulates human-like forgetting:

1. **Creation**: Each memory is assigned an importance score (0-1) based on emotional intensity
2. **Decay Rate**: Higher importance = slower decay rate
3. **Strength**: Memories lose strength over time using exponential decay: `strength = initial_strength * e^(-decay_rate * hours)`
4. **Access**: Accessing a memory updates its timestamp but doesn't stop decay
5. **Pruning**: Memories with strength < 0.1 are automatically removed

## Project Structure

```
veon_replit/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # SQLite setup
│   │   ├── controllers/
│   │   │   └── chatController.js   # Chat logic
│   │   ├── services/
│   │   │   ├── huggingfaceService.js  # AI integration
│   │   │   └── memoryService.js       # Memory management
│   │   ├── routes/
│   │   │   └── chat.js             # API routes
│   │   └── index.js                # Server entry
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VeonAvatar.jsx      # 3D avatar
│   │   │   ├── ChatInterface.jsx   # Chat UI
│   │   │   └── MemoryPanel.jsx     # Memory display
│   │   ├── hooks/
│   │   │   └── useSocket.js        # Socket hook
│   │   ├── services/
│   │   │   └── socketService.js    # Socket client
│   │   ├── store/
│   │   │   └── useVeonStore.js     # Zustand store
│   │   ├── App.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## API Endpoints

### REST API
- `GET /api/health` - Health check
- `POST /api/chat/message` - Send message
- `GET /api/chat/history` - Get conversation history
- `GET /api/chat/memories` - Get all memories

### Socket.io Events

**Client → Server:**
- `message` - Send a message
- `getMemories` - Request memories

**Server → Client:**
- `response` - AI response with emotion
- `emotionUpdate` - Real-time emotion change
- `memories` - Memory list
- `error` - Error message

## Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify your Hugging Face API key is valid
- Ensure all dependencies are installed

### Frontend can't connect
- Verify backend is running
- Check VITE_SOCKET_URL in .env
- Check browser console for errors

### Avatar not rendering
- Ensure WebGL is supported in your browser
- Try updating your graphics drivers
- Check browser console for Three.js errors

### Slow AI responses
- Hugging Face Inference API can be slow on free tier
- Consider upgrading to Pro for better performance
- Models may need "warm-up" time on first request

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Hugging Face for providing free AI model inference
- React Three Fiber community for 3D graphics tools
- Socket.io team for real-time communication framework

---

Built with ❤️ by Abhishek Kumar Singh
