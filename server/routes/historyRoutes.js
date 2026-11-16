const express = require('express');
const Detection = require('../models/Detection');
const { requireClient } = require('../middleware/clientId');

const router = express.Router();

const MAX_PAGE_SIZE = 100;

// History is private to the browser that created it (X-Client-Id)
router.use(requireClient);

// GET /api/history — This visitor's past detections (latest first)
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), MAX_PAGE_SIZE);

    const [detections, total] = await Promise.all([
      Detection.list({ clientId: req.clientId, limit, offset: (page - 1) * limit }), // excludes base64 image data
      Detection.count(req.clientId)
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

// GET /api/history/:id — One of this visitor's detections, with full image data
router.get('/:id', async (req, res, next) => {
  try {
    const detection = await Detection.findById(req.params.id, req.clientId);
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

// DELETE /api/history/:id — Delete one of this visitor's detections
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Detection.remove(req.params.id, req.clientId);
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
