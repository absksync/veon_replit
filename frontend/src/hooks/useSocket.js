import { useEffect } from 'react';
import socketService from '../services/socketService';
import useVeonStore from '../store/useVeonStore';

export default function useSocket() {
  const {
    setConnected,
    addMessage,
    setEmotion,
    setMemories,
    setLoading,
  } = useVeonStore();

  useEffect(() => {
    // Connect to socket
    socketService.connect(
      () => setConnected(true),
      () => setConnected(false)
    );

    // Listen for responses
    socketService.onResponse((data) => {
      addMessage({
        role: 'assistant',
        content: data.message,
        emotion: data.emotion,
        timestamp: data.timestamp,
      });
      setLoading(false);
    });

    // Listen for emotion updates
    socketService.onEmotionUpdate((data) => {
      setEmotion(data.emotion, data.confidence);
    });

    // Listen for memories
    socketService.onMemories((memories) => {
      setMemories(memories);
    });

    // Listen for errors
    socketService.onError((error) => {
      console.error('Socket error:', error);
      setLoading(false);
    });

    // Request initial memories
    setTimeout(() => {
      socketService.requestMemories();
    }, 1000);

    // Cleanup on unmount
    return () => {
      socketService.disconnect();
    };
  }, [setConnected, addMessage, setEmotion, setMemories, setLoading]);
}
