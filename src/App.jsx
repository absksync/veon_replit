import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('normal') // normal, happy, sad, excited, angry
  const [inputText, setInputText] = useState('')

  // Enhanced sentiment analysis function
  const analyzeSentiment = (text) => {
    const lowerText = text.toLowerCase()
    
    // Excited/Very Happy keywords - wide eyes, big smile
    const excitedWords = ['amazing', 'awesome', 'great', 'love', 'wonderful', 'excited', 'fantastic', 
                          'excellent', 'yay', 'wow', 'incredible', 'outstanding', 'brilliant', 'superb',
                          '!', '😄', '🎉', '❤️', 'best', 'perfect', 'beautiful']
    
    // Sad keywords - droopy eyes, frown
    const sadWords = ['sad', 'sorry', 'depressed', 'unhappy', 'terrible', 'awful', 'crying', 
                      'hurt', 'miss', 'lonely', 'disappointed', 'upset', '😢', '😔', 'pain',
                      'lost', 'broken', 'devastated']
    
    // Angry keywords - narrow eyes, straight mouth
    const angryWords = ['angry', 'mad', 'furious', 'hate', 'annoyed', 'frustrated', 'irritated', 
                        'pissed', 'outraged', 'livid', '😠', '😡', 'damn', 'stupid', 'rage']
    
    // Happy (moderate) - normal eyes, smile
    const happyWords = ['good', 'nice', 'fine', 'okay', 'pleasant', 'smile', 'glad', 'content',
                        'satisfied', 'cheerful', 'happy', '😊', 'thanks', 'appreciate']
    
    // Count matches for each emotion
    let excitedCount = 0
    let sadCount = 0
    let angryCount = 0
    let happyCount = 0
    
    excitedWords.forEach(word => {
      if (lowerText.includes(word)) excitedCount++
    })
    sadWords.forEach(word => {
      if (lowerText.includes(word)) sadCount++
    })
    angryWords.forEach(word => {
      if (lowerText.includes(word)) angryCount++
    })
    happyWords.forEach(word => {
      if (lowerText.includes(word)) happyCount++
    })
    
    // Check for multiple exclamation marks (excitement)
    if ((text.match(/!/g) || []).length >= 2) excitedCount += 2
    
    // Determine emotion based on highest count
    const maxCount = Math.max(excitedCount, sadCount, angryCount, happyCount)
    
    if (maxCount === 0) return 'normal'
    
    if (excitedCount === maxCount) return 'excited'
    if (sadCount === maxCount) return 'sad'
    if (angryCount === maxCount) return 'angry'
    if (happyCount === maxCount) return 'happy'
    
    return 'normal'
  }

  const handleInputChange = (e) => {
    const text = e.target.value
    setInputText(text)
    
    // Analyze sentiment on every input change
    if (text.length > 3) {
      const emotion = analyzeSentiment(text)
      setCurrentEmotion(emotion)
    } else {
      setCurrentEmotion('normal')
    }
  }

  // Face component that changes based on emotion
  const EmotionalFace = ({ emotion }) => {
    // Eye shapes for different emotions - same size, different shapes
    const getEyeShape = () => {
      switch(emotion) {
        case 'excited':
          return { borderRadius: '50%', transform: 'scale(1)' } // Round excited eyes
        case 'happy':
          return { borderRadius: '50%', transform: 'scale(1)' } // Round happy eyes
        case 'sad':
          return { borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', transform: 'scale(1)' } // Teardrop shape
        case 'angry':
          return { borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%', transform: 'scaleY(0.7)' } // Squinted/narrow
        default:
          return { borderRadius: '50%', transform: 'scale(1)' } // Normal round
      }
    }

    // Mouth SVG paths for different emotions
    const getMouthPath = () => {
      switch(emotion) {
        case 'excited':
          return "M 20 5 Q 100 70, 180 5" // Big excited smile
        case 'happy':
          return "M 20 20 Q 100 50, 180 20" // Normal smile
        case 'sad':
          return "M 20 45 Q 100 10, 180 45" // Sad frown
        case 'angry':
          return "M 20 30 L 80 30 M 120 30 L 180 30" // Angry gritted teeth
        default:
          return "M 20 30 Q 100 35, 180 30" // Neutral
      }
    }

    const eyeShape = getEyeShape()

    return (
      <>
        {/* Two eyes - fixed size, only shape changes */}
        <div className="flex gap-24 mb-12 justify-center items-center">
          {/* Left eye */}
          <motion.div 
            className="bg-veon-orange w-20 h-20"
            animate={{
              borderRadius: eyeShape.borderRadius,
              transform: eyeShape.transform,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />

          {/* Right eye */}
          <motion.div 
            className="bg-veon-orange w-20 h-20"
            animate={{
              borderRadius: eyeShape.borderRadius,
              transform: eyeShape.transform,
            }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Mouth - only path changes */}
        <div className="flex justify-center">
          <svg width="200" height="80" viewBox="0 0 200 80" className="mx-auto">
            <motion.path
              d={getMouthPath()}
              stroke="#FFB000"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              animate={{ d: getMouthPath() }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </div>

        {/* Emotion label */}
        <div className="text-center mt-2 text-veon-orange/60 text-sm font-light">
          {emotion === 'normal' ? 'neutral' : emotion}
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
              <button className="w-full text-left text-veon-orange hover:bg-veon-orange hover:text-black px-4 py-3 rounded-lg transition-all">
                About VEON
              </button>
              <button className="w-full text-left text-veon-orange hover:bg-veon-orange hover:text-black px-4 py-3 rounded-lg transition-all">
                How it works
              </button>
              <button className="w-full text-left text-veon-orange hover:bg-veon-orange hover:text-black px-4 py-3 rounded-lg transition-all">
                Settings
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth buttons in top right corner */}
      <div className="absolute top-6 right-6 z-50 flex gap-3 items-center">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-6 py-2 rounded-full border-2 border-veon-orange text-veon-orange hover:bg-veon-orange hover:text-black transition-all">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="px-6 py-2 rounded-full bg-veon-orange text-black font-semibold transition-all">
              Sign Up
            </button>
          </SignUpButton>
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

      {/* Main content container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-8">
        
        {/* AI Face - Simple circular eyes and smile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="mb-16 relative"
        >
          {/* Static ambient glow - no animation */}
          <div
            className="absolute inset-0 -m-20 rounded-full opacity-20 blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(255,176,0,0.2) 0%, transparent 70%)',
            }}
          />
          <div className="relative">
            <EmotionalFace emotion={currentEmotion} />
          </div>
        </motion.div>

        {/* Tagline - Poetic hint text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-veon-orange text-base mb-12 tracking-wide font-light"
        >
          VEON — Say hello… I'll remember you. For a while.
        </motion.p>

        {/* Chat interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Chat input container */}
          <div className="relative flex items-center gap-4">
            {/* Text input - static */}
            <input
              type="text"
              placeholder="Type your message..."
              value={inputText}
              onChange={handleInputChange}
              className="flex-1 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-800 rounded-full px-8 py-5 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-veon-orange transition-colors"
            />

            {/* Mic button - static, no animation */}
            <motion.button
              className="relative w-16 h-16 rounded-full bg-veon-orange flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Mic SVG icon */}
              <svg 
                className="w-7 h-7 text-black" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            </motion.button>
          </div>

        </motion.div>

      </div>
    </div>
  )
}

export default App
