const mongoose = require('mongoose');

// Schema for NAVSTAT intervals that can be edited in the database
const aisSatPullSchema = new mongoose.Schema({
  sat0: {
    type: Number,
    required: true,
    // default: 1000 * 60 * 15, 
  },
  sat1a: {
    type: Number,
    required: true,
    // default: 1000 * 60 * 480,
  },
  sat1b: {
    type: Number,
    required: true,
    // default: 1000 * 60 * 480,
  }


}, { timestamps: true }); // Adding timestamps to track changes

// Create the model
const AisSatPull = mongoose.model('AisSatPull', aisSatPullSchema,'AisSatPull');

module.exports = AisSatPull;