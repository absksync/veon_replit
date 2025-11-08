import { useState } from 'react'
import { motion } from 'framer-motion'
import './App.css'

function App() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-black to-gray-900 flex flex-col items-center justify-center relative overflow-hidden">

      {/* Radial glow behind AI face */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255,176,0,0.4) 0%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Main content container */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center min-h-screen px-8">
        
        {/* AI Face - Simple circular eyes and smile */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="mb-16"
        >
          <div className="relative">
            {/* Two circular eyes */}
            <div className="flex gap-24 mb-12">
              {/* Left eye */}
              <motion.div
                animate={{
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div 
                  className="w-20 h-20 rounded-full bg-veon-orange"
                  style={{ 
                    boxShadow: '0 0 30px rgba(255,176,0,0.8), 0 0 50px rgba(255,176,0,0.4)',
                  }}
                />
              </motion.div>

              {/* Right eye */}
              <motion.div
                animate={{
                  opacity: [0.7, 1, 0.7],
                  scale: [1, 1.05, 1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              >
                <div 
                  className="w-20 h-20 rounded-full bg-veon-orange"
                  style={{ 
                    boxShadow: '0 0 30px rgba(255,176,0,0.8), 0 0 50px rgba(255,176,0,0.4)',
                  }}
                />
              </motion.div>
            </div>

            {/* Curved smile below */}
            <motion.div
              className="flex justify-center"
              animate={{
                opacity: [0.6, 0.9, 0.6],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="200" height="60" viewBox="0 0 200 60" className="mx-auto">
                <path
                  d="M 20 20 Q 100 50, 180 20"
                  stroke="rgba(255,176,0,0.9)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  style={{
                    filter: 'drop-shadow(0 0 12px rgba(255,176,0,0.7))'
                  }}
                />
              </svg>
            </motion.div>
          </div>
        </motion.div>

        {/* Chat interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="w-full max-w-2xl"
        >
          {/* Chat input container */}
          <div className="relative flex items-center gap-4">
            {/* Text input */}
            <motion.input
              type="text"
              placeholder="Type your message..."
              className="flex-1 bg-gray-900/50 backdrop-blur-sm border-2 border-gray-800 rounded-full px-8 py-5 text-white text-lg placeholder-gray-500 focus:outline-none focus:border-veon-orange transition-all"
              whileFocus={{
                boxShadow: '0 0 30px rgba(255,176,0,0.3)',
                borderColor: 'rgba(255,176,0,0.8)',
              }}
            />

            {/* Mic button */}
            <motion.button
              className="relative w-16 h-16 rounded-full bg-gradient-to-br from-veon-orange to-amber-600 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
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

          {/* Helper text */}
          <motion.p
            className="text-center text-gray-500 text-sm mt-4"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Type or speak to begin your conversation
          </motion.p>
        </motion.div>

      </div>
    </div>
  )
}

export default App
