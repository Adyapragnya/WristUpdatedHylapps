const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 5000;
const cron = require('node-cron');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;
const reactAPI = process.env.REACT_APP_API_BASE_URL;
const alertRoutes = require('./routes/alertRoutes');
const organizationRoutes = require('./routes/organizationRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const path = require('path');
const bcrypt = require('bcrypt');
const turf = require('@turf/turf');

const CryptoJS = require('crypto-js');
const LoginUsers = require('./models/LoginUsers'); // Import your LoginUsers model
const jwt = require('jsonwebtoken');

const router = express.Router();
const encryptionKey = 'mysecretkey'; // Your encryption key
const TrackedVessel = require('./models/TrackedVessel');
const  PolygonGeofence = require('./models/PolygonGeofence');
const  Geofence        = require('./models/Geofence');
// const NavStatInterval = require('./models/NavStatInterval');
const AisSatPull = require('./models/AisSatPull');
const TerrestrialGeofence = require('./models/TerrestrialGeofence');
const customFieldsRoutes = require('./routes/customFields');
const geolib = require('geolib'); 
const EmailForAlerts = require('./models/EmailForAlerts');
const SalesRadar = require('./models/SalesRadar');

// Middleware to handle JSON requests
app.use(express.json());

app.use(cors()); 



// Connect to MongoDB using Mongoose
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully') )
.catch(err => console.error('MongoDB connection error:', err));


const nodemailer = require('nodemailer');

// Create a transporter object with SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email service provider
    auth: {
        user: 'admin@hylapps.com',
        pass: 'ngsl cgmz pnmt uiux',
    }
});


// Define Mongoose schema and model for vessel_master collection
const vesselSchema = new mongoose.Schema({
    imoNumber: Number,
    transportName: String,
    FLAG: String,
    StatCode5: String,
    transportCategory: String,
    transportSubCategory: String,
    SpireTransportType: String,
    buildYear: Number,
    GrossTonnage: Number,
    deadWeight: Number,
    LOA: Number,
    Beam: Number,
    MaxDraft: Number,
    ME_kW_used: Number,
    AE_kW_used: Number,
    RPM_ME_used: Number,
    Enginetype_code: String,
    subst_nr_ME: Number,
    Stofnaam_ME: String,
    Fuel_ME_code_sec: String,
    EF_ME: Number,
    Fuel_code_aux: String,
    EF_AE: Number,
    EF_gr_prs_ME: Number,
    EF_gr_prs_AE_SEA: Number,
    EF_gr_prs_AE_BERTH: Number,
    EF_gr_prs_BOILER_BERTH: Number,
    EF_gr_prs_AE_MAN: Number,
    EF_gr_prs_AE_ANCHOR: Number,
    NO_OF_ENGINE_active: Number,
    CEF_type: Number,
    Loadfactor_ds: Number,
    Speed_used_: Number,
    CRS_max: Number,
    Funnel_heigth: Number,
    MMSI: Number,
    updatedAt: Date,
    Engine_tier: Number,
    NOx_g_kwh: Number,
    summer_dwt: Number,
    transportNo: Number,
    transportType: String
});

// Index for search optimization
vesselSchema.index({ transportName: 'text' });

const Vessel = mongoose.model('vessel_master', vesselSchema, 'vessel_master');



const voyageSchema = new mongoose.Schema({
    VoyageId : String,
    IMO: Number,
    NAME: String,
    voyageDetails: {
    departurePort: String,     // Port of departure
    arrivalPort: String,       // Port of arrival
    departureDate:String,     // Departure date in ISO 8601 format
    arrivalDate: String,       // Estimated arrival date in ISO 8601 format
    actualArrivalDate: String, // Actual arrival date in ISO 8601 format
    voyageDuration: String,    // Duration of the voyage in hours
    status: String             // Status of the voyage (e.g., underway, completed, delayed)
  },
  cargo : 
    {
      cargoType: String,        // Type of cargo being transported
      quantity: Number,         // Quantity of cargo in tons
      unit: String             // Unit of measurement (e.g., tons, cubic meters)
    },

  crew: 
    {
      name: String,             // Name of the crew member
      position: String,         // Position on the vessel (e.g., captain, engineer)
      nationality: String       // Nationality of the crew member
    },
  logs: 
    {
      timestamp: String,        // Timestamp of the log entry in ISO 8601 format
      event: String             // Description of the event (e.g., departure, arrival, incident)
    }
  
}, { timestamps: true });

const voyageDetail = mongoose.model('voyageDetails', voyageSchema, 'voyageDetails');



// app.post('/api/updateGeofence', async (req, res) => {
//     const { name, geofenceStatus, geofenceInsideTime } = req.body;

//     try {
//         // Find the vessel by name in the AIS data
//         const vessel = await TrackedVessel.findOne({ 'AIS.NAME': name });

//         // Check if the vessel exists
//         if (!vessel) {
//             return res.status(404).send({ message: 'Vessel not found' });
//         }

//         // If vessel is already inside the geofence, return without updating
//         if (vessel.GeofenceStatus === 'Inside') {
//             return res.status(200).send({ message: 'Vessel is already inside the geofence' });
//         }

//         // Update geofence status and inside time for the vessel
//         vessel.GeofenceStatus = geofenceStatus;
//         vessel.GeofenceInsideTime = geofenceInsideTime;
//         vessel.geofenceFlag = 'Entered'; // Update geofence flag

//         // Save the updated vessel information
//         await vessel.save();

//         res.status(200).send({ message: 'Geofence status updated successfully' });
//     } catch (error) {
//         console.error('Error updating geofence status:', error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });


// const vesselGeofenceHistorySchema = new mongoose.Schema({
//     vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
//     vesselName: String,
//     entries: [{
//         geofenceName: String,
//         entryTime: Date,
//         exitTime: Date,
//         currentStatus: { type: String, enum: ['Inside', 'Outside'], default: 'Outside' }, // status for each entry
//     }],
//     updatedAt: { type: Date, default: Date.now }
// });

