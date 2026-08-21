const express = require('express');
const Snake = require('../models/Snake');

const router = express.Router();

// GET /api/snakes — Get all snake species (encyclopedia)
router.get('/', async (req, res, next) => {
  try {
    const { search, venomous, danger } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { scientificName: { $regex: search, $options: 'i' } },
        { region: { $regex: search, $options: 'i' } }
      ];
    }
    if (venomous !== undefined) {
      filter.venomous = venomous === 'true';
    }
    if (danger) {
      filter.dangerLevel = danger;
    }

    const snakes = await Snake.find(filter).sort({ name: 1 });
    res.json({ success: true, data: snakes, total: snakes.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/snakes/:id — Get a single snake species
router.get('/:id', async (req, res, next) => {
  try {
    const snake = await Snake.findById(req.params.id);
    if (!snake) {
      return res.status(404).json({
        success: false,
        message: 'Snake species not found'
      });
    }
    res.json({ success: true, data: snake });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
