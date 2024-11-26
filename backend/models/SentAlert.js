// models/SentAlert.js
const mongoose = require('mongoose');

const sentAlertSchema = new mongoose.Schema({
  vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
  alertId: { type: mongoose.Schema.Types.ObjectId, ref: 'Alert', required: true },
}, { timestamps: true });

const SentAlert = mongoose.model('SentAlert', sentAlertSchema);
module.exports = SentAlert;