// const VesselGeofenceHistory = mongoose.model('VesselGeofenceHistory', vesselGeofenceHistorySchema, 'vesselGeofenceHistories');

// app.get('/api/vesselGeofenceHistory/:id', async (req, res) => {
//     const vesselId = req.params.id;

//     try {
//         const history = await VesselGeofenceHistory.findOne({ vesselId });
//         if (!history) {
//             return res.status(404).send({ message: 'Vessel history not found' });
//         }

//         res.status(200).send(history);
//     } catch (error) {
//         console.error('Error fetching vessel history:', error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });

// app.post('/api/updateGeofenceHistory', async (req, res) => {
//     const { vesselId, entries } = req.body;
//     try {
//         await VesselGeofenceHistory.findOneAndUpdate(
//             { vesselId },
//             { entries },
//             { upsert: true, new: true }
//         );
//         res.status(200).send({ message: 'Vessel geofence history updated successfully' });
//     } catch (error) {
//         console.error('Error updating vessel history:', error);
//         res.status(500).send({ message: 'Server error' });
//     }
// });






app.post('/api/addcirclegeofences', async (req, res) => {
    console.log('Received Circle Geofence:', req.body); // Add logging
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;

    // Perform additional checks if needed
    if (!coordinates || coordinates.length === 0 || coordinates[0].radius <= 0) {
        return res.status(400).json({ error: 'Invalid coordinates or radius.' });
    }

    const geofence = new Geofence({
        geofenceId,
        geofenceName,
        geofenceType,
        date,
        remarks,
        coordinates: coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng, radius: coord.radius })),
    });

    try {
        await geofence.save();
        res.status(201).json({ message: 'Circle geofence saved successfully!' });
    } catch (error) {
        console.error('Error saving geofence:', error); // Log the error
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to retrieve all circle geofences
app.get('/api/circlegeofences', async (req, res) => {
    try {
        const geofences = await Geofence.find(); // Adjust if necessary
        res.status(200).json(geofences);
    } catch (error) {
        console.error('Error fetching circle geofences:', error);
        res.status(500).json({ error: error.message });
    }
});


  
// Example POST endpoint for saving polygon geofences
app.post('/api/addpolygongeofences', async (req, res) => {
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;
  
    if (!Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({ error: 'Coordinates are required and should be an array.' });
    }
  
    const newGeofence = new PolygonGeofence({
      geofenceId,
      geofenceName,
      geofenceType,
      date,
      remarks,
      coordinates,
    });
  
    try {
      const savedGeofence = await newGeofence.save();
      res.status(201).json(savedGeofence);
    } catch (error) {
      console.error('Error saving geofence:', error);
      res.status(500).json({ error: 'Failed to save geofence data.' });
    }
  });
  
  // API to fetch polygon geofences
  app.get('/api/polygongeofences', async (req, res) => {
    try {
      const polygonGeofences = await PolygonGeofence.find();
      res.json(polygonGeofences);
    } catch (error) {
      console.error('Error fetching polygon geofences:', error);
      res.status(500).json({ error: 'Failed to fetch polygon geofences' });
    }
  });

   // API to fetch polygon geofences
   app.get('/api/polygonTerrestrialGeofences', async (req, res) => {
    try {
      const TerrestrialGeofences = await TerrestrialGeofence.find();
      res.json(TerrestrialGeofences);
    } catch (error) {
      console.error('Error fetching polygon terrestrial geofences:', error);
      res.status(500).json({ error: 'Failed to fetch polygon terrestrial geofences' });
    }
  });

  const PolylineGeofenceSchema = new mongoose.Schema({
    geofenceId: String,
    geofenceName: String,
    geofenceType: String,
    date: String,
    remarks: String,
    coordinates: Array,
});

const PolylineGeofence = mongoose.model('PolylineGeofence', PolylineGeofenceSchema);

// Example POST endpoint for saving polyline geofences
app.post('/api/addpolylinegeofences', async (req, res) => {
    const { geofenceId, geofenceName, geofenceType, date, remarks, coordinates } = req.body;
    console.log('Received polyline geofence data:', req.body);
    try {
        const newPolylineGeofence = new PolylineGeofence({
            geofenceId,
            geofenceName,
            geofenceType,
            date,
            remarks,
            coordinates,
        });

        await newPolylineGeofence.save();
        res.status(201).json(newPolylineGeofence);
    } catch (error) {
        console.error('Error saving polyline geofence:', error);
        res.status(500).json({ error: 'Failed to save polyline geofence data.' });
    }
});

// Route to get all polyline geofences
app.get('/api/polylinegeofences', async (req, res) => {
    try {
        const polylineGeofences = await PolylineGeofence.find();
        res.status(200).json(polylineGeofences);
        // console.log(PolylineGeofence);
    } catch (error) {
        console.error('Error fetching polyline geofences:', error);
        res.status(500).json({ error: 'Error fetching polyline geofences' });
    }
});

// Example DELETE endpoint for removing a polyline geofence by ID
app.delete('/api/polylinegeofences/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedGeofence = await PolylineGeofence.findByIdAndDelete(id);
        if (!deletedGeofence) {
            return res.status(404).json({ error: 'Geofence not found' });
        }
        res.status(200).json({ message: 'Geofence deleted successfully' });
    } catch (error) {
        console.error('Error deleting polyline geofence:', error);
        res.status(500).json({ error: 'Error deleting polyline geofence' });
    }
});

