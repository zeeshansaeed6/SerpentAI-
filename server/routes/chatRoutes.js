const express = require('express');
const { chat } = require('../services/geminiService');

const router = express.Router();
const MAX_MESSAGE_LENGTH = 1000;

// POST /api/chat — Chat with SerpentBot AI
router.post('/', async (req, res) => {
  const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';

  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required.' });
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({ success: false, message: `Message too long (max ${MAX_MESSAGE_LENGTH} characters).` });
  }

  try {
    res.json({ success: true, reply: await chat(message) });
  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'SerpentBot is temporarily unreachable. Please try again shortly.'
    });
  }
});

module.exports = router;
