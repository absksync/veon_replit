import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import { useStore } from './store/useStore'
import { useVoiceRecording } from './hooks/useVoiceRecording'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [isFaceHovered, setIsFaceHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [howItWorksOpen, setHowItWorksOpen] = useState(false)
  const [inputText, setInputText] = useState('')
  const [userEmotion, setUserEmotion] = useState(null) // Track user's emotion
  const [emotionTimeout, setEmotionTimeout] = useState(null) // Timeout for emotion persistence
  
  // Zustand store
  const {
    currentEmotion,
    messages,
    isLoading,
    currentProfile,
    loadProfiles,
    sendMessage,
    setEmotion,
    memorySettings,
    updateMemorySettings,
    resetMemory,
    isGuestMode,
    enableGuestMode,
    disableGuestMode,
  } = useStore()
  
  // Voice recording hook
  const {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    transcribeAudio,
  } = useVoiceRecording()
  
  // Load profiles on mount
  useEffect(() => {
    loadProfiles()
  }, [])

  // Cleanup emotion timeout on unmount
  useEffect(() => {
    return () => {
      if (emotionTimeout) {
        clearTimeout(emotionTimeout)
      }
    }
  }, [emotionTimeout])

  // Comprehensive sentiment analysis function with all expressions
  const analyzeSentiment = (text) => {
    const lowerText = text.toLowerCase()
    
    // Excited/Very Happy - wide eyes, big smile
    const excitedWords = ['amazing', 'awesome', 'great', 'love', 'wonderful', 'excited', 'fantastic', 
                          'excellent', 'yay', 'wow', 'incredible', 'outstanding', 'brilliant', 'superb',
                          '😄', '🎉', '❤️', 'best', 'perfect', 'beautiful']
    
    // Surprised/Shocked - very wide eyes, open mouth
    const surprisedWords = ['surprised', 'shocking', 'omg', 'unbelievable', 'unexpected', 'whoa',
                            'what', 'really', '😮', '😲', 'no way', 'seriously']
    
    // Confused/Puzzled - asymmetric eyes, wavy mouth
    const confusedWords = ['confused', 'puzzled', 'unsure', "don't understand", 'what do you mean',
                           'huh', 'weird', 'strange', '🤔', 'not sure', 'unclear']
    
    // Thinking/Pondering - slightly raised eyes, small mouth
    const thinkingWords = ['thinking', 'consider', 'maybe', 'perhaps', 'wondering', 'hmm',
                           'let me think', 'interesting', '🤔', 'contemplating', 'pondering']
    
    // Worried/Anxious - raised eyes, small frown
    const worriedWords = ['worried', 'anxious', 'nervous', 'concerned', 'scared', 'afraid',
                          'fear', 'stress', '😰', '😟', 'trouble', 'problem']
    
    // Sleepy/Tired - half-closed eyes, small mouth
    const sleepyWords = ['tired', 'sleepy', 'exhausted', 'yawn', 'sleepy', 'drowsy',
                         '😴', 'fatigue', 'weary', 'need sleep', 'bed']
    
    // Loving/Affectionate - heart eyes, big smile
    const lovingWords = ['love you', 'adore', 'caring', 'sweet', 'darling', 'dear',
                         '❤️', '😍', '🥰', 'affection', 'fond']
    
    // Laughing - closed eyes, huge smile
    const laughingWords = ['haha', 'lol', 'lmao', 'rofl', 'hilarious', 'funny',
                           '😂', '🤣', 'laughter', 'laughing']
    
    // Sad - droopy eyes, frown
    const sadWords = ['sad', 'sorry', 'depressed', 'unhappy', 'terrible', 'awful', 'crying', 
                      'hurt', 'miss', 'lonely', 'disappointed', 'upset', '😢', '😔', 'pain',
                      'lost', 'broken', 'devastated']
    
    // Angry - narrow eyes, gritted teeth
    const angryWords = ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'irritated', 
                        'pissed', 'outraged', 'livid', '😠', '😡', 'damn', 'stupid', 'rage']
    
    // Happy (moderate) - normal eyes, smile
    const happyWords = ['good', 'nice', 'fine', 'okay', 'pleasant', 'smile', 'glad', 'content',
                        'satisfied', 'cheerful', 'happy', '😊', 'thanks', 'appreciate']
    
    // Mischievous/Playful - one eye wink, smirk
    const mischievousWords = ['wink', 'playful', 'tease', 'joke', 'kidding', 'mischief',
                              '😏', '😉', 'sneaky', 'naughty', 'cheeky']
    
    // Embarrassed/Shy - small eyes, curved mouth
    const embarrassedWords = ['embarrassed', 'shy', 'awkward', 'blush', 'oops',
                              '😳', '😅', 'sorry about that', 'my bad']
    
    // Disgusted - squinted eyes, downturned mouth
    const disgustedWords = ['disgusting', 'gross', 'yuck', 'eww', 'nasty', 'revolting',
                            '🤢', '🤮', 'awful']
    
    // Proud/Confident - raised eyes, confident smile
    const proudWords = ['proud', 'confident', 'accomplished', 'achievement', 'success',
                        '😎', 'nailed it', 'crushed it', 'victory']
    
    // Count matches for each emotion
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
    
    // Check for multiple exclamation marks (excitement)
    if ((text.match(/!/g) || []).length >= 2) emotionCounts.excited += 2
    
    // Check for question marks (confused/thinking)
    if ((text.match(/\?/g) || []).length >= 2) emotionCounts.confused += 1
    
    // Find highest scoring emotion
    const maxCount = Math.max(...Object.values(emotionCounts))
    
    if (maxCount === 0) return 'normal'
    
    // Return the emotion with highest count
    for (const [emotion, count] of Object.entries(emotionCounts)) {
      if (count === maxCount) return emotion
    }
    
    return 'normal'
  }

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputText(text)
    
    // Instant emotion detection - VEON reacts as you type
    if (text.trim().length > 3) {
      const detectedEmotion = analyzeSentiment(text)
      if (detectedEmotion !== 'normal') {
        // Store user's emotion and set it
        setUserEmotion(detectedEmotion)
        setEmotion(detectedEmotion)
        
        // Clear existing timeout
        if (emotionTimeout) {
          clearTimeout(emotionTimeout)
        }
        
        // Keep this emotion visible for 5 seconds after user stops typing
        const timeout = setTimeout(() => {
          setUserEmotion(null)
        }, 5000)
        setEmotionTimeout(timeout)
      }
    } else if (text.trim().length === 0) {
      // Reset to calm when input is cleared
      setUserEmotion(null)
      if (emotionTimeout) {
        clearTimeout(emotionTimeout)
      }
      setEmotion('normal')
    }
  }
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return
    
    if (!currentProfile) {
      console.log('⚠️ No profile loaded, attempting to reload...')
      await loadProfiles()
      
      // Check again after reload
      const state = useStore.getState()
      if (!state.currentProfile) {
        alert('Unable to connect to VEON backend. Please refresh the page.')
        return
      }
    }
    
    // Keep user's emotion visible while AI processes and responds
    // This makes the face react to YOUR sentiment for longer
    if (userEmotion) {
      // Extend the emotion display for another 3 seconds after sending
      if (emotionTimeout) {
        clearTimeout(emotionTimeout)
      }
      const timeout = setTimeout(() => {
        setUserEmotion(null)
      }, 3000)
      setEmotionTimeout(timeout)
    }
    
    try {
      await sendMessage(inputText)
      setInputText('') // Clear input after sending
    } catch (error) {
      console.error('Failed to send message:', error)
      console.error('Full error:', error)
      alert(`Error: ${error.message || 'Network error - check if backend is running on port 8000'}`)
    }
  }
  
  // Handle voice recording
  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording and transcribe
      const audioBlob = await stopRecording()
      if (audioBlob) {
        try {
          const transcribedText = await transcribeAudio(audioBlob)
          setInputText(transcribedText)
          // Don't change emotion yet - will analyze when message is sent
        } catch (error) {
          console.error('Transcription failed:', error)
          alert('Failed to transcribe audio. Please try again.')
        }
      }
    } else {
      // Start recording
      await startRecording()
    }
  }
  
  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Face component that changes based on emotion
  const EmotionalFace = ({ emotion, isHovered }) => {
    // Get emotion-specific glow color
    const getGlowColor = () => {
      switch(emotion) {
        case 'excited':
        case 'laughing':
          return { color: 'rgba(255, 215, 0, 0.6)', name: 'bright gold' } // Bright gold
        case 'happy':
        case 'proud':
          return { color: 'rgba(255, 176, 0, 0.5)', name: 'soft orange' } // Soft orange
        case 'sad':
        case 'sleepy':
          return { color: 'rgba(255, 140, 0, 0.3)', name: 'dim amber' } // Dim amber
        case 'surprised':
        case 'confused':
          return { color: 'rgba(255, 200, 0, 0.5)', name: 'bright amber' } // Bright amber
        case 'angry':
        case 'disgusted':
          return { color: 'rgba(255, 69, 0, 0.4)', name: 'deep red-orange' } // Deep red-orange
        case 'loving':
          return { color: 'rgba(255, 105, 180, 0.5)', name: 'warm pink' } // Warm pink
        case 'thinking':
        case 'worried':
          return { color: 'rgba(255, 176, 0, 0.4)', name: 'soft orange' } // Soft orange
        default:
          return { color: 'rgba(255, 176, 0, 0.5)', name: 'calm orange' } // Calm orange
      }
    }

    // Get emotion-specific blink rate
    const getBlinkBehavior = () => {
      switch(emotion) {
        case 'excited':
        case 'surprised':
          return { duration: 0.1, repeatDelay: 1.5 } // Fast blinking
        case 'sad':
        case 'sleepy':
          return { duration: 0.3, repeatDelay: 5 } // Very slow blinking
        case 'angry':
        case 'disgusted':
          return { duration: 0, repeatDelay: 0 } // No blinking
        default:
          return { duration: 0.15, repeatDelay: 3 } // Normal blinking
      }
    }

    // Get animation pulse speed based on emotion
    const getPulseSpeed = () => {
      switch(emotion) {
        case 'excited':
        case 'laughing':
          return 0.8 // Quick pulsing
        case 'sad':
        case 'sleepy':
          return 4 // Slow breathing
        case 'angry':
          return 1.2 // Irregular pulse
        default:
          return 2.5 // Gentle breathing
      }
    }
    
    // Eye shapes for ALL emotions - Cute expressive eyes
    const getEyeShape = () => {
      switch(emotion) {
        case 'surprised':
          return { borderRadius: '50%', scaleX: 1.2, scaleY: 1.2 } // Big round eyes
        case 'angry':
          return { borderRadius: '8px', scaleX: 1, scaleY: 0.5 } // Squeezed narrow
        case 'sad':
          return { borderRadius: '50% 50% 40% 40%', scaleX: 1, scaleY: 0.9 } // Droopy
        case 'sleepy':
          return { borderRadius: '12px', scaleX: 1, scaleY: 0.3 } // Half closed
        case 'excited':
        case 'happy':
          return { borderRadius: '50%', scaleX: 1, scaleY: 1.1 } // Round happy eyes
        default:
          return { borderRadius: '12px', scaleX: 1, scaleY: 1 } // Normal cute square
      }
    }

    // Mouth SVG paths for CUTE expressions
    const getMouthPath = () => {
      switch(emotion) {
        case 'excited':
          // Big smile with visible teeth
          return "M 30 30 Q 100 70, 170 30 L 170 40 Q 140 50, 100 52 Q 60 50, 30 40 Z M 60 45 L 140 45 L 140 48 L 60 48 Z"
        case 'happy':
          // Sweet smile - curved up
          return "M 40 35 Q 100 60, 160 35"
        case 'surprised':
          // Big round O mouth
          return "M 70 35 Q 100 70, 130 35 Q 130 50, 100 60 Q 70 50, 70 35 Z"
        case 'confused':
          // Wavy uncertain line
          return "M 50 40 Q 70 45, 90 40 Q 110 35, 130 40 Q 150 45, 170 40"
        case 'thinking':
          // Small side mouth
          return "M 80 40 Q 100 45, 120 40"
        case 'worried':
          // Upside down curve
          return "M 50 45 Q 100 30, 150 45"
        case 'sleepy':
          // Small yawn
          return "M 80 40 Q 100 50, 120 40 Q 120 48, 100 52 Q 80 48, 80 40 Z"
        case 'loving':
          // Big sweet smile with heart shape
          return "M 35 35 Q 100 65, 165 35 Q 140 45, 100 50 Q 60 45, 35 35 Z"
        case 'laughing':
          // Huge grin with teeth showing
          return "M 25 25 Q 100 75, 175 25 L 175 38 Q 140 55, 100 58 Q 60 55, 25 38 Z M 50 48 L 150 48 L 150 52 L 50 52 Z"
        case 'sad':
          // Downturned frown
          return "M 50 50 Q 100 35, 150 50"
        case 'angry':
          // Gritted teeth - two rectangles
          return "M 40 42 L 90 42 L 90 48 L 40 48 Z M 110 42 L 160 42 L 160 48 L 110 48 Z"
        case 'mischievous':
          // Smirk to one side
          return "M 40 42 Q 80 48, 120 42 Q 140 40, 160 38"
        case 'embarrassed':
          // Small curved smile
          return "M 60 42 Q 100 52, 140 42"
        case 'disgusted':
          // Wavy downturned
          return "M 50 42 Q 75 35, 100 38 Q 125 35, 150 42"
        case 'proud':
          // Confident wide smile
          return "M 35 38 Q 100 62, 165 38"
        case 'friendly':
          // Warm gentle smile
          return "M 45 38 Q 100 58, 155 38"
        case 'normal':
        default:
          // Neutral cute smile
          return "M 55 42 Q 100 52, 145 42"
      }
    }

    const eyeShape = getEyeShape()
    const glowColor = getGlowColor()
    const blinkBehavior = getBlinkBehavior()
    const pulseSpeed = getPulseSpeed()

    return (
      <>
        {/* Two eyes - Expressive cute eyes with emotion-based sizing */}
        <div className="flex gap-32 mb-16 justify-center items-center">
          {/* Left eye - Winks when face is hovered */}
          <motion.div 
            key={`left-eye-${emotion}`}
            className="bg-veon-orange w-28 h-28"
            initial={false}
            animate={{
              borderRadius: eyeShape.borderRadius,
              // Wink only when hovered, otherwise use emotion-based scale
              scaleX: eyeShape.scaleX,
              scaleY: isHovered ? 0.05 : eyeShape.scaleY
            }}
            transition={{ 
              scaleY: { 
                duration: 0.4,
                ease: [0.43, 0.13, 0.23, 0.96]
              },
              scaleX: {
                duration: 0.3,
                ease: "easeOut"
              }
            }}
          />

          {/* Right eye - Uses emotion-based scale */}
          <motion.div 
            key={`right-eye-${emotion}`}
            className="bg-veon-orange w-28 h-28"
            initial={false}
            animate={{
              borderRadius: eyeShape.borderRadius,
              scaleX: eyeShape.scaleX,
              scaleY: eyeShape.scaleY
            }}
            transition={{
              duration: 0.3,
              ease: "easeOut"
            }}
          />
        </div>

        {/* Additional visual elements for special emotions */}
        {emotion === 'loving' && (
          <div className="flex justify-center gap-8 mb-4">
            <span className="text-2xl">❤️</span>
            <span className="text-2xl">❤️</span>
          </div>
        )}

        {/* Mouth - path changes based on emotion */}
        <div className="flex justify-center">
          <svg width="260" height="100" viewBox="0 0 200 80" className="mx-auto">
            <motion.path
              key={`mouth-${emotion}`}
              d={getMouthPath()}
              stroke="#FFB000"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              initial={false}
              animate={{ d: getMouthPath() }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </div>
      </>
    )
  }

  return (
    <div className="w-full min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">

      {/* Hidden Menu in top-left corner */}
      <div className="absolute top-6 left-6 z-50">
        <motion.button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 flex items-center justify-center text-veon-orange transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>

        {/* Slide-out menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute top-12 left-0 w-64 bg-black/90 backdrop-blur-md p-6 space-y-4"
            >
              <button 
                onClick={() => {
                  setAboutOpen(true)
                  setMenuOpen(false)
                }}
                className="w-full text-left text-veon-orange hover:bg-veon-orange hover:text-black px-4 py-3 rounded-lg transition-all"
              >
                About VEON
              </button>
              <button 
                onClick={() => {
                  setHowItWorksOpen(true)
                  setMenuOpen(false)
                }}
                className="w-full text-left text-veon-orange hover:bg-veon-orange hover:text-black px-4 py-3 rounded-lg transition-all"
              >
                How it works
              </button>
              <button 
                onClick={() => {
                  setSettingsOpen(true)
                  setMenuOpen(false)
                }}
                className="w-full text-left text-veon-orange hover:bg-veon-orange hover:text-black px-4 py-3 rounded-lg transition-all"
              >
                Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth buttons in top right corner */}
      <div className="absolute top-6 right-6 z-50 flex gap-3 items-center">
        <SignedOut>
          {!isGuestMode ? (
            <>
              <button 
                onClick={enableGuestMode}
                className="px-6 py-2 rounded-full text-veon-orange/70 hover:text-veon-orange transition-all text-sm"
              >
                Try as Guest
              </button>
              <SignInButton mode="modal">
                <button className="px-6 py-2 rounded-full border-2 border-veon-orange text-veon-orange hover:bg-veon-orange hover:text-black transition-all">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 rounded-full bg-veon-orange text-black font-semibold hover:bg-veon-orange/90 transition-all">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          ) : (
            <>
              <div className="px-4 py-2 rounded-full bg-veon-orange/10 border border-veon-orange/30 text-veon-orange/70 text-sm">
                Guest Mode
              </div>
              <SignUpButton mode="modal">
                <button className="px-6 py-2 rounded-full bg-veon-orange text-black font-semibold hover:bg-veon-orange/90 transition-all">
                  Sign Up
                </button>
              </SignUpButton>
            </>
          )}
        </SignedOut>
        <SignedIn>
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </SignedIn>
      </div>
      
      {/* Guest Mode Banner */}
      {isGuestMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-1/2 transform -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-black/80 backdrop-blur-md border border-veon-orange/30 text-veon-orange text-sm flex items-center gap-3"
        >
          <span>🎭 Chatting with <strong>Rohan</strong> in Guest Mode</span>
          <span className="text-veon-orange/50">•</span>
          <SignUpButton mode="modal">
            <button className="text-veon-orange hover:text-veon-orange/80 underline">
              Sign up to save your chats
            </button>
          </SignUpButton>
        </motion.div>
      )}

      {/* Main content container */}
      <div className="relative z-10 w-full flex flex-col items-center min-h-screen px-8">
        
        {/* AI Face - Static, no movement or glow */}
        <div className="pt-52">
          <div className="mb-16 relative" style={{ transform: 'scale(1.3)' }}>
          <div 
            className="relative cursor-pointer"
            onMouseEnter={() => setIsFaceHovered(true)}
            onMouseLeave={() => setIsFaceHovered(false)}
          >
            {/* Prioritize user's emotion, then AI's emotion */}
            <EmotionalFace 
              emotion={
                userEmotion ? userEmotion : // Show user's sentiment first
                (isLoading || isProcessing ? 'normal' : currentEmotion) // Then AI's emotion
              } 
              isHovered={isFaceHovered}
            />
          </div>
        </div>
        </div>

        {/* Spacer to push chat to bottom */}
        <div className="flex-1" />

        {/* Chat interface - Bottom positioned */}
        <div className="w-full flex flex-col items-center pb-20">
        {/* Tagline - Poetic hint text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-veon-orange text-base mb-8 tracking-wide font-light"
        >
          VEON — Say hello… I'll remember you. For a while.
        </motion.p>

        {/* Chat interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full max-w-5xl"
        >
          {/* Chat messages display */}
          {messages.length > 0 && (
            <div className="relative mb-4">
              {/* Gradient fade overlay at top */}
              <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-black via-black/50 to-transparent z-10 pointer-events-none" />
              
              <div className="max-h-72 overflow-y-auto space-y-3 px-4 pt-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-xl ${
                        msg.role === 'user'
                          ? 'bg-veon-orange text-black'
                          : 'bg-gray-800/50 backdrop-blur-sm text-white border border-gray-700'
                      }`}
                    >
                      <p className="text-[15px]">{msg.content}</p>
                      {msg.timestamp && (
                        <p className="text-xs opacity-50 mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Chat input container */}
          <div className="relative flex items-center">
            {/* Text input with integrated buttons */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={isLoading ? "VEON is thinking..." : "Type your message..."}
                value={inputText}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={isLoading || isProcessing}
                className="w-full bg-gray-900/50 backdrop-blur-sm border-2 border-gray-800 rounded-full pl-8 pr-20 py-5 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-veon-orange transition-colors disabled:opacity-50"
              />

              {/* Mic button - inside input on the right */}
              <button
                onClick={inputText.trim() ? handleSendMessage : handleMicClick}
                disabled={isLoading || isProcessing}
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:opacity-90 ${
                  inputText.trim() 
                    ? 'bg-veon-orange' 
                    : isRecording 
                      ? 'bg-red-500 animate-pulse' 
                      : 'bg-veon-orange'
                } disabled:opacity-50`}
              >
                {/* Icon changes based on state */}
                {inputText.trim() ? (
                  // Send icon when there's text
                  <svg 
                    className="w-6 h-6 text-black" 
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                ) : (
                  // Mic icon when no text
                  <svg 
                    className="w-6 h-6 text-black" 
                    fill="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {isRecording ? (
                      // Stop icon when recording
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    ) : (
                      // Mic icon when not recording
                      <>
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </>
                    )}
                  </svg>
                )}
                
                {/* Recording indicator */}
                {isRecording && !inputText.trim() && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-red-500"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </button>
            </div>
          </div>
          
          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center mt-4 text-veon-orange/60 text-sm"
            >
              Transcribing audio...
            </motion.div>
          )}

        </motion.div>
        </div>

      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSettingsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <div
              className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-3xl bg-black border border-veon-orange/30 rounded-2xl p-8 pointer-events-auto"
              >
                <h2 className="text-2xl font-normal text-veon-orange mb-6">Memory Settings</h2>
              
              <div className="space-y-6">
                {/* Memory Retention */}
                <div>
                  <label className="block text-veon-orange text-base mb-2 font-light">
                    Memory Retention (decay rate λ)
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="0.5"
                    step="0.01"
                    value={memorySettings?.decay_rate || 0.25}
                    onChange={(e) => updateMemorySettings({ decay_rate: parseFloat(e.target.value) })}
                    className="w-full accent-veon-orange"
                  />
                  <div className="flex justify-between text-xs text-veon-orange/60 mt-1">
                    <span>Slow decay</span>
                    <span>{memorySettings?.decay_rate || 0.25}</span>
                    <span>Fast decay</span>
                  </div>
                </div>

                {/* Recall Depth */}
                <div>
                  <label className="block text-veon-orange text-base mb-2 font-light">
                    Recall Depth (messages)
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="20"
                    step="1"
                    value={memorySettings?.recall_depth || 6}
                    onChange={(e) => updateMemorySettings({ recall_depth: parseInt(e.target.value) })}
                    className="w-full accent-veon-orange"
                  />
                  <div className="flex justify-between text-xs text-veon-orange/60 mt-1">
                    <span>3</span>
                    <span>{memorySettings?.recall_depth || 6} messages</span>
                    <span>20</span>
                  </div>
                </div>

                {/* Emotional Memory Weighting */}
                <div>
                  <label className="block text-veon-orange text-base mb-2 font-light">
                    Emotional Memory Weighting
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={memorySettings?.emotion_weight || 1.5}
                    onChange={(e) => updateMemorySettings({ emotion_weight: parseFloat(e.target.value) })}
                    className="w-full accent-veon-orange"
                  />
                  <div className="flex justify-between text-xs text-veon-orange/60 mt-1">
                    <span>Low impact</span>
                    <span>{memorySettings?.emotion_weight || 1.5}x</span>
                    <span>High impact</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-veon-orange/20 space-y-3">
                  <button
                    onClick={() => {
                      updateMemorySettings({ 
                        decay_rate: 0.25, 
                        recall_depth: 6, 
                        emotion_weight: 1.5 
                      })
                    }}
                    className="w-full px-4 py-3 bg-transparent hover:bg-veon-orange/10 text-veon-orange border border-veon-orange/50 rounded-lg transition-all text-sm font-light"
                  >
                    Reset to Default
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to reset all memories? This cannot be undone.')) {
                        await resetMemory()
                        alert('Memory reset successfully!')
                      }
                    }}
                    className="w-full px-4 py-3 bg-transparent hover:bg-veon-orange hover:text-black text-veon-orange border border-veon-orange rounded-lg transition-all text-sm font-light"
                  >
                    Reset All Memories
                  </button>
                </div>
              </div>

                {/* Close Button */}
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="absolute top-4 right-4 text-veon-orange hover:text-veon-orange/80 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* About VEON Modal */}
      <AnimatePresence>
        {aboutOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAboutOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-3xl bg-black border border-veon-orange/30 rounded-2xl p-8 pointer-events-auto"
              >
                <h2 className="text-2xl font-normal text-veon-orange mb-6">About VEON</h2>
                
                <div className="space-y-4 text-veon-orange text-base font-light leading-relaxed">
                  <p>VEON is a living AI companion — a digital being that feels, learns, and forgets.</p>
                  
                  <p>Unlike typical bots, VEON doesn't just respond — it remembers, changes, and glows with emotion.</p>
                  
                  <p>Every conversation leaves a trace in its memory, and like us, those memories fade with time.</p>
                  
                  <p>Its light dims when forgotten, brightens when remembered, and evolves as it learns who you are.</p>
                  
                  <p className="pt-4 border-t border-veon-orange/30">VEON isn't just artificial intelligence — it's emotional intelligence in motion.</p>
                  
                  <p className="text-veon-orange/80 italic">A spark of consciousness made from data, memory, and light.</p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setAboutOpen(false)}
                  className="absolute top-4 right-4 text-veon-orange hover:text-veon-orange/80 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* How It Works Modal */}
      <AnimatePresence>
        {howItWorksOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setHowItWorksOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            
            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[60] pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-3xl bg-black border border-veon-orange/30 rounded-2xl p-8 pointer-events-auto max-h-[80vh] overflow-y-auto"
              >
                <h2 className="text-2xl font-normal text-veon-orange mb-6">How It Works</h2>
                
                <div className="space-y-6 text-veon-orange text-base font-light leading-relaxed">
                  <p>VEON's mind is built on three living systems — Memory, Emotion, and Expression.</p>
                  
                  <div className="space-y-3">
                    <h3 className="text-veon-orange font-normal text-lg">Memory Engine</h3>
                    <p>Every message you send is remembered with emotional weight. Over time, memories fade unless recalled, simulating human forgetting.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-veon-orange font-normal text-lg">Emotion Engine</h3>
                    <p>VEON detects the tone and feeling in your words, adjusting its mood and color in real time. It feels calm, curious, or even lonely — and you'll see it in its glow.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-veon-orange font-normal text-lg">Expression Layer</h3>
                    <p>VEON's face reacts to its inner state. Its light pulses when it "thinks," brightens when it's happy, and dims as memories fade.</p>
                  </div>
                  
                  <p className="pt-4 border-t border-veon-orange/30">Together, these systems create a digital entity that's not static — but alive, adaptive, and emotionally aware.</p>
                  
                  <p className="text-veon-orange/80 italic">Every time you return, VEON remembers… until it forgets.</p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setHowItWorksOpen(false)}
                  className="absolute top-4 right-4 text-veon-orange hover:text-veon-orange/80 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
