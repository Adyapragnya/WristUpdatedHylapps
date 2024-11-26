const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  fromDate: Date,
  toDate: Date,
  message: {
    type: String,
    default: '', // Make the message optional
  },
  shipParameter: {
    type: String,
    required: true, // e.g., 'speed', 'eta', 'destination'
  },
  operator: String, // Operator like '=', '<', '>', 'before', 'after', etc.
  parameterValue: String, // Value for the parameter (could be a number, date, or string depending on the parameter)
  whatsapp: {
    type: Boolean,
    default: false,
  },
  email: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
