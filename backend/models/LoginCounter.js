const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CounterSchema = new Schema({
    seq: { type: Number, default: 1, required: true } // Starts from 1
  });
  
  module.exports = mongoose.model('LoginCounter', CounterSchema);
  