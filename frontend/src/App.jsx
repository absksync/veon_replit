import { motion } from 'framer-motion';
import VeonAvatar from './components/VeonAvatar';
import ChatInterface from './components/ChatInterface';
import MemoryPanel from './components/MemoryPanel';
import useSocket from './hooks/useSocket';
import useVeonStore from './store/useVeonStore';

function App() {
  useSocket();
  const { isConnected } = useVeonStore();

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-veon-primary via-veon-secondary to-veon-accent bg-clip-text text-transparent">
            VEON
          </h1>
          <p className="text-gray-400">Your Emotionally Adaptive AI Companion</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              } animate-pulse`}
            />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Avatar and Memory */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <VeonAvatar />
            <MemoryPanel />
          </motion.div>

          {/* Right column - Chat */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 h-[calc(100vh-12rem)]"
          >
            <ChatInterface />
          </motion.div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-gray-500 text-sm mt-8"
        >
          <p>VEON - Where AI meets emotion. Built with React, Three.js, and ❤️</p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
