require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
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
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Routes
app.use('/api/detect', detectRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/snakes', snakeRoutes);
app.use('/api/sightings', sightingRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/chat', chatRoutes);

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
    console.log(`   GET    /api/health        — Health check\n`);
  });
};

startServer();
