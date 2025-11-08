import { motion } from 'framer-motion';
import useVeonStore from '../store/useVeonStore';

export default function MemoryPanel() {
  const { memories } = useVeonStore();

  return (
    <div className="bg-gray-900/50 backdrop-blur-lg rounded-lg border border-gray-700 p-4">
      <h2 className="text-xl font-bold mb-4 text-veon-accent">Memory Core</h2>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {memories.length === 0 ? (
          <p className="text-gray-400 text-sm italic">No memories yet...</p>
        ) : (
          memories.map((memory) => (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800/50 rounded-lg p-3 border-l-4"
              style={{
                borderLeftColor: `hsl(${memory.strength * 120}, 70%, 50%)`,
              }}
            >
              <p className="text-sm text-gray-200">{memory.content}</p>
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-gray-400">
                  {memory.emotion && (
                    <span className="text-veon-accent">
                      {memory.emotion}
                    </span>
                  )}
                </span>
                <div className="flex gap-2 items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400">Strength:</span>
                    <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-veon-primary to-veon-accent"
                        style={{ width: `${memory.strength * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-gray-500">
                    {new Date(memory.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
