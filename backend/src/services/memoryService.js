const db = require('../config/database');
const huggingfaceService = require('./huggingfaceService');

class MemoryService {
  // Add a new memory
  addMemory(content, emotion, importance) {
    return new Promise((resolve, reject) => {
      const decayRate = this.calculateDecayRate(importance);
      
      db.run(
        `INSERT INTO memories (content, emotion, importance, decay_rate, strength)
         VALUES (?, ?, ?, ?, ?)`,
        [content, emotion, importance, decayRate, 1.0],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  // Calculate decay rate based on importance (higher importance = slower decay)
  calculateDecayRate(importance) {
    return Math.max(0.01, 0.2 * (1 - importance));
  }

  // Get recent memories with decay applied
  getRecentMemories(limit = 10) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM memories 
         WHERE strength > 0.1
         ORDER BY importance DESC, last_accessed DESC 
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Update memory strength (decay over time)
  updateMemoryStrength(memoryId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM memories WHERE id = ?',
        [memoryId],
        (err, memory) => {
          if (err) {
            reject(err);
            return;
          }

          if (!memory) {
            resolve(null);
            return;
          }

          const timeDiff = Date.now() - new Date(memory.last_accessed).getTime();
          const hoursPassed = timeDiff / (1000 * 60 * 60);
          
          // Apply exponential decay
          const newStrength = memory.strength * Math.exp(-memory.decay_rate * hoursPassed);

          db.run(
            `UPDATE memories 
             SET strength = ?, last_accessed = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [newStrength, memoryId],
            (err) => {
              if (err) reject(err);
              else resolve({ id: memoryId, newStrength });
            }
          );
        }
      );
    });
  }

  // Apply decay to all memories
  applyGlobalDecay() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM memories WHERE strength > 0', [], (err, memories) => {
        if (err) {
          reject(err);
          return;
        }

        const updates = memories.map(memory => {
          const timeDiff = Date.now() - new Date(memory.last_accessed).getTime();
          const hoursPassed = timeDiff / (1000 * 60 * 60);
          const newStrength = memory.strength * Math.exp(-memory.decay_rate * hoursPassed);

          return new Promise((res, rej) => {
            db.run(
              'UPDATE memories SET strength = ? WHERE id = ?',
              [newStrength, memory.id],
              (err) => {
                if (err) rej(err);
                else res();
              }
            );
          });
        });

        Promise.all(updates)
          .then(() => resolve({ updated: memories.length }))
          .catch(reject);
      });
    });
  }

  // Get context from memories for AI responses
  async getMemoryContext() {
    const memories = await this.getRecentMemories(5);
    if (memories.length === 0) return '';

    const context = memories
      .map(m => `[Memory: ${m.content} (strength: ${m.strength.toFixed(2)})]`)
      .join('\n');

    return context;
  }

  // Delete weak memories
  pruneWeakMemories() {
    return new Promise((resolve, reject) => {
      db.run(
        'DELETE FROM memories WHERE strength < 0.1',
        [],
        function(err) {
          if (err) reject(err);
          else resolve({ deleted: this.changes });
        }
      );
    });
  }
}

module.exports = new MemoryService();
