const express = require('express');
const Detection = require('../models/Detection');

const router = express.Router();

// GET /api/history — Get all past detections (latest first)
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const detections = await Detection.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-imageData'); // Exclude large base64 data from list

    const total = await Detection.countDocuments();

    res.json({
      success: true,
      data: detections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/history/:id — Get a single detection with full image data
router.get('/:id', async (req, res, next) => {
  try {
    const detection = await Detection.findById(req.params.id);
    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }
    res.json({ success: true, data: detection });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/history/:id — Delete a detection record
router.delete('/:id', async (req, res, next) => {
  try {
    const detection = await Detection.findByIdAndDelete(req.params.id);
    if (!detection) {
      return res.status(404).json({
        success: false,
        message: 'Detection not found'
      });
    }
    res.json({ success: true, message: 'Detection deleted' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
