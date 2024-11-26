const mongoose = require('mongoose');

// Schema for NAVSTAT intervals that can be edited in the database
const navStatIntervalSchema = new mongoose.Schema({
  navStat0: {
    type: Number,
    required: true,
    default: 1000 * 60 * 300, // Default interval for NAVSTAT 0 (300 minutes)
  },
  navStat1: {
    type: Number,
    required: true,
    default: 1000 * 60 * 300, // Default interval for NAVSTAT 1 (300 minutes)
  },
  navStat2: {
    type: Number,
    required: true,
    default: 1000 * 60 * 300, // Default interval for NAVSTAT 2 (300 minutes)
  },
  navStat3: {
    type: Number,
    required: true,
    default: 1000 * 60 * 300, // Default interval for NAVSTAT 3 (300 minutes)
  },
  navStat5: {
    type: Number,
    required: true,
    default: 1000 * 60 * 300, // Default interval for NAVSTAT 5 (300 minutes)
  },
  navStat7: {
    type: Number,
    required: true,
    default: 1000 * 60 * 300, // Default interval for NAVSTAT 7 (300 minutes)
  },
  otherNavStat: {
    type: Number, // Interval for any NAVSTAT values other than 0, 1, 2, 3, 5, 7
    required: true,
    default: 1000 * 60 * 300, // Default to 300 minutes for unspecified NAVSTAT values
  },
}, { timestamps: true }); // Adding timestamps to track changes

// Create the model
const NavStatInterval = mongoose.model('NavStatInterval', navStatIntervalSchema);

module.exports = NavStatInterval;
