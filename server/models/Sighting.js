const mongoose = require('mongoose');

const sightingSchema = new mongoose.Schema({
  speciesName: {
    type: String,
    required: true
  },
  scientificName: {
    type: String,
    default: 'Unknown'
  },
  venomous: {
    type: Boolean,
    default: false
  },
  dangerLevel: {
    type: String,
    enum: ['Harmless', 'Moderate', 'Dangerous', 'Deadly'],
    default: 'Harmless'
  },
  locationName: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  imageData: {
    type: String,
    default: ''
  },
  reporterName: {
    type: String,
    default: 'Anonymous Explorer'
  },
  verified: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Sighting', sightingSchema);
