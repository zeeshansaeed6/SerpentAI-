const express = require('express');
const rateLimit = require('express-rate-limit');
const Sighting = require('../models/Sighting');
const { requireClient } = require('../middleware/clientId');

const router = express.Router();

// Public write endpoint: bound what one person can post
const postLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'You have posted a lot of sightings. Please try again later.' }
});

const MAX_LENGTHS = { speciesName: 120, scientificName: 120, locationName: 200, notes: 1000, reporterName: 80 };
const MAX_IMAGE_CHARS = 900000; // base64 data URI; the JSON body limit is 1mb
const IMAGE_PATTERN = /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/;

// Returns an error message, or null when the body is acceptable
const validate = (body) => {
  for (const [field, max] of Object.entries(MAX_LENGTHS)) {
    if (body[field] !== undefined && body[field] !== null && String(body[field]).length > max) {
      return `${field} is too long (max ${max} characters).`;
    }
  }
  if (!body.speciesName || !body.locationName) {
    return 'Species name and location name are required.';
  }
  if (body.dangerLevel && !Sighting.DANGER_LEVELS.includes(body.dangerLevel)) {
    return `Danger level must be one of: ${Sighting.DANGER_LEVELS.join(', ')}.`;
  }
  const lat = Number(body.latitude);
  const lng = Number(body.longitude);
  if ((body.latitude !== undefined && body.latitude !== '' && !(Math.abs(lat) <= 90)) ||
      (body.longitude !== undefined && body.longitude !== '' && !(Math.abs(lng) <= 180))) {
    return 'Latitude must be between -90 and 90 and longitude between -180 and 180.';
  }
  if (body.imageData) {
    if (typeof body.imageData !== 'string' || body.imageData.length > MAX_IMAGE_CHARS || !IMAGE_PATTERN.test(body.imageData)) {
      return 'Image must be a JPEG, PNG, WebP or GIF under about 650KB.';
    }
  }
  return null;
};

// GET /api/sightings — Public community feed (latest first); `mine` marks the caller's own reports
router.get('/', async (req, res, next) => {
  try {
    const sightings = await Sighting.list(req.clientId);
    res.json({ success: true, data: sightings, total: sightings.length });
  } catch (error) {
    next(error);
  }
});

// POST /api/sightings — Create new community sighting
router.post('/', requireClient, postLimiter, async (req, res, next) => {
  try {
    const problem = validate(req.body);
    if (problem) {
      return res.status(400).json({ success: false, message: problem });
    }

    const b = req.body;
    const newSighting = await Sighting.create({
      clientId: req.clientId,
      speciesName: String(b.speciesName),
      scientificName: b.scientificName ? String(b.scientificName) : 'Unknown',
      venomous: Boolean(b.venomous),
      dangerLevel: b.dangerLevel || 'Harmless',
      locationName: String(b.locationName),
      latitude: Number(b.latitude) || 0,
      longitude: Number(b.longitude) || 0,
      notes: b.notes ? String(b.notes) : '',
      imageData: b.imageData || '',
      reporterName: b.reporterName ? String(b.reporterName) : 'Community Member'
    });

    res.status(201).json({ success: true, data: newSighting });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sightings/:id — Only the poster can delete their own sighting
router.delete('/:id', requireClient, async (req, res, next) => {
  try {
    const deleted = await Sighting.remove(req.params.id, req.clientId);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Sighting not found' });
    }
    res.json({ success: true, message: 'Sighting removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
