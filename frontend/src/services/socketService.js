import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(onConnect, onDisconnect) {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Connected to VEON backend');
      if (onConnect) onConnect();
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from VEON backend');
      if (onDisconnect) onDisconnect();
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendMessage(message) {
    if (this.socket) {
      this.socket.emit('message', { message });
    }
  }

  onResponse(callback) {
    if (this.socket) {
      this.socket.on('response', callback);
    }
  }

  onEmotionUpdate(callback) {
    if (this.socket) {
      this.socket.on('emotionUpdate', callback);
    }
  }

  onMemories(callback) {
    if (this.socket) {
      this.socket.on('memories', callback);
    }
  }

  requestMemories() {
    if (this.socket) {
      this.socket.emit('getMemories');
    }
  }

  onError(callback) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }
}

export default new SocketService();
