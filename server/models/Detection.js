const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  imageData: {
    type: String,
    required: true
  },
  snakeName: {
    type: String,
    required: true
  },
  scientificName: {
    type: String,
    default: 'Unknown'
  },
  confidence: {
    type: String,
    default: 'Medium'
  },
  venomous: {
    type: Boolean,
    default: false
  },
  dangerLevel: {
    type: String,
    default: 'Harmless'
  },
  description: {
    type: String,
    default: ''
  },
  habitat: {
    type: String,
    default: ''
  },
  region: {
    type: String,
    default: ''
  },
  firstAid: {
    type: String,
    default: ''
  },
  funFact: {
    type: String,
    default: ''
  },
  behavior: {
    type: String,
    default: ''
  },
  diet: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Detection', detectionSchema);
