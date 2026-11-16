const express = require('express');
const { chat } = require('../services/geminiService');

const router = express.Router();
const MAX_MESSAGE_LENGTH = 1000;
const MAX_HISTORY_MESSAGES = 6; // recent context only: keeps prompts small and fast
const MAX_HISTORY_TEXT = 1500;

// Accept only a short list of {role, text}; everything else is dropped (the client is not trusted)
const cleanHistory = (raw) =>
  (Array.isArray(raw) ? raw : [])
    .slice(-MAX_HISTORY_MESSAGES)
    .map((item) => ({
      role: item?.role === 'user' ? 'user' : 'bot',
      text: String(item?.text ?? '').slice(0, MAX_HISTORY_TEXT).trim()
    }))
    .filter((item) => item.text);

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
    const reply = await chat(message, cleanHistory(req.body.conversationHistory));
    res.json({ success: true, reply });
  } catch (error) {
    console.error('Chat API Error:', error.message);
    // chat() raises friendly, safe messages with a 503 (busy) or 502 (failed) status
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'SerpentBot is temporarily unreachable. Please try again shortly.'
    });
  }
});

module.exports = router;
