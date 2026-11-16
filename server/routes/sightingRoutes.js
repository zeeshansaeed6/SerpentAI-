const express = require('express');
const Sighting = require('../models/Sighting');

const router = express.Router();

// Initial sample community sightings for rich map display
const initialSightings = [
  {
    speciesName: 'King Cobra',
    scientificName: 'Ophiophagus hannah',
    venomous: true,
    dangerLevel: 'Deadly',
    locationName: 'Western Ghats Forest Trail, India',
    latitude: 14.5204,
    longitude: 74.8567,
    notes: 'Spotted near stream crossing. Maintained 15m distance, was approx 12ft long.',
    reporterName: 'Arun V. (Wildlife Guide)',
    imageData: '/samples/king-cobra.jpg'
  },
  {
    speciesName: "Russell's Viper",
    scientificName: 'Daboia russelii',
    venomous: true,
    dangerLevel: 'Deadly',
    locationName: 'Paddy Fields outskirts, Tamil Nadu',
    latitude: 11.1271,
    longitude: 78.6569,
    notes: 'Coiled under agricultural wood pile. Loud hiss heard before sighting.',
    reporterName: 'Karthik S.',
    imageData: ''
  },
  {
    speciesName: 'Corn Snake',
    scientificName: 'Pantherophis guttatus',
    venomous: false,
    dangerLevel: 'Harmless',
    locationName: 'Everglades National Park, Florida, USA',
    latitude: 25.2866,
    longitude: -80.8987,
    notes: 'Sunbathing across gravel bike trail. Very calm demeanor.',
    reporterName: 'Sarah Jenkins',
    imageData: '/samples/corn-snake.jpg'
  },
  {
    speciesName: 'Green Tree Python',
    scientificName: 'Morelia viridis',
    venomous: false,
    dangerLevel: 'Harmless',
    locationName: 'Cape York Rainforest, Queensland, Australia',
    latitude: -12.4862,
    longitude: 143.0855,
    notes: 'Resting wrapped on low branch near camping grounds.',
    reporterName: 'Dave Miller',
    imageData: '/samples/green-tree-python.jpg'
  },
  {
    speciesName: 'Eastern Diamondback Rattlesnake',
    scientificName: 'Crotalus adamanteus',
    venomous: true,
    dangerLevel: 'Dangerous',
    locationName: 'Ocala National Forest, FL',
    latitude: 29.1872,
    longitude: -81.8236,
    notes: 'Active rattle warning while hiking trail. Retreated safely.',
    reporterName: 'Mike R.',
    imageData: ''
  }
];

// Seed sightings if collection is empty
const seedSightingsIfNeeded = async () => {
  try {
    const count = await Sighting.countDocuments();
    if (count === 0) {
      await Sighting.insertMany(initialSightings);
      console.log('📍 Seeded initial community sightings');
    }
  } catch (err) {
    console.error('Error seeding sightings:', err.message);
  }
};

setTimeout(seedSightingsIfNeeded, 2000);

// GET /api/sightings — Get all sightings (sorted latest first)
router.get('/', async (req, res, next) => {
  try {
    const sightings = await Sighting.find().sort({ createdAt: -1 });
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

    const newSighting = new Sighting({
      speciesName,
      scientificName: scientificName || 'Unknown',
      venomous: Boolean(venomous),
      dangerLevel: dangerLevel || 'Harmless',
      locationName,
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      notes: notes || '',
      imageData: imageData || '',
      reporterName: reporterName || 'Community Member'
    });

    await newSighting.save();
    res.status(201).json({ success: true, data: newSighting });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/sightings/:id — Delete sighting
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Sighting.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Sighting not found' });
    }
    res.json({ success: true, message: 'Sighting removed successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
