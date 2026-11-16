const express = require('express');
const Sighting = require('../models/Sighting');

const router = express.Router();

// GET /api/sightings — Get all sightings (sorted latest first)
router.get('/', async (req, res, next) => {
  try {
    const sightings = await Sighting.list();
    res.json({ success: true, data: sightings, total: sightings.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/sightings — Create new community sighting
router.post('/', async (req, res, next) => {
  try {
    const {
      speciesName,
      scientificName,
      venomous,
      dangerLevel,
      locationName,
      latitude,
      longitude,
      notes,
      imageData,
      reporterName
    } = req.body;

    if (!speciesName || !locationName) {
      return res.status(400).json({
        success: false,
        message: 'Species name and location name are required.'
      });
    }

    if (dangerLevel && !Sighting.DANGER_LEVELS.includes(dangerLevel)) {
      return res.status(400).json({
        success: false,
        message: `Danger level must be one of: ${Sighting.DANGER_LEVELS.join(', ')}.`
      });
    }

    const newSighting = await Sighting.create({
      speciesName: String(speciesName),
      scientificName: scientificName || 'Unknown',
      venomous: Boolean(venomous),
      dangerLevel: dangerLevel || 'Harmless',
      locationName: String(locationName),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      notes: notes || '',
      imageData: imageData || '',
      reporterName: reporterName || 'Community Member'
    });

    res.status(201).json({ success: true, data: newSighting });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sightings/:id — Delete sighting
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Sighting.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Sighting not found' });
    }
    res.json({ success: true, message: 'Sighting removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