app.post('/api/add-combined-data', async (req, res) => {
    try {
        console.log('Combined Data Request Body:', req.body); // Log the request body
        

        // Extract AIS data and other details from the request body
        const { loginUserId,'0': { AIS } = {}, SpireTransportType, FLAG, GrossTonnage, deadWeight } = req.body;

        if (!AIS || !SpireTransportType) {
            return res.status(400).json({ error: 'AIS data or SpireTransportType is missing' });
        }

        const currentTime = new Date(); 
        // Create a new CombinedData document
        const newCombinedData = new TrackedVessel({ loginUserId,AIS, SpireTransportType, FLAG, GrossTonnage, deadWeight,trackingFlag: true,lastFetchTime: currentTime,GeofenceStatus: null, geofenceFlag: null,GeofenceInsideTime: null });
      
        // Save the document to the database
        await newCombinedData.save();
        console.log('Combined data saved successfully');
        res.status(201).json({ message: 'Combined data saved successfully' });

        // Extract vessel details
        const vesselName = AIS.NAME;
        const imo = AIS.IMO;
        const zone = AIS.ZONE || 'N/A'; // Use 'N/A' if ZONE is not provided
        const flag = FLAG || 'N/A'; // Use 'N/A' if FLAG is not provided

        // List of email addresses
        const emailAddresses = ['tech.adyapragnya@gmail.com, sales@adyapragnya.com,kdalvi@hylapps.com, abhishek.nair@hylapps.com'];
        // const emailAddresses = ['tech.adyapragnya@gmail.com'];

        // to: 'hemanthsrinivas707@gmail.com, sales@adyapragnya.com,kdalvi@hylapps.com, abhishek.nair@hylapps.com',
        // Send an email notification to each recipient individually
      
        
      
       
      
        
            const date = new Date();
            const options = { day: '2-digit', month: 'short', year: '2-digit' };
            const formattedDate = date.toLocaleDateString('en-GB', options).replace(',', '');
            const document = await EmailForAlerts.findOne();
            const emailvs =document.vesseladdemail;
            await transporter.sendMail({

                from: 'admin@hylapps.com', // sender address
                bcc: emailvs, // individual receiver address
                subject: `HYLA Alert:${vesselName} added to tracking`, // Subject line
                text: `${vesselName} has been added to your tracking system as of today ${formattedDate}. You will receive real-time updates on its location and movements.

Details of the ship:
Name: ${vesselName}
IMO: ${imo}

${vesselName} will be tracked for the next 30 days. Should you require any further assistance, contact admin@hylapps.com.

Thank You,
HYLA Admin
www.greenhyla.com
`,
            });
        

          // Send WhatsApp message
  //         const accessToken = 'EAAPFZBVZCcJpkBO1icFVEUAqZBZA6SOw614hQaLmsooJTLIdR2njKZCL9G7z9O2NSLZAZAHTAMGqhaFSlV0DdMyqZBhy13zkZCZBI6OO8hUp28c6sFmpNPAjv1V8bVOVisfGZCOXyJHrnZBxZBQAG9gGI7Wt6gUqI9Qs1pYwl2RmdZAWPwKNJ0i0NAg1nL8MtPZCfLDzLMW9mWaNjzLsZAsc7qUnLOZBWR0bZCYQkDBqegmngZD';
  //         const phoneNumberId = '481471688383235';

  //         const date = new Date();
  //         const options = { day: '2-digit', month: 'short', year: '2-digit' };
  //         const formattedDate = date.toLocaleDateString('en-GB', options).replace(',', '');
  
  //         const whatsappMessage = {
  //             messaging_product: 'whatsapp',
  //             to: '+916382125732', // Receiver's WhatsApp number in international format
  //             type: 'text',
  //             text: {
  //                 body: `${vesselName} has been added to your tracking system as of today ${formattedDate}. You will receive real-time updates on its location and movements.
  
  // Details of the ship:
  // Name: ${vesselName}
  // IMO: ${imo}
  
  // This vessel will be tracked for the next 30 days. Contact admin@hylapps.com for further assistance.`
  //             }
  //         };
  
  //         await axios.post(`https://graph.facebook.com/v15.0/${phoneNumberId}/messages`, whatsappMessage, {
  //             headers: {
  //                 Authorization: `Bearer ${accessToken}`,
  //                 'Content-Type': 'application/json'
  //             }
  //         });

        // res.status(201).json({ message: 'Combined data saved successfully and emails sent' });
    } catch (error) {
        console.error('Error adding combined data:', error);
        res.status(500).json({ error: 'Error adding combined data' });
    }
  });
 
  app.post('/api/send-email', (req, res) => {
    console.log("Received request!");
  
    const { vessels } = req.body; // Expecting an array of vessels
    
    if (!Array.isArray(vessels) || vessels.length === 0) {
      return res.status(400).send('No vessels data provided');
    }
  
    // Format the vessel details
    const vesselDetails = vessels.map(vessel => {
      return `Vessel: ${vessel.vesselName}, Status: ${vessel.status}, Geofence: ${vessel.geofence}`;
    }).join('\n');
  
    // Mail options setup
    const mailOptions = {
      from:  'admin@hylapps.com', // Use the sender email from env variable
      bcc: 'hemanthsrinivas707@gmail.com,kdalvi@hylapps.com, abhishek.nair@hylapps.com', // Ensure this is the recipient's email
      subject: 'Vessel Status Update: Inside Vessels',
      text: `The following vessels are currently Inside:\n\n${vesselDetails}`,
    };
  
    // Sending the email using the transporter
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email: ' + error.toString());
      }
      res.status(200).send('Email sent successfully: ' + info.response);
    });
  });
 

  app.post('/api/upload-sales-data', async (req, res) => {
    try {
      const data = req.body; // Get the sales data from the request
      const imoNumbers = data.map(row => row.IMO); // Extract IMO numbers from the data
      const foundImos = [];
      const notFoundImos = [];
      const errorMessages = [];
      const successCount = [];
      const failureCount = [];
      const userTrackedData = []; // Array to store user-tracked vessel data
      
      // Extract user details from the first row (assuming all rows have the same user context)
      const { loginUserId, email, AdminId, OrgId } = data[0]; 
     
  
      // Check which IMOs exist in the TrackedVessel collection
      const trackedVessels = await TrackedVessel.find({ 'AIS.IMO': { $in: imoNumbers } }).select('AIS.IMO');

      const trackedImos = trackedVessels.map(vessel => vessel.AIS.IMO);
      
      // Separate found and not found IMOs
      for (const imo of imoNumbers) {
        if (trackedImos.includes(imo)) {
          foundImos.push(imo);
        } else {
          notFoundImos.push(imo);
        }
      }
  
      // Process not found IMOs and add them as new tracked vessels
      for (const imo of notFoundImos) {
        try {
          // Fetch vessel details from Vessel collection
          const vesselData = await Vessel.findOne({ imoNumber: imo }).select(
            "SpireTransportType FLAG GrossTonnage deadWeight"
          );
          if (!vesselData) {
            const errorMessage = `Vessel with IMO ${imo} not found in vessel_master`;
            console.error(errorMessage);
            errorMessages.push(errorMessage);
            failureCount.push(imo);
            continue;
          }
          
          // Fetch AIS data
          const aisResponse = await axios.get("https://api.vtexplorer.com/vessels", {
            params: { userkey, imo, format: "json", sat: "1" },
          });
          const aisDataArray = aisResponse.data;
          if (!aisDataArray || aisDataArray.length === 0) {
            const errorMessage = `AIS data not found for IMO ${imo}`;
            console.error(errorMessage);
            errorMessages.push(errorMessage);
            failureCount.push(imo);
            continue;
          }
          
          // Add new TrackedVessel
          const currentTime = new Date();
          const aisData = aisDataArray[0].AIS;
          const newTrackedVessel = new TrackedVessel({
            loginUserId: loginUserId,
            AIS: { ...aisData },
            SpireTransportType: vesselData.SpireTransportType,
            FLAG: vesselData.FLAG,
            GrossTonnage: vesselData.GrossTonnage,
            deadWeight: vesselData.deadWeight,
            trackingFlag: true,
            lastFetchTime: currentTime,
            GeofenceStatus: null,
            geofenceFlag: null,
            GeofenceInsideTime: null,
          });
          await newTrackedVessel.save();
          successCount.push(imo);
        } catch (error) {
          console.error(`Error processing IMO ${imo}:`, error.message);
          errorMessages.push(`Error processing IMO ${imo}: ${error.message}`);
          failureCount.push(imo);
        }
      }
  
      // Save the sales data
      const savedDocuments = [];
      for (const row of data) {
        const newSale = new SalesRadar({
          SalesQuotationNumber: row.SalesQuotationNumber,
          CaseId: row.CaseId,
          SalesResponsible: row.SalesResponsible,
          CustomerOwner: row.CustomerOwner,
          VesselName: row.VesselName,
          IMO: row.IMO,
          Priority: row.Priority,
          DateOfLastSentQuote: row.DateOfLastSentQuote,
        });
        const savedSale = await newSale.save();
        savedDocuments.push(savedSale);
  
       
      }
  
      // Response with details
      res.status(200).json({
        message: "Data uploaded successfully",
        savedDocuments,
        foundImos,
        notFoundImos,
        successCount,
        failureCount,
        errorMessages,
        userTrackedData, // Include user tracking data in the response
      });
    } catch (error) {
      console.error('Error uploading sales data:', error);
      res.status(500).json({ error: 'Failed to upload data' });
    }
  });

   // API to fetch polygon geofences
   app.get('/api/get-upload-sales-data', async (req, res) => {
    try {
      const SalesRadars = await SalesRadar.find();
      res.json(SalesRadars);
    } catch (error) {
      console.error('Error fetching sales data:', error);
      res.status(500).json({ error: 'Failed to fetch sales data' });
    }
  });


