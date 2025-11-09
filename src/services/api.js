import axios from 'axios'

// Backend API base URL - supports both local dev and production
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

console.log('🔗 API Base URL:', API_BASE_URL)

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Chat API
export const chatAPI = {
  // Send message and get response
  sendMessage: async (profileId, message, userId = 'anonymous', audioFile = null) => {
    // Backend expects JSON format matching Polaris ChatRequest
    const payload = {
      profile_id: profileId,
      user_id: userId,
      message: message,
      scene_id: null // Optional scene support from Polaris
    }

    try {
      const response = await api.post('/api/chat/send', payload)
      return response.data
    } catch (error) {
      console.error('❌ Chat API Error:', error.response?.data || error.message)
      throw error
    }
  },  // Get chat history
  getChatHistory: async (profileId, userId = 'anonymous', limit = 50) => {
    const response = await api.get(`/api/chat/history/${profileId}/${userId}`, {
      params: { limit },
    })
    return response.data
  },

  // Delete chat history
  deleteChatHistory: async (profileId, userId = 'anonymous') => {
    const response = await api.delete(`/api/chat/history/${profileId}/${userId}`)
    return response.data
  },

  // Analyze sentiment
  analyzeSentiment: async (text) => {
    const response = await api.post('/chat/sentiment', { text })
    return response.data
  },
}

// Profile API
export const profileAPI = {
  // Get all profiles
  getAllProfiles: async () => {
    const response = await api.get('/api/profiles/')
    return response.data
  },

  // Get single profile
  getProfile: async (profileId) => {
    const response = await api.get(`/api/profiles/${profileId}`)
    return response.data
  },

  // Create new profile
  createProfile: async (profileData) => {
    const response = await api.post('/api/profiles/', profileData)
    return response.data
  },

  // Update profile
  updateProfile: async (profileId, profileData) => {
    const response = await api.put(`/api/profiles/${profileId}`, profileData)
    return response.data
  },

  // Delete profile
  deleteProfile: async (profileId) => {
    const response = await api.delete(`/api/profiles/${profileId}`)
    return response.data
  },
}

// Memory API
export const memoryAPI = {
  // Get all memories for a profile
  getMemories: async (profileId, userId = 'anonymous', includeDecayed = false) => {
    const response = await api.get(`/api/memories/${profileId}/${userId}`, {
      params: { include_decayed: includeDecayed },
    })
    return response.data
  },

  // Get memory statistics (layered)
  getMemoryStats: async (profileId, userId = 'anonymous') => {
    const response = await api.get(`/api/memories/${profileId}/${userId}/layered`)
    return response.data
  },

  // Delete all memories for a user
  deleteAllMemories: async (profileId, userId = 'anonymous') => {
    const response = await api.delete(`/api/memories/${profileId}/${userId}/all`)
    return response.data
  },

  // Delete specific memory
  deleteMemory: async (memoryId) => {
    const response = await api.delete(`/api/memories/${memoryId}`)
    return response.data
  },

  // Process memory decay - not available in backend, remove for now
  processDecay: async (profileId) => {
    console.warn('Memory decay is automatic in backend')
    return { message: 'Memory decay is automatic' }
  },

  // Recall memories by context - not available, use getMemories instead
  recallMemories: async (profileId, userId = 'anonymous', context, limit = 10) => {
    return await memoryAPI.getMemories(profileId, userId)
  },
}

// Voice API
export const voiceAPI = {
  // Text to speech
  textToSpeech: async (text, voiceId = 'default') => {
    const response = await api.post(
      '/voice/tts',
      { text, voice_id: voiceId },
      { responseType: 'blob' }
    )
    return response.data
  },

  // Speech to text
  speechToText: async (audioBlob) => {
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const response = await api.post('/voice/stt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}

export default api
