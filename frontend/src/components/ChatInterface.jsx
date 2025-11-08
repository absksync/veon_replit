import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useVeonStore from '../store/useVeonStore';
import socketService from '../services/socketService';

export default function ChatInterface() {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const { messages, addMessage, isLoading, setLoading } = useVeonStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    // Add user message
    addMessage({
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    });

    setLoading(true);
    socketService.sendMessage(inputMessage);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-900/50 backdrop-blur-lg rounded-lg border border-gray-700">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-veon-primary to-veon-secondary text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Talk to VEON..."
            disabled={isLoading}
            className="flex-1 bg-gray-800 text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-veon-primary disabled:opacity-50"
          />
          <motion.button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-veon-primary to-veon-secondary text-white rounded-full px-6 py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </motion.button>
        </div>
      </form>
    </div>
  );
}