// Route to fetch specific fields from vesselstrackeds collection
app.get('/api/get-tracked-vessels', async (req, res) => {
    try {
        const fields = {
            loginUserId:1,
            RegionName:1,
            CaseId:1,
            AgentName:1,
            Agent:1,
            ETATime:1,
            ETADate:1,
            Info1:1,
            AIS: 1,
            SpireTransportType: 1,
            FLAG: 1,
            GrossTonnage: 1,
            deadWeight: 1,
            trackingFlag :1,
            GeofenceStatus:1,
            geofenceFlag:1,
            GeofenceInsideTime:1
        };

        // Fetch vessels with only the specified fields
        const trackedVessels = await TrackedVessel.find({}, fields).exec();
        console.log(trackedVessels);
        
        res.json(trackedVessels);
    } catch (error) {
        console.error('Error fetching tracked vessels:', error);
        res.status(500).json({ error: 'Error fetching tracked vessels' });
    }
});

app.patch('/api/delete-vessel', async (req, res) => {
  const { imoNumbers } = req.body; // Change this to imoNumbers
  console.log(req.body);

  try {
      // Check if imoNumbers is an array
      if (!Array.isArray(imoNumbers) || imoNumbers.length === 0) {
          return res.status(400).json({ message: 'Invalid or missing IMO numbers' });
      }

      // Find and delete vessels by IMO number using $in
      const deletedVessels = await TrackedVessel.deleteMany({ 'AIS.IMO': { $in: imoNumbers } });

      if (deletedVessels.deletedCount === 0) {
          return res.status(404).json({ message: 'No vessels found with the provided IMO numbers' });
      }

      res.status(200).json({ message: 'Vessel(s) deleted successfully', deletedCount: deletedVessels.deletedCount });
  } catch (error) {
      console.error("Error deleting vessel:", error);
      res.status(500).json({ message: 'Server error' });
  }
});




// Route to fetch vessels with search capability and pagination
app.get('/api/get-vessels', async (req, res) => {
    try {
        const searchQuery = req.query.search || "";
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page

        // Prepare the query for search
        const query = searchQuery ? {
            transportName: { $regex: searchQuery, $options: 'i' }
        } : {};

        // Fetch vessels with pagination
        const vessels = await Vessel.find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
        
        // Count total documents for pagination
        const total = await Vessel.countDocuments(query);
        
        res.json({
            total,
            vessels
        });
    } catch (error) {
        console.error('Error fetching vessels:', error);
        res.status(500).json({ error: 'Error fetching vessels' });
    }
});

