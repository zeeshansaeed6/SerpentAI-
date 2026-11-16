const express = require('express');
const multer = require('multer');
const { analyzeSnakeImage } = require('../services/geminiService');
const Detection = require('../models/Detection');

const router = express.Router();

// Configure multer for memory storage (we'll convert to base64)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'));
    }
  }
});

// POST /api/detect — Upload image and detect snake species
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Convert buffer to base64
    const base64Data = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Create data URI for storing/displaying
    const imageDataUri = `data:${mimeType};base64,${base64Data}`;

    // Analyze with Gemini AI
    console.log('🔍 Analyzing image with Gemini AI...');
    const result = await analyzeSnakeImage(base64Data, mimeType);
    console.log('✅ Analysis complete:', result.snakeName);

    // Don't pollute history with non-snake photos
    if (!result.isSnake) {
      return res.status(200).json({ success: true, data: { ...result, imageData: imageDataUri } });
    }

    // Save to this visitor's private history (a request without a valid client id is still analysed, just not saved)
    const detection = !req.clientId ? null : await Detection.create({
      clientId: req.clientId,
      imageData: imageDataUri,
      snakeName: result.snakeName || 'Unidentified snake',
      scientificName: result.scientificName,
      confidence: result.confidence,
      venomous: result.venomous,
      dangerLevel: result.dangerLevel,
      description: result.description,
      habitat: result.habitat,
      region: result.region,
      firstAid: result.firstAid,
      funFact: result.funFact,
      behavior: result.behavior || '',
      diet: result.diet || ''
    });

    res.status(200).json({
      success: true,
      data: {
        _id: detection?._id,
        isSnake: result.isSnake,
        snakeName: result.snakeName,
        scientificName: result.scientificName,
        confidence: result.confidence,
        venomous: result.venomous,
        dangerLevel: result.dangerLevel,
        description: result.description,
        habitat: result.habitat,
        region: result.region,
        behavior: result.behavior,
        diet: result.diet,
        firstAid: result.firstAid,
        funFact: result.funFact,
        imageData: imageDataUri,
        createdAt: detection?.createdAt ?? new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
