// models/CustomField.js
const mongoose = require('mongoose');

const CustomFieldSchema = new mongoose.Schema({
    
    header: { type: String, required: true },
    headertype: { type: String, required: true },
  
  customData: [
    {
      imoNumber: { type: String, required: true },
      data: { type: String, required: true },
    },
  ],
}, { timestamps: true });

const CustomField = mongoose.model('CustomField', CustomFieldSchema);
module.exports = CustomField;
