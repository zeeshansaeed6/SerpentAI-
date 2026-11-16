require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { connectDB, disconnectDB } = require('./config/db');
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
const isProd = process.env.NODE_ENV === 'production';

// Behind a hosting proxy (Render, Railway, Heroku, Nginx...) the client IP comes from
// X-Forwarded-For. Without this the rate limiter sees every user as the proxy's IP.
// TRUST_PROXY: number of proxy hops (default 1 in production, 0 locally) or an IP/CIDR list.
const trustProxy = process.env.TRUST_PROXY ?? (isProd ? '1' : '0');
app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      // uploaded/preview images are data: / blob: URIs; samples are served from this origin
      'img-src': ["'self'", 'data:', 'blob:'],
      // helmet's default would force https for every subresource, which breaks http://localhost
      'upgrade-insecure-requests': isProd ? [] : null
    }
  }
}));

// Allowed browser origins (comma-separated). Not needed when the server hosts the client itself.
const allowedOrigins = (process.env.CLIENT_ORIGIN || (isProd ? '' : 'http://localhost:5173'))
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : false }));

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

// Health check (503 while the database is down so platform health checks can restart us)
app.get('/api/health', (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({
    success: dbUp,
    message: dbUp ? '🐍 Snake Detection API is running!' : 'Database unavailable',
    timestamp: new Date().toISOString()
  });
});

// Unknown API paths get JSON, never the SPA's HTML
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: 'Not found' });
});

// Single-service deploy: serve the built client (client/dist) from this server
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const clientIndex = path.join(clientDist, 'index.html');
const servesClient = fs.existsSync(clientIndex);
if (servesClient) {
  // Vite fingerprints files in /assets, so they can be cached for a year
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
  app.get('*', (req, res) => res.sendFile(clientIndex));
}

// Error handler (must be last)
app.use(errorHandler);

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});

// Start server
const startServer = async () => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠️  GEMINI_API_KEY is not set: species scanning and SerpentBot will not work.');
  }

  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`\n🐍 Snake Detection Server running on http://localhost:${PORT}`);
    console.log(servesClient ? '🖥️  Serving built client from client/dist' : 'ℹ️  client/dist not found: API only');
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

  // Graceful shutdown so platforms can redeploy without dropped requests
  const shutdown = (signal) => {
    console.log(`${signal} received, shutting down...`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  ['SIGTERM', 'SIGINT'].forEach((signal) => process.on(signal, () => shutdown(signal)));
};

startServer();
