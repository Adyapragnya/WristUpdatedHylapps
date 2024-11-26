// Define Geofence schema
const mongoose = require('mongoose');

const geofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: Date,
    remarks: String,
    coordinates: [{ lat: Number, lng: Number, radius: Number }]
});

const Geofence = mongoose.model('Geofence', geofenceSchema, "polycirclegeofences");


module.exports =  Geofence ;