// routes/customFields.js
const express = require('express');
const router = express.Router();
const CustomField = require('../models/CustomField');

// Create or update custom fields for a vessel
router.post('/create', async (req, res) => {
  const { header,headertype } = req.body;
  console.log( { header });

  try {
   
    // Create a new custom field with header and IMO
    const customField = new CustomField({ header,headertype });
    await customField.save();
    res.status(200).json({ message: 'Custom fields saved successfully', customField });
  } catch (error) {
    res.status(500).json({ message: 'Error saving custom fields', error });
  }
});

// Create or update custom fields for a vessel
router.post('/create-custom', async (req, res) => {
    const { header, customData } = req.body; // Ensure you receive customData as an array
  
    try {
      // Find the existing custom field document by header
      const customField = await CustomField.findOne({ header });
  
      if (!customField) {
        return res.status(404).json({ message: 'Header not found' });
      }
  
      // Add new custom data to the existing document
      customField.customData.push(...customData); // Spread operator to add new entries
      await customField.save();
  
      res.status(200).json({ message: 'Custom data added successfully', customField });
    } catch (error) {
      res.status(500).json({ message: 'Error adding custom data', error });
    }
  });
  

router.get('/get-headers', async (req, res) => {
    try {
      const customFields = await CustomField.find({}, 'header'); // Fetch only headers
      const headers = customFields.map(field => field.header);
      res.status(200).json(headers);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving headers', error });
    }
  });
  

// Get custom fields for a specific vessel
router.get('/get/customdocuments', async (req, res) => {
 

  try {
    const customDocuments = await CustomField.find();
    res.status(200).json(customDocuments);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving custom documents', error });
  }
});

module.exports = router;
