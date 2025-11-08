const huggingfaceService = require('../services/huggingfaceService');
const memoryService = require('../services/memoryService');
const db = require('../config/database');

class ChatController {
  async sendMessage(userMessage) {
    try {
      // Detect emotion in user message
      const emotionData = await huggingfaceService.detectEmotion(userMessage);
      
      // Get memory context
      const memoryContext = await memoryService.getMemoryContext();
      
      // Generate AI response
      const aiResponse = await huggingfaceService.generateText(userMessage, memoryContext);
      
      // Detect emotion in AI response
      const aiEmotionData = await huggingfaceService.detectEmotion(aiResponse);
      
      // Calculate importance and store as memory
      const importance = await huggingfaceService.analyzeMemoryImportance(userMessage);
      await memoryService.addMemory(userMessage, emotionData.emotion, importance);
      
      // Store conversation
      await this.saveConversation(userMessage, aiResponse, aiEmotionData.emotion);
      
      // Apply memory decay periodically
      await memoryService.applyGlobalDecay();
      
      return {
        response: aiResponse,
        emotion: aiEmotionData.emotion,
        userEmotion: emotionData.emotion,
        confidence: aiEmotionData.confidence
      };
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  saveConversation(userMessage, aiResponse, emotion) {
    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO conversations (user_message, ai_response, emotion)
         VALUES (?, ?, ?)`,
        [userMessage, aiResponse, emotion],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
  }

  getConversationHistory(limit = 20) {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT * FROM conversations 
         ORDER BY created_at DESC 
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows.reverse());
        }
      );
    });
  }

  async getMemories() {
    try {
      const memories = await memoryService.getRecentMemories(20);
      return memories;
    } catch (error) {
      console.error('Error fetching memories:', error);
      throw error;
    }
  }
}

module.exports = new ChatController();
