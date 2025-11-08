require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const chatRoutes = require('./routes/chat');
const chatController = require('./controllers/chatController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VEON is alive' });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('message', async (data) => {
    try {
      const result = await chatController.sendMessage(data.message);
      
      // Emit response back to client
      socket.emit('response', {
        message: result.response,
        emotion: result.emotion,
        userEmotion: result.userEmotion,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      });

      // Emit emotion update to all clients for real-time avatar updates
      io.emit('emotionUpdate', {
        emotion: result.emotion,
        confidence: result.confidence
      });
    } catch (error) {
      console.error('Socket message error:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  socket.on('getMemories', async () => {
    try {
      const memories = await chatController.getMemories();
      socket.emit('memories', memories);
    } catch (error) {
      console.error('Socket memories error:', error);
      socket.emit('error', { message: 'Failed to fetch memories' });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`VEON backend running on port ${PORT}`);
});

module.exports = { app, server, io };
