import { create } from 'zustand'
import { chatAPI, profileAPI, memoryAPI } from '../services/api'

// Main application store
export const useStore = create((set, get) => ({
  // Profile state
  currentProfile: null,
  profiles: [],
  
  // Chat state
  messages: [],
  isLoading: false,
  
  // Emotion state
  currentEmotion: 'normal',
  
  // Memory state
  memories: [],
  memoryStats: null,
  memorySettings: {
    decay_rate: 0.25,
    recall_depth: 6,
    emotion_weight: 1.5,
  },
  
  // Voice state
  isRecording: false,
  isSpeaking: false,
  
  // Guest mode state
  isGuestMode: false,
  
  // Actions
  
  // Emotion actions
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  
  // Profile actions
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  
  loadProfiles: async () => {
    try {
      console.log('🔄 Loading profiles from API...')
      const profiles = await profileAPI.getAllProfiles()
      console.log('✅ Profiles loaded:', profiles)
      set({ profiles })
      
      // Set Rohan (tech geek) as default profile if none selected
      if (!get().currentProfile && profiles.length > 0) {
        // Find Rohan (profile ID 4) or fall back to last profile
        const rohan = profiles.find(p => p.id === 4) || profiles[profiles.length - 1]
        console.log('✅ Setting current profile to:', rohan.name)
        set({ currentProfile: rohan })
      }
    } catch (error) {
      console.error('❌ Failed to load profiles:', error)
      console.error('Error details:', error.response?.data || error.message)
      
      // Demo mode: Create a default profile when backend is unavailable
      const demoProfile = {
        id: 1,
        name: 'VEON Demo',
        personality: 'friendly and helpful AI assistant',
        voice_id: 'demo',
        avatar_url: null
      }
      set({ profiles: [demoProfile], currentProfile: demoProfile, isGuestMode: true })
      console.log('🎭 Running in DEMO MODE - backend unavailable')
    }
  },
  
  createProfile: async (profileData) => {
    try {
      const newProfile = await profileAPI.createProfile(profileData)
      set((state) => ({
        profiles: [...state.profiles, newProfile],
        currentProfile: newProfile,
      }))
      return newProfile
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    }
  },
  
  // Chat actions
  sendMessage: async (message, userId = 'anonymous', audioFile = null) => {
    const { currentProfile, messages } = get()
    
    console.log('📤 Sending message. Current profile:', currentProfile?.name || 'NONE')
    
    if (!currentProfile) {
      throw new Error('No profile selected')
    }
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }
    
    set({ 
      messages: [...messages, userMessage],
      isLoading: true 
    })
    
    try {
      // Send message to backend (Polaris format)
      const response = await chatAPI.sendMessage(
        currentProfile.id,
        message,
        userId,
        audioFile
      )
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.content, // Backend returns 'content' not 'response'
        emotion: response.emotion,
        audioUrl: response.audio_url,
        isPratfall: response.is_pratfall,
        timestamp: new Date().toISOString(),
      }

      // Natural emotion handling - only change expression when AI response has clear emotion
      // This makes VEON feel more human, not reacting to every single message
      let newEmotion = get().currentEmotion // Keep current emotion by default
      
      if (response.emotion) {
        // Backend provided an emotion - use it
        newEmotion = response.emotion
      } else {
        // Analyze the response text
        const detectedEmotion = get().analyzeSentimentFromText(response.content)
        
        // Only change emotion if it's not 'normal' and not 'happy' (common defaults)
        // This prevents constant emotion switching for casual responses
        if (detectedEmotion !== 'normal' && detectedEmotion !== 'happy') {
          newEmotion = detectedEmotion
        }
        // Otherwise, keep the current emotion for a more natural flow
      }
      
      set((state) => ({
        messages: [...state.messages, aiMessage],
        currentEmotion: newEmotion,
        isLoading: false,
      }))
      
      // Play audio response if available
      if (response.audio_url) {
        get().playAudioResponse(response.audio_url)
      }
      
      return response
    } catch (error) {
      console.error('Failed to send message:', error)
      set({ isLoading: false })
      throw error
    }
  },
  
  loadChatHistory: async (userId = 'anonymous') => {
    const { currentProfile } = get()
    
    if (!currentProfile) return
    
    try {
      const history = await chatAPI.getChatHistory(currentProfile.id, userId)
      set({ messages: history })
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  },
  
  setEmotion: (emotion) => set({ currentEmotion: emotion }),
  
  // Memory actions
  loadMemories: async (userId = 'anonymous', includeDecayed = false) => {
    const { currentProfile } = get()
    
    if (!currentProfile) return
    
    try {
      const memories = await memoryAPI.getMemories(currentProfile.id, userId, includeDecayed)
      set({ memories })
    } catch (error) {
      console.error('Failed to load memories:', error)
    }
  },
  
  loadMemoryStats: async (userId = 'anonymous') => {
    const { currentProfile } = get()
    
    if (!currentProfile) return
    
    try {
      const stats = await memoryAPI.getMemoryStats(currentProfile.id, userId)
      set({ memoryStats: stats })
    } catch (error) {
      console.error('Failed to load memory stats:', error)
    }
  },
  
  triggerMemoryDecay: async (userId = 'anonymous') => {
    const { currentProfile } = get()
    
    if (!currentProfile) return
    
    try {
      await memoryAPI.processDecay(currentProfile.id)
      // Reload memories and stats after decay
      await get().loadMemories(userId)
      await get().loadMemoryStats(userId)
    } catch (error) {
      console.error('Failed to process memory decay:', error)
    }
  },
  
  // Sentiment analysis function
  analyzeSentimentFromText: (text) => {
    const lowerText = text.toLowerCase()
    
    // CONTEXT-AWARE DETECTION - Check these first for better accuracy
    
    // Defensive/Explaining responses (like "I'm not an AI, I'm a real person")
    if ((lowerText.includes('not an ai') || lowerText.includes("i'm not") || 
         lowerText.includes('i am not') || lowerText.includes('assure you')) &&
        (lowerText.includes('real') || lowerText.includes('human') || lowerText.includes('person'))) {
      return 'confused' // Defensive/explaining = confused expression
    }
    
    // Direct questions about identity/nature
    if ((lowerText.includes('are you') || lowerText.includes('r u')) && 
        (lowerText.includes('ai') || lowerText.includes('bot') || lowerText.includes('robot') || 
         lowerText.includes('real') || lowerText.includes('human'))) {
      return 'confused' // Being questioned = confused
    }
    
    // Clarifying/Explaining (i think, i believe, actually, let me explain)
    if (lowerText.includes('i think') || lowerText.includes('i believe') || 
        lowerText.includes('actually') || lowerText.includes('let me explain') ||
        lowerText.includes('confusion') || lowerText.includes('misunderstanding')) {
      return 'thinking' // Explaining/clarifying = thinking expression
    }
    
    // Define emotion keywords
    const excitedWords = ['amazing', 'awesome', 'great', 'love', 'wonderful', 'excited', 'fantastic', 
                          'excellent', 'yay', 'wow', 'incredible', 'outstanding', 'brilliant', 'superb',
                          'best', 'perfect', 'beautiful']
    const surprisedWords = ['surprised', 'shocking', 'omg', 'unbelievable', 'unexpected', 'whoa',
                            'really', 'no way', 'seriously', 'what the']
    const confusedWords = ['confused', 'huh', 'unclear', 'don\'t understand', 'what do you mean',
                           'puzzled', 'bewildered', 'perplexed', 'what', 'why']
    const thinkingWords = ['hmm', 'thinking', 'considering', 'pondering', 'wondering', 'maybe',
                           'perhaps', 'possibly', 'might', 'could be', 'suppose']
    const worriedWords = ['worried', 'anxious', 'concerned', 'nervous', 'scared', 'afraid',
                          'fearful', 'uneasy', 'troubled', 'distressed', 'problem', 'issue']
    const sleepyWords = ['tired', 'sleepy', 'exhausted', 'drowsy', 'yawn', 'sleep', 'bed',
                         'fatigue', 'weary']
    const lovingWords = ['love', 'adore', 'cherish', 'sweet', 'dear', 'darling', 'sweetheart',
                         'care', 'affection', 'hug', 'kiss']
    const laughingWords = ['haha', 'lol', 'lmao', 'rofl', 'hilarious', 'funny', 'laughing',
                           'joke', 'comedy', 'hehe', 'lmfao']
    const sadWords = ['sad', 'unhappy', 'depressed', 'miserable', 'down', 'blue', 'upset',
                      'crying', 'tears', 'heartbroken', 'disappointed', 'sorry']
    const angryWords = ['angry', 'mad', 'furious', 'annoyed', 'irritated', 'frustrated',
                        'rage', 'hate', 'pissed', 'outraged']
    const happyWords = ['happy', 'glad', 'pleased', 'delighted', 'joyful', 'cheerful',
                        'content', 'satisfied', 'good', 'nice', 'fine', 'okay']
    const mischievousWords = ['mischievous', 'sneaky', 'playful', 'teasing', 'cheeky', 'naughty']
    const embarrassedWords = ['embarrassed', 'shy', 'awkward', 'uncomfortable', 'blushing', 'ashamed']
    const disgustedWords = ['disgusted', 'gross', 'ew', 'yuck', 'nasty', 'revolting', 'repulsive']
    const proudWords = ['proud', 'confident', 'accomplished', 'achievement', 'success', 'nailed it']
    
    // Count matches
    const emotionCounts = {
      excited: 0, surprised: 0, confused: 0, thinking: 0, worried: 0,
      sleepy: 0, loving: 0, laughing: 0, sad: 0, angry: 0,
      happy: 0, mischievous: 0, embarrassed: 0, disgusted: 0, proud: 0
    }
    
    excitedWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.excited++ })
    surprisedWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.surprised++ })
    confusedWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.confused++ })
    thinkingWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.thinking++ })
    worriedWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.worried++ })
    sleepyWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.sleepy++ })
    lovingWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.loving++ })
    laughingWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.laughing++ })
    sadWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.sad++ })
    angryWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.angry++ })
    happyWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.happy++ })
    mischievousWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.mischievous++ })
    embarrassedWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.embarrassed++ })
    disgustedWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.disgusted++ })
    proudWords.forEach(word => { if (lowerText.includes(word)) emotionCounts.proud++ })
    
    // Enhanced contextual detection
    
    // Multiple question marks = confused/surprised
    const questionMarks = (text.match(/\?/g) || []).length
    if (questionMarks >= 2) {
      emotionCounts.confused += 3
    } else if (questionMarks === 1) {
      emotionCounts.thinking += 1
    }
    
    // Multiple exclamation marks = excited
    if ((text.match(/!/g) || []).length >= 2) {
      emotionCounts.excited += 3
    }
    
    // Questions that show concern
    if (lowerText.includes('?') && (lowerText.includes('wrong') || lowerText.includes('problem'))) {
      emotionCounts.worried += 2
    }
    
    // Negative phrases
    if (lowerText.includes('not') || lowerText.includes("n't") || lowerText.includes('no')) {
      emotionCounts.confused += 1
      // Reduce happy score when negative words present
      emotionCounts.happy = Math.max(0, emotionCounts.happy - 2)
    }
    
    // Find highest scoring emotion
    const maxCount = Math.max(...Object.values(emotionCounts))
    if (maxCount === 0) return 'normal'
    
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count === maxCount) return emotion
    }
    
    return 'normal'
  },

  // Voice actions
  playAudioResponse: async (audioUrl) => {
    set({ isSpeaking: true })
    
    try {
      // Construct full URL if it's a relative path
      const fullUrl = audioUrl.startsWith('http') ? audioUrl : `http://localhost:8000${audioUrl}`
      console.log('🔊 Playing audio:', fullUrl)
      
      const audio = new Audio(fullUrl)
      audio.onended = () => {
        console.log('✅ Audio playback finished')
        set({ isSpeaking: false })
      }
      await audio.play()
      console.log('▶️ Audio playback started')
    } catch (error) {
      console.error('❌ Failed to play audio:', error)
      set({ isSpeaking: false })
    }
  },
  
  setRecording: (isRecording) => set({ isRecording }),
  
  // Clear chat
  clearChat: () => set({ messages: [] }),
  
  // Guest mode actions
  enableGuestMode: async () => {
    set({ isGuestMode: true })
    // Load profiles and set Rohan as default
    const profiles = get().profiles
    if (profiles.length === 0) {
      await get().loadProfiles()
    }
    const updatedProfiles = get().profiles
    const rohan = updatedProfiles.find(p => p.id === 4) || updatedProfiles[updatedProfiles.length - 1]
    if (rohan) {
      set({ currentProfile: rohan })
      console.log('✅ Guest mode enabled with profile:', rohan.name)
    }
  },
  
  disableGuestMode: () => {
    set({ isGuestMode: false })
    console.log('✅ Guest mode disabled')
  },

  // Memory settings actions
  updateMemorySettings: async (newSettings) => {
    const currentSettings = get().memorySettings
    const updatedSettings = { ...currentSettings, ...newSettings }
    set({ memorySettings: updatedSettings })
    
    // Send to backend to update profile settings
    try {
      const profile = get().currentProfile
      if (profile) {
        await profileAPI.updateProfile(profile.id, {
          memory_decay_rate: updatedSettings.decay_rate,
          recall_depth: updatedSettings.recall_depth,
          emotion_weight: updatedSettings.emotion_weight,
        })
        console.log('✅ Memory settings updated on backend')
      }
    } catch (error) {
      console.error('❌ Failed to update memory settings:', error)
    }
  },

  resetMemory: async () => {
    try {
      const profile = get().currentProfile
      if (profile) {
        // Clear chat history
        await chatAPI.deleteChatHistory(profile.id, 'anonymous')
        
        // Clear all memories
        await memoryAPI.deleteAllMemories(profile.id, 'anonymous')
        
        // Clear local state
        set({ messages: [], memories: [], memoryStats: null })
        
        console.log('✅ Memory reset successful')
      }
    } catch (error) {
      console.error('❌ Failed to reset memory:', error)
      throw error
    }
  },
}))

export default useStore
