import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState('normal') // All possible emotions
  const [inputText, setInputText] = useState('')

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
    // Eye shapes for ALL emotions - same size, different shapes
    const getEyeShape = () => {
      switch(emotion) {
        case 'excited':
          return { borderRadius: '50%', transform: 'scale(1)', left: '50%', right: '50%' }
        case 'happy':
          return { borderRadius: '50%', transform: 'scale(1)', left: '50%', right: '50%' }
        case 'surprised':
          return { borderRadius: '50%', transform: 'scale(1.1)', left: '50%', right: '50%' } // Wide open
        case 'confused':
          return { borderRadius: '50%', transform: 'scale(1)', left: '45%', right: '55%' } // Asymmetric
        case 'thinking':
          return { borderRadius: '50%', transform: 'translateY(-5px)', left: '50%', right: '50%' } // Raised
        case 'worried':
          return { borderRadius: '50% 50% 40% 40% / 60% 60% 40% 40%', transform: 'scale(1)', left: '50%', right: '50%' } // Raised worried
        case 'sleepy':
          return { borderRadius: '50%', transform: 'scaleY(0.3)', left: '50%', right: '50%' } // Half closed
        case 'loving':
          return { borderRadius: '50%', transform: 'scale(1)', left: '50%', right: '50%' } // Heart shape (will add hearts)
        case 'laughing':
          return { borderRadius: '50%', transform: 'scaleY(0.4)', left: '50%', right: '50%' } // Squinting from laughing
        case 'sad':
          return { borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', transform: 'scale(1)', left: '50%', right: '50%' } // Teardrop
        case 'angry':
          return { borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%', transform: 'scaleY(0.7)', left: '50%', right: '50%' } // Narrow
        case 'mischievous':
          return { borderRadius: '50%', transform: 'scale(1)', left: '80%', right: '30%' } // Wink (left closed, right open)
        case 'embarrassed':
          return { borderRadius: '50%', transform: 'scale(0.85)', left: '50%', right: '50%' } // Small shy eyes
        case 'disgusted':
          return { borderRadius: '50%', transform: 'scaleY(0.6)', left: '50%', right: '50%' } // Squinted disgust
        case 'proud':
          return { borderRadius: '50%', transform: 'scale(1)', left: '50%', right: '50%' } // Confident eyes
        default:
          return { borderRadius: '50%', transform: 'scale(1)', left: '50%', right: '50%' }
      }
    }

    // Mouth SVG paths for ALL emotions
    const getMouthPath = () => {
      switch(emotion) {
        case 'excited':
          return "M 20 5 Q 100 70, 180 5" // Big excited smile
        case 'happy':
          return "M 20 20 Q 100 50, 180 20" // Normal smile
        case 'surprised':
          return "M 60 25 Q 100 60, 140 25 Q 100 50, 60 25" // Open O mouth
        case 'confused':
          return "M 20 30 Q 60 35, 100 25 Q 140 35, 180 30" // Wavy confused
        case 'thinking':
          return "M 40 30 L 160 30" // Small straight line
        case 'worried':
          return "M 20 40 Q 100 25, 180 40" // Worried frown
        case 'sleepy':
          return "M 60 30 Q 100 40, 140 30" // Small yawn
        case 'loving':
          return "M 20 15 Q 100 60, 180 15" // Big warm smile
        case 'laughing':
          return "M 20 5 Q 100 75, 180 5" // Huge laugh
        case 'sad':
          return "M 20 45 Q 100 10, 180 45" // Sad frown
        case 'angry':
          return "M 20 30 L 80 30 M 120 30 L 180 30" // Gritted teeth
        case 'mischievous':
          return "M 20 25 Q 60 35, 100 30 Q 140 25, 180 20" // Smirk
        case 'embarrassed':
          return "M 40 35 Q 100 45, 160 35" // Small shy smile
        case 'disgusted':
          return "M 20 35 Q 60 25, 100 30 Q 140 25, 180 35" // Downturned disgust
        case 'proud':
          return "M 20 25 Q 100 45, 180 25" // Confident smile
        default:
          return "M 20 30 Q 100 35, 180 30" // Neutral
      }
    }

    const eyeShape = getEyeShape()

    return (
      <>
        {/* Two eyes - fixed size, shape changes based on emotion */}
        <div className="flex gap-24 mb-12 justify-center items-center">
          {/* Left eye */}
          <motion.div 
            className="bg-veon-orange w-20 h-20"
            animate={{
              borderRadius: eyeShape.borderRadius,
              transform: eyeShape.transform,
              scaleX: emotion === 'mischievous' ? 0.2 : 1, // Wink effect
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

        {/* Additional visual elements for special emotions */}
        {emotion === 'loving' && (
          <div className="flex justify-center gap-8 mb-4">
            <span className="text-2xl">❤️</span>
            <span className="text-2xl">❤️</span>
          </div>
        )}

        {/* Mouth - path changes based on emotion */}
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
