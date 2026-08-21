const mongoose = require('mongoose');

const snakeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  scientificName: {
    type: String,
    required: true
  },
  family: {
    type: String,
    default: ''
  },
  venomous: {
    type: Boolean,
    default: false
  },
  dangerLevel: {
    type: String,
    enum: ['Harmless', 'Mild', 'Moderate', 'Dangerous', 'Deadly'],
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
  diet: {
    type: String,
    default: ''
  },
  averageLength: {
    type: String,
    default: ''
  },
  color: {
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
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Snake', snakeSchema);
