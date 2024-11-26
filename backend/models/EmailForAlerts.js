const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmailForAlertsSchema = new Schema({
  
  email: { type: String },
  vesseladdemail : { type: String },
}, { timestamps: true });


module.exports = mongoose.model('EmailForAlerts', EmailForAlertsSchema,'emailsforalerts');
