const mongoose = require('mongoose');
const TerrestrialGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
   
    coordinates: Array,
    
  });

const TerrestrialGeofence = mongoose.model('TerrestrialGeofence', TerrestrialGeofenceSchema, 'TerrestrialGeofence');

module.exports =  TerrestrialGeofence ;
