const { HfInference } = require('@huggingface/inference');

class HuggingFaceService {
  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY);
  }

  async generateText(prompt, context = '') {
    try {
      const fullPrompt = context 
        ? `Context: ${context}\n\nUser: ${prompt}\n\nVEON:`
        : `User: ${prompt}\n\nVEON:`;

      const response = await this.hf.textGeneration({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 150,
          temperature: 0.7,
          top_p: 0.95,
          return_full_text: false
        }
      });

      return response.generated_text.trim();
    } catch (error) {
      console.error('Text generation error:', error);
      return "I'm having trouble thinking right now. Could you try again?";
    }
  }

  async detectEmotion(text) {
    try {
      const response = await this.hf.textClassification({
        model: 'j-hartmann/emotion-english-distilroberta-base',
        inputs: text
      });

      // Returns array of emotions with scores, get the top one
      if (response && response.length > 0) {
        const topEmotion = response[0];
        return {
          emotion: topEmotion.label,
          confidence: topEmotion.score
        };
      }

      return { emotion: 'neutral', confidence: 0.5 };
    } catch (error) {
      console.error('Emotion detection error:', error);
      return { emotion: 'neutral', confidence: 0.5 };
    }
  }

  async analyzeMemoryImportance(text) {
    // Use emotion confidence as a proxy for importance
    const emotionData = await this.detectEmotion(text);
    // High emotion = high importance
    return Math.min(1.0, emotionData.confidence * 1.5);
  }
}

module.exports = new HuggingFaceService();
