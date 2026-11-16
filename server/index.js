require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const detectRoutes = require('./routes/detectRoutes');
const historyRoutes = require('./routes/historyRoutes');
const snakeRoutes = require('./routes/snakeRoutes');
const sightingRoutes = require('./routes/sightingRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',') }));
app.use(express.json({ limit: '1mb' })); // uploads go through multer, not JSON
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Gemini-backed routes cost money: cap per-IP usage
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please wait a minute and try again.' }
});

// Routes
app.use('/api/detect', aiLimiter, detectRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/snakes', snakeRoutes);
app.use('/api/sightings', sightingRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/chat', aiLimiter, chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '🐍 Snake Detection API is running!',
    timestamp: new Date().toISOString()
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n🐍 Snake Detection Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   POST   /api/detect       — Detect snake species from image`);
    console.log(`   GET    /api/history       — Get detection history`);
    console.log(`   GET    /api/history/:id   — Get single detection`);
    console.log(`   DELETE /api/history/:id   — Delete detection`);
    console.log(`   GET    /api/snakes        — Get snake encyclopedia`);
    console.log(`   GET    /api/snakes/:id    — Get single snake species`);
    console.log(`   *      /api/sightings     — Community sightings`);
    console.log(`   GET    /api/hospitals     — Antivenom hospitals`);
    console.log(`   POST   /api/chat          — SerpentBot chat`);
    console.log(`   GET    /api/health        — Health check\n`);
  });
};

startServer();