// Route to fetch vessel data from an external API (if needed)
app.get('/api/ais-data', async (req, res) => {
    const { imo } = req.query; // Extract IMO from query parameters
    const userkey = 'WS-096EE673-456A8B'; // Your API key

    try {
        const response = await axios.get('https://api.vtexplorer.com/vessels', {
            params: {
                userkey,
                imo,
                format: 'json',
                sat:'1'
            }
        });
        res.json(response.data); // Send the external API response back as JSON
    } catch (error) {
        console.error('Error fetching vessel data from external API:', error);
        res.status(500).send(error.toString());
    }
});


// VTExplorer API details
const userkey = 'WS-096EE673-456A8B'; // Your VTExplorer API key



// Endpoint to get the current intervals
app.get('/api/sat-intervals', async (req, res) => {
    try {
      const intervals = await AisSatPull.findOne();
      res.json(intervals);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching SAT intervals' });
    }
  });


  
  // Endpoint to update the SAT intervals
  app.put('/api/sat-intervals', async (req, res) => {
    try {
      const { sat0,sat1a,sat1b } = req.body;
  
      // Find the existing intervals document and update it
      const updatedIntervals = await AisSatPull.findOneAndUpdate({}, {
        sat0,
        sat1a,
        sat1b
      }, { new: true, upsert: true });
      console.log(updatedIntervals);
      res.json(updatedIntervals);
    } catch (err) {
      res.status(500).json({ error: 'Error updating SAT intervals' });
    }
  });
  
  let nextEmailTime = new Date(); // Initialize to current time
  let emailIntervalIndex = 0; // Index to track the current interval step
  const emailIntervals = [6, 8, 12, 24]; // Hours between emails
  
  async function checkAndUpdateVesselData() {
      try {
          const aisSatPullConfig = await AisSatPull.findOne();
          if (!aisSatPullConfig) {
              console.error('Sat pull intervals not found.');
              return;
          }
  
          const vessels = await TrackedVessel.find();
          const TerrestrialGeofences = await TerrestrialGeofence.find();
  
          if (!TerrestrialGeofences || TerrestrialGeofences.length === 0) {
              console.error('No geofences found.');
              return;
          }
  
          let vesselsInGeofence = [];
  
          for (const vessel of vessels) {
              const { LATITUDE: vesselLat, LONGITUDE: vesselLng, NAME, IMO } = vessel.AIS;
              const currentTime = new Date();
              const vesselPoint = turf.point([vesselLng, vesselLat]);
  
              let isInsideAnyGeofence = false;
              let geofenceDetails = {};
              let interval, sat;
  
              for (const geofence of TerrestrialGeofences) {
                  const geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
                  if (geofenceCoordinates[0][0] !== geofenceCoordinates[geofenceCoordinates.length - 1][0] ||
                      geofenceCoordinates[0][1] !== geofenceCoordinates[geofenceCoordinates.length - 1][1]) {
                      geofenceCoordinates.push(geofenceCoordinates[0]);
                  }
  
                  const geofencePolygonTr = turf.polygon([geofenceCoordinates]);
                  const isInside = turf.booleanPointInPolygon(vesselPoint, geofencePolygonTr);
  
                  if (isInside) {
                      isInsideAnyGeofence = true;
                      geofenceDetails = {
                          geofenceName: geofence.geofenceName,
                          geofenceFlag: 'Inside',
                          entryTime: new Date().toISOString(),
                          exitTime: null,
                      };
  
                      vesselsInGeofence.push({ NAME, IMO, geofence: geofence.geofenceName });
                      interval = geofence.geofenceType === 'terrestrial' ? aisSatPullConfig.sat0 : aisSatPullConfig.sat1a;
                      sat = geofence.geofenceType === 'terrestrial' ? 0 : 1;
  
                      console.log(`"${geofence.geofenceName}" : inside, geofenceType: ${geofence.geofenceType}`);
                      break;
                  }
              }
              if (!isInsideAnyGeofence) {
                  interval = aisSatPullConfig.sat1b;
                  sat = 1;
                  console.log("No vessels inside any geofence");
              }
              const lastFetchTime = vessel.lastFetchTime ? new Date(vessel.lastFetchTime) : null;
              const timeElapsed = lastFetchTime ? currentTime - lastFetchTime : interval;
  
              if (!lastFetchTime || timeElapsed >= interval) {
                  console.log(`Fetching VTExplorer data for ${NAME} with interval ${interval}...`);
  
                  const response = await axios.get('https://api.vtexplorer.com/vessels', {
                      params: {
                          userkey,
                          imo: vessel.AIS.IMO,
                          format: 'json',
                          sat,
                      },
                  });
                  const apiData = response.data[0]?.AIS;
                  if (apiData && apiData.LATITUDE && apiData.LONGITUDE) {
                      if (apiData.LATITUDE !== vesselLat || apiData.LONGITUDE !== vesselLng) {
                          await axios.put(`${reactAPI}/api/updateVesselLocation/${vessel._id}`, {
                              LATITUDE: apiData.LATITUDE,
                              LONGITUDE: apiData.LONGITUDE,
                              TIMESTAMP: apiData.TIMESTAMP,
                              COURSE: apiData.COURSE,
                              SPEED: apiData.SPEED,
                              HEADING: apiData.HEADING,
                              NAVSTAT: apiData.NAVSTAT,
                              CALLSIGN: apiData.CALLSIGN,
                              TYPE: apiData.TYPE,
                              A: apiData.A,
                              B: apiData.B,
                              C: apiData.C,
                              D: apiData.D,
                              DRAUGHT: apiData.DRAUGHT,
                              DESTINATION: apiData.DESTINATION,
                              LOCODE: apiData.LOCODE,
                              ETA_AIS: apiData.ETA_AIS,
                              ETA: apiData.ETA,
                              SRC: apiData.SRC,
                              ZONE: apiData.ZONE,
                              ECA: apiData.ECA,
                              DISTANCE_REMAINING: apiData.DISTANCE_REMAINING,
                              ETA_PREDICTED: apiData.ETA_PREDICTED,
                              lastFetchTime: currentTime,
                              geofenceDetails: isInsideAnyGeofence ? geofenceDetails : null,
                          });
                          console.log(`Vessel ${NAME} (IMO: ${IMO}) location updated.`);
                      } else {
                          await TrackedVessel.updateOne({ _id: vessel._id }, { lastFetchTime: currentTime });
                      }
                  } else {
                      console.error(`Invalid data for vessel ${NAME}`);
                  }
              } else {
                  console.log(`Skipping vessel ${NAME} (IMO: ${IMO}) - waiting for next interval...`);
              }
          }
  
          // Send consolidated email if it's time
          const currentTime = new Date();
          if (currentTime >= nextEmailTime && vesselsInGeofence.length > 0) {
              sendConsolidatedEmail(vesselsInGeofence);
              // Update next email time
              nextEmailTime = new Date(nextEmailTime.getTime() + emailIntervals[emailIntervalIndex] * 60 * 60 * 1000);
              emailIntervalIndex = (emailIntervalIndex + 1) % emailIntervals.length; // Rotate through intervals
          }
      } catch (error) {
          console.error('Error checking and updating vessel data:', error);
      } finally {
          setTimeout(checkAndUpdateVesselData, 1000 * 60 * 60); // Runs the function hourly
      }
  }
  
  function sendConsolidatedEmail(vessels) {
    const transporter = nodemailer.createTransport({
        service: 'gmail', // or another email service provider
        auth: {
            user: 'admin@hylapps.com',
            pass: 'ngsl cgmz pnmt uiux',
        },
    });

    // Group vessels by geofence
    const vesselsByGeofence = vessels.reduce((acc, vessel) => {
        if (!acc[vessel.geofence]) {
            acc[vessel.geofence] = [];
        }
        acc[vessel.geofence].push(vessel);
        return acc;
    }, {});

    // Generate the HTML for each geofence's table
    const emailBody = Object.keys(vesselsByGeofence)
        .map(geofence => `
            <div style="margin-bottom: 30px;">
                <h3 style="
                    color: #0F67B1; 
                    margin-bottom: 15px; 
                    font-family: Arial, sans-serif;
                    text-transform: uppercase;
                    font-size: 16px;
                ">
                    ${geofence}
                </h3>
                <table style="
                    width: 100%; 
                    border-collapse: separate; 
                    border-spacing: 0; 
                    font-family: Arial, sans-serif; 
                    font-size: 14px; 
                    text-align: left; 
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 
                    border: 1px solid #DDD; 
                    border-radius: 10px; 
                    overflow: hidden;
                ">
                    <thead>
                        <tr style="
                            background-color: #0F67B1; 
                            color: #FFFFFF; 
                            text-align: left;
                            border-bottom: 2px solid #DDD;
                        ">
                            <th style="padding: 12px 15px; border-right: 1px solid #DDD;">Vessel Name</th>
                            <th style="padding: 12px 15px;">IMO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vesselsByGeofence[geofence]
                            .map((v, index) => `
                                <tr style="
                                    background-color: ${index % 2 === 0 ? '#F9F9F9' : '#FFFFFF'}; 
                                    border-bottom: 1px solid #DDD; 
                                    transition: background-color 0.3s ease;
                                " 
                                onmouseover="this.style.backgroundColor='#EAF3FF';" 
                                onmouseout="this.style.backgroundColor='${index % 2 === 0 ? '#F9F9F9' : '#FFFFFF'}';">
                                    <td style="padding: 10px 15px; border-right: 1px solid #DDD;">${v.NAME}</td>
                                    <td style="padding: 10px 15px;">${v.IMO}</td>
                                </tr>
                            `)
                            .join('')}
                    </tbody>
                </table>
            </div>
        `)
        .join('');

    const mailOptions = {
        from: 'admin@hylapps.com',
        bcc: 'tech.adyapragnya@gmail.com,support@hylapps.com',
        subject: 'Hyla-Alert',
        html: `
            <p style="
                font-family: Arial, sans-serif; 
                font-size: 14px; 
                color: #333; 
                margin-bottom: 20px;
            ">
                The following vessels are within the Zone:
            </p>
            ${emailBody}
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}



  // Start the cron job
  checkAndUpdateVesselData();
  
  


// Define the VesselHistory schema
const vesselHistorySchema = new mongoose.Schema({
    vesselId: { type: mongoose.Schema.Types.ObjectId, ref: 'TrackedVessel', required: true },
    vesselName: String,
    IMO: Number,

    history: [{
        LATITUDE: Number,
        LONGITUDE: Number,
        TIMESTAMP: String,
        geofenceName: { type: String, default: null },
        geofenceFlag: { type: String, default: null },
        entryTime: { type: Date, default: null },
        exitTime: { type: Date, default: null },
    }],
    updatedAt: { type: Date, default: Date.now }
});

const VesselHistory = mongoose.model('VesselHistory', vesselHistorySchema, 'vesselHistories');


// Route to fetch all vessel history documents
app.get('/api/get-vessel-histories', async (req, res) => {
    try {
        // Find all vessel history documents
        const vesselHistories = await VesselHistory.find();
         console.log(vesselHistories);

        res.json(vesselHistories);
    } catch (error) {
        console.error('Error fetching vessel histories:', error);
        res.status(500).json({ error: 'Error fetching vessel histories' });
    }
});


// Helper function to check if vessel is inside any geofence
const checkVesselInGeofences = (vesselLat, vesselLng, polygonGeofences, circleGeofences, polylineGeofences) => {
    const vesselPoint = turf.point([vesselLng, vesselLat]);
    let isInsideAnyGeofence = false;
    let geofenceDetails = {};
  
    // Check Polygon Geofences
    polygonGeofences.forEach((geofence) => {
      let geofenceCoordinates = geofence.coordinates.map(coord => [coord.lat, coord.lng]);
      
      // Ensure the first and last points are the same
      if (geofenceCoordinates[0][0] !== geofenceCoordinates[geofenceCoordinates.length - 1][0] || 
          geofenceCoordinates[0][1] !== geofenceCoordinates[geofenceCoordinates.length - 1][1]) {
        geofenceCoordinates.push(geofenceCoordinates[0]); // Close the polygon
      }
      
      const geofencePolygon = turf.polygon([geofenceCoordinates]);
      const isInside = turf.booleanPointInPolygon(vesselPoint, geofencePolygon);
    
      if (isInside) {
        isInsideAnyGeofence = true;
        geofenceDetails = {
          geofenceName: geofence.geofenceName,
          geofenceFlag: 'Inside',
          entryTime: new Date().toISOString(),
          exitTime: null,
        };
        
      }
    });
  
    // Check Circle Geofences
    circleGeofences.forEach((geofence) => {
      const { lat, lng, radius } = geofence.coordinates[0];
      const distance = turf.distance(vesselPoint, turf.point([lng, lat]), { units: 'meters' });
      if (distance <= radius) {
        isInsideAnyGeofence = true;
        geofenceDetails = {
          geofenceName: geofence.geofenceName,
          geofenceFlag: 'Inside',
          entryTime: new Date().toISOString(),
          exitTime: null,
        };
      }
    });
  
    // Check Polyline Geofences
    polylineGeofences.forEach((geofence) => {
      const geofenceLine = turf.lineString(geofence.coordinates.map(coord => [coord.lng, coord.lat]));
      const distanceToPolyline = turf.pointToLineDistance(vesselPoint, geofenceLine, { units: 'meters' });
      if (distanceToPolyline <= 3000) {
        isInsideAnyGeofence = true;
        geofenceDetails = {
          geofenceName: geofence.geofenceName,
          geofenceFlag: `Near ${Math.round(distanceToPolyline)} meters`,
          entryTime: new Date().toISOString(),
          exitTime: null,
        };
      }
    });
  
    return { isInsideAnyGeofence, geofenceDetails };
  };
  
  
  app.put('/api/updateVesselLocation/:vesselId', async (req, res) => {
    const { LATITUDE, LONGITUDE, TIMESTAMP, COURSE, SPEED, HEADING, NAVSTAT, CALLSIGN, TYPE, A, B, C, D, DRAUGHT, DESTINATION, LOCODE, ETA_AIS, ETA, SRC, ZONE, ECA, DISTANCE_REMAINING, ETA_PREDICTED } = req.body;
    const vesselId = req.params.vesselId;
  
    try {
      // Fetch the vessel and geofences
      const vessel = await TrackedVessel.findById(vesselId);
      const polygonGeofences = await PolygonGeofence.find();
      const circleGeofences = await Geofence.find();
      const polylineGeofences = await PolylineGeofence.find();
  
      // Check if the vessel is inside any geofences
      const { isInsideAnyGeofence, geofenceDetails } = checkVesselInGeofences(LATITUDE, LONGITUDE, polygonGeofences, circleGeofences, polylineGeofences);
  
      // Check if VesselHistory exists for this vesselId
      let vesselHistory = await VesselHistory.findOne({ vesselId });
      let previousHistory = vesselHistory ? vesselHistory.history[vesselHistory.history.length - 1] : null;
  
      // Handle entryTime and exitTime
      if (previousHistory) {
        // If vessel is inside the same geofence, keep the previous entryTime
        if (previousHistory.geofenceName === geofenceDetails.geofenceName) {
          geofenceDetails.entryTime = previousHistory.entryTime;
        } 
  
        // If vessel exited the previous geofence, set the exit time
        if (previousHistory.geofenceName && !geofenceDetails.geofenceName) {
          previousHistory.exitTime = new Date().toISOString();
          geofenceDetails.exitTime = null;

          // Send email for exiting geofence
        await sendExitEmail(vessel, previousHistory.geofenceName);
        }
      }
  
      // Build the history entry
      const historyEntry = {
        LATITUDE,
        LONGITUDE,
        TIMESTAMP,
        ...(isInsideAnyGeofence ? geofenceDetails : { geofenceFlag: 'Outside', exitTime: null })
      };
  
      // Create or update vessel history
      if (!vesselHistory) {
        vesselHistory = new VesselHistory({
          vesselId: vessel._id,
          vesselName: vessel.AIS.NAME,
          IMO: vessel.AIS.IMO,
          history: [historyEntry]
        });
      } else {
        vesselHistory.history.push(historyEntry);
      }
  
      // Save vessel history
      await vesselHistory.save();
    
      // Check if this is the first time the vessel entered this geofence
      if (!previousHistory || (previousHistory.geofenceName !== geofenceDetails.geofenceName)) {
        if (geofenceDetails.geofenceName) { // Check if geofenceName is defined
            geofenceDetails.entryTime = new Date().toISOString();
            await sendEntryEmail(vessel, geofenceDetails.geofenceName);
        }
    }
    
    
      // Update TrackedVessel
      await TrackedVessel.findByIdAndUpdate(vesselId, {
        'AIS.LATITUDE': LATITUDE,
        'AIS.LONGITUDE': LONGITUDE,
        'AIS.TIMESTAMP': TIMESTAMP,
        'AIS.COURSE': COURSE,
        'AIS.SPEED': SPEED,
        'AIS.HEADING': HEADING,
        'AIS.NAVSTAT': NAVSTAT,
        'AIS.CALLSIGN': CALLSIGN,
        'AIS.TYPE': TYPE,
        'AIS.A': A,
        'AIS.B': B,
        'AIS.C': C,
        'AIS.D': D,
        'AIS.DRAUGHT': DRAUGHT,
        'AIS.DESTINATION': DESTINATION,
        'AIS.LOCODE': LOCODE,
        'AIS.ETA_AIS': ETA_AIS,
        'AIS.ETA': ETA,
        'AIS.SRC': SRC,
        'AIS.ZONE': ZONE,
        'AIS.ECA': ECA,
        'AIS.DISTANCE_REMAINING': DISTANCE_REMAINING,
        'AIS.ETA_PREDICTED': ETA_PREDICTED,

        'GeofenceStatus': geofenceDetails.geofenceName || null ,
        'geofenceFlag': isInsideAnyGeofence ? geofenceDetails.geofenceFlag : 'Outside',
        // Use geofenceDetails.entryTime (already set correctly) for GeofenceInsideTime
        'GeofenceInsideTime': geofenceDetails.entryTime || null, 
        lastFetchTime: new Date()
      });
  
      res.status(200).json({ message: 'Vessel location and history updated successfully' });
    } catch (error) {
      console.error('Error updating vessel location:', error);
      res.status(500).json({ message: 'Error updating vessel location', error });
    }
});

// Helper functions to send entry and exit emails
async function sendEntryEmail(vessel, geofenceName) {
    const document = await EmailForAlerts.findOne();
    const email =document.email;
    
    const mailOptions = {
      from: 'admin@hylapps.com',
      bcc: email , 
      subject: `Vessel ${vessel.AIS.NAME} arrived ${geofenceName}`,
      text: `The vessel ${vessel.AIS.NAME} (IMO: ${vessel.AIS.IMO}) has arrived : ${geofenceName}.`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Entry email sent successfully');
    } catch (error) {
      console.error('Error sending entry email:', error);
    }
  }
  
  async function sendExitEmail(vessel, geofenceName) {
    const document = await EmailForAlerts.findOne();
    const email =document.email;
    
    const mailOptions = {
      from: 'admin@hylapps.com',
      bcc: email, 
      subject: `Vessel ${vessel.AIS.NAME} departed ${geofenceName}`,
      text: `The vessel ${vessel.AIS.NAME} (IMO: ${vessel.AIS.IMO}) has departed: ${geofenceName}.`
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Exit email sent successfully');
    } catch (error) {
      console.error('Error sending exit email:', error);
    }
  }


  
// 17-10-2024-start
// Save vessel history 
// app.post('/api/vesselHistory/:id', async (req, res) => {
//     const { LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag } = req.body;
//     const vesselName = req.params.id;

//     try {
//         if (!vesselName) {
//             return res.status(400).json({ error: 'Invalid vessel name' });
//         }

//         // Find the vessel history entry for the given vessel name
//         let historyEntry = await VesselHistory.findOne({ vesselName });

//         if (!historyEntry) {
//             // If no history exists, create a new entry
//             historyEntry = new VesselHistory({
//                 vesselName,
//                 history: [{ LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag }]
//             });
//         } else {
//             // Get the last history object from the array
//             const lastHistory = historyEntry.history[historyEntry.history.length - 1];

//             // Compare both LATITUDE and LONGITUDE with the previous entry
//             const isSameLocation = lastHistory &&
//                 lastHistory.LATITUDE === LATITUDE &&
//                 lastHistory.LONGITUDE === LONGITUDE;

//             // Only add new history entry if the location has changed
//             if (!isSameLocation) {
//                 // Ensure geofenceName and geofenceFlag are not null before adding the entry
//                 if (geofenceName && geofenceFlag) {
//                     historyEntry.history.push({ LATITUDE, LONGITUDE, TIMESTAMP, geofenceName, geofenceFlag });
//                 } else {
//                     return res.status(400).json({ error: 'Missing geofenceName or geofenceFlag' });
//                 }
//             }
//         }

//         // Save the updated history entry
//         await historyEntry.save();
//         res.status(200).json({ message: 'History saved' });
//     } catch (error) {
//         console.error('Error saving vessel history:', error);
//         res.status(500).json({ error: 'Failed to save history' });
//     }
// });


// 17-10-2024-end

// Get vessel history by vessel ID


app.get('/api/getvesselHistory/:id', async (req, res) => {
    const vesselId = req.params.id;

    try {
        if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
            return res.status(400).json({ error: 'Invalid vessel ID' });
        }

        const historyEntry = await VesselHistory.findOne({ vesselId });

        if (!historyEntry) {
            return res.status(404).json({ error: 'History not found for this vessel' });
        }

        res.status(200).json(historyEntry);
    } catch (error) {
        console.error('Error retrieving vessel history:', error);
        res.status(500).json({ error: 'Failed to retrieve vessel history' });
    }
});

// app.put('/api/updateVesselFlag/:id', async (req, res) => {
//     const { geofenceFlag } = req.body;
//     const vesselId = req.params.id;

//     try {
//         if (!vesselId || !mongoose.isValidObjectId(vesselId)) {
//             return res.status(400).json({ error: 'Invalid vessel ID' });
//         }

//         const vessel = await TrackedVessel.findById(vesselId);
//         if (vessel) {
//             vessel.geofenceFlag = geofenceFlag; // Update the geofenceFlag field
//             await vessel.save();
//             res.status(200).json({ message: 'Geofence flag updated successfully' });
//         } else {
//             res.status(404).json({ error: 'Vessel not found' });
//         }
//     } catch (error) {
//         console.error('Error updating geofence flag:', error);
//         res.status(500).json({ error: 'Failed to update geofence flag' });
//     }
// });


// Use alert routes
app.use('/api/alert', alertRoutes);

// Routes
app.use('/api/organizations', organizationRoutes);

// Routes
app.use('/api/users', userRoutes);

// Use the login routes
app.use('/api/signin', loginRoutes);

// Routes
app.use('/api/customfields', customFieldsRoutes);

// Serve the uploads directory as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
  

  
 


  


// Start the server and listen on the specified port
app.listen(port,'0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
});








