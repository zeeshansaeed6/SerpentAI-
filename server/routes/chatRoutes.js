const express = require('express');
const { GoogleGenAI } = require('@google/genai');

const router = express.Router();
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are "SerpentBot", an expert herpetologist and venom safety AI assistant.
Your goal is to provide accurate, calm, scientifically verified, and safety-conscious information about snakes, snakebite prevention, emergency first-aid protocols, and reptile behavior.

Critical Safety Directives:
1. If a user describes an active or recent snakebite, prioritize immediate medical triage advice: stay calm, immobilize the limb, do NOT tourniquet/cut/suck, and call emergency services immediately (911/112/108/Poison Control).
2. Never encourage handling wild snakes or attempting DIY venom extraction.
3. Be concise, reassuring, clear, and format key steps with bullet points.
4. Promote humane wildlife coexistence and dispel dangerous myths.`;

// POST /api/chat — Chat with SerpentBot AI
router.post('/', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const prompt = `${SYSTEM_INSTRUCTION}\n\nUser Question: ${message}`;

    const interaction = await client.interactions.create({
      model: 'gemini-3.6-flash',
      input: [
        { type: 'text', text: prompt }
      ]
    });

    const reply = interaction.output_text || "I'm here to help with snake identification and safety. Please ask any question.";

    res.json({
      success: true,
      reply
    });
  } catch (error) {
    console.error('Chat API Error:', error.message);
    res.status(500).json({
      success: false,
      message: 'SerpentBot is temporarily unreachable. Please try again shortly.',
      error: error.message
    });
  }
});

module.exports = router;
