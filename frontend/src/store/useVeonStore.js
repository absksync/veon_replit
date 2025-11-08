import { create } from 'zustand';

const useVeonStore = create((set) => ({
  // Conversation state
  messages: [],
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({ messages: [] }),

  // Emotion state
  currentEmotion: 'neutral',
  emotionConfidence: 0.5,
  setEmotion: (emotion, confidence) => set({
    currentEmotion: emotion,
    emotionConfidence: confidence
  }),

  // Memories state
  memories: [],
  setMemories: (memories) => set({ memories }),

  // Connection state
  isConnected: false,
  setConnected: (connected) => set({ isConnected: connected }),

  // Loading state
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useVeonStore;
