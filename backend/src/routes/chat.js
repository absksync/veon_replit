const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.post('/message', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const result = await chatController.sendMessage(message);
    res.json(result);
  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await chatController.getConversationHistory();
    res.json(history);
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/memories', async (req, res) => {
  try {
    const memories = await chatController.getMemories();
    res.json(memories);
  } catch (error) {
    console.error('Memories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
