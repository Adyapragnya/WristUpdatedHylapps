const mongoose = require('mongoose');

const SalesRadarSchema = new mongoose.Schema({
    SalesQuotationNumber : String,
    CaseId : Number,
    SalesResponsible : String,
    CustomerOwner : String,
    VesselName : String,
    IMO : Number,
    Priority : String,
    DateOfLastSentQuote : Date,

}, { timestamps: true });

const SalesRadar = mongoose.model('salesradar', SalesRadarSchema, 'salesradar');


// Export the model
module.exports =  SalesRadar ;