const mongoose = require('mongoose');
const PolygonGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
    seaPort: String,
    coordinates: Array,
    
  });

const PolygonGeofence = mongoose.model('PolygonGeofence', PolygonGeofenceSchema);

module.exports =  PolygonGeofence ;
