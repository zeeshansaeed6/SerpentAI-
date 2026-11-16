const express = require('express');
const Detection = require('../models/Detection');

const router = express.Router();

const MAX_PAGE_SIZE = 100;

// GET /api/history — Get all past detections (latest first)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), MAX_PAGE_SIZE);

    const [detections, total] = await Promise.all([
      Detection.list({ limit, offset: (page - 1) * limit }), // excludes large base64 image data
      Detection.count()
    ]);

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
    const deleted = await Detection.remove(req.params.id);
    if (!deleted) {
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
