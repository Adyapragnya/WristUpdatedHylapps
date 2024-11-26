// routes/alertRoutes.js
const express = require('express');

const router = express.Router();
const PolygonGeofence = require('../models/PolygonGeofence');
const Geofence = require('../models/Geofence');
const Alert = require('../models/Alert');
const TrackedVessel = require('../models/TrackedVessel');
const SentAlert = require('../models/SentAlert'); // New model for sent alerts
const cron = require('node-cron');
const nodemailer = require('nodemailer');

// Create a transporter object with SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'admin@hylapps.com',
    pass: 'ngsl cgmz pnmt uiux',
  },
});

// Endpoint to create an alert
router.post('/', async (req, res) => {
  const { fromDate, toDate, message, shipParameter, operator, parameterValue, whatsapp, email } = req.body;

  try {
    const newAlert = new Alert({
      fromDate,
      toDate,
      message,
      shipParameter,
      operator,
      parameterValue,
      whatsapp,
      email,
    });

    await newAlert.save();
    res.status(201).json({ message: 'Alert created successfully', alert: newAlert });

    // Schedule monitoring of vessels based on this alert
    scheduleAlertMonitoring(newAlert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ message: 'Error creating alert' });
  }
});

// API endpoint to fetch all alerts
router.get('/', async (req, res) => {
  try {
    const alerts = await Alert.find();
    res.status(200).json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ message: 'Failed to fetch alerts', error });
  }
});

// Function to schedule alert monitoring
const scheduleAlertMonitoring = (alert) => {
  cron.schedule('* * * * *', async () => { // Runs every minute
    const trackedVessels = await TrackedVessel.find();
    const satisfiedVessels = [];

    for (const vessel of trackedVessels) {
      let conditionMet = false;

      switch (alert.shipParameter) {
        case 'speed':
          const speed = vessel.AIS.SPEED;
          const operator = alert.operator;
          const threshold = parseFloat(alert.parameterValue);

          if (operator === '=' && speed === threshold) conditionMet = true;
          if (operator === '<' && speed < threshold) conditionMet = true;
          if (operator === '>' && speed > threshold) conditionMet = true;
          break;

          case 'eta':
            const etaDate = new Date(vessel.AIS.ETA.replace(' ', 'T')); // Replace space with 'T' for correct parsing
            const alertFromDate = new Date(alert.fromDate);
            const alertToDate = new Date(alert.toDate);
            const alertparameterValue = new Date(alert.parameterValue);
            // Adjust the condition checks
            if (alert.operator === 'before' && etaDate < alertparameterValue) {
              conditionMet = true;
            }
            if (alert.operator === 'after' && etaDate > alertparameterValue) {
              conditionMet = true;
            }
            // Check if the ETA falls within the range of fromDate and toDate
            if (alert.operator === 'between' && etaDate >= alertFromDate && etaDate <= alertToDate) {
              conditionMet = true;
            }
            break;
          

        case 'destination':
          if (vessel.AIS.DESTINATION === alert.parameterValue) conditionMet = true;
          break;
      }

      if (conditionMet) {
        satisfiedVessels.push(vessel);
      }
    }

    if (satisfiedVessels.length > 0) {
      await sendEmailNotification(alert, satisfiedVessels);
    }
  });
};

// Function to send email notifications
const sendEmailNotification = async (alert, vessels) => {
  // Prepare email content
  let subject = `Vessel Alert Notification: ${alert.shipParameter.charAt(0).toUpperCase() + alert.shipParameter.slice(1)}`;
  let emailContent = `We are notifying you of the following vessels that have met your alert criteria for the ${alert.shipParameter} parameter:\n\n`;

  // Collect vessel details
  const vesselDetails = [];

  for (const vessel of vessels) {
    // Check if the alert has already been sent for this vessel
    const sentAlertExists = await SentAlert.findOne({
      vesselId: vessel._id,
      alertId: alert._id
    });

    if (!sentAlertExists) {
      vesselDetails.push(`Vessel Name: ${vessel.AIS.NAME}`);
      
      if (alert.shipParameter === 'speed') {
          vesselDetails.push(`Speed: ${vessel.AIS.SPEED} knots`);
      } else if (alert.shipParameter === 'eta') {
          vesselDetails.push(`ETA: ${vessel.AIS.ETA}`);
      } else if (alert.shipParameter === 'destination') {
          vesselDetails.push(`Destination: ${vessel.AIS.DESTINATION}`);
      }

      // Record the sent alert to prevent resending
      const newSentAlert = new SentAlert({ vesselId: vessel._id, alertId: alert._id });
      await newSentAlert.save();
    }
  }

  // Only send the email if there are vessels to notify
  if (vesselDetails.length > 0) {
    emailContent += vesselDetails.join('\n') + `\n\nShould you require any further assistance, contact admin@hylapps.com.\n\nThank You,\nHYLA Admin\nwww.greenhyla.com`;

    // Send the email
    try {
      await transporter.sendMail({
        from: 'admin@hylapps.com',
        to: ' tech.adyapragnya@gmail.com,kdalvi@hylapps.com, abhishek.nair@hylapps.com', // Change to the recipient email
        subject: subject,
        text: emailContent,
      });

      console.log('Alert Email sent successfully');
    } catch (error) {
      console.error('Error sending alert email:', error);
    }
  }
};


module.exports = router;
