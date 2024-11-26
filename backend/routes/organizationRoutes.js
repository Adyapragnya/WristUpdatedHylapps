const express = require('express');
const CryptoJS = require('crypto-js');
const Organization = require('../models/Organization');
const LoginUsers = require('../models/LoginUsers'); 
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Import the path module
const app = express();
// Counter model for managing orgId sequences
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const LoginCounter = require('../models/LoginCounter');

// Configure multer to use diskStorage, which allows control over filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files to the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original file name
  }
});


// File filter to validate the types
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|pdf|mp4|doc|docx|xls|xlsx|txt|csv|svg/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: File type not supported!'), false);
  }
};

// Limit file size to 100MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB file size limit
});



const encryptionKey = 'mysecretkey';

// Helper to encrypt data
const encryptData = (data) => CryptoJS.AES.encrypt(data, encryptionKey).toString();

const decryptData = (encryptedData) => {
  try {
    console.log('Attempting to decrypt:', encryptedData); // Log the encrypted data
    const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted data:', decrypted ? decrypted : 'Unable to decrypt');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return null;
  }
};

// Counter model for managing orgId sequences
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // This will hold the collection name
  seq: { type: Number, default: 555 } // Start from 555
});

const Counter = mongoose.model('Counter', counterSchema);

// Function to get the next sequence number for orgId
const getNextSequence = async (seqName) => {
  const sequenceDocument = await Counter.findByIdAndUpdate(
    { _id: seqName },
    { $inc: { seq: 1 } },
    { new: true, upsert: true } // Create if it doesn't exist
  );

  return sequenceDocument.seq;
};

// Function to reset the counter to start from 555
const resetCounter = async () => {
  await Counter.findByIdAndUpdate(
    { _id: 'orgId' },
    { seq: 555 },
    { upsert: true }
  );
};







// Function to send email with login details and reset token
const sendLoginEmail = async (adminEmail, password) => {
  try {
    const token = jwt.sign({ email: adminEmail }, encryptionKey, { expiresIn: '1h' }); // Generate a token

    const transporter = nodemailer.createTransport({
      service: 'gmail', // or your email provider
      auth: {
        user: 'admin@hylapps.com',
        pass: 'ngsl cgmz pnmt uiux',
      },
    });

    const mailOptions = {
      from: 'admin@hylapps.com',
      to: adminEmail,
      subject: 'Your Organization Admin Account Details',
      text: `Welcome! Your account has been created.
Email: ${adminEmail}
Temporary Password: ${password}
Please reset your password using this link: ${process.env.REACT_APP_API_BASE_URL2}/authentication/reset-password?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Login email sent successfully.');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};



// @desc Create a new organization
// @route POST /api/organizations
// @access Public


router.post('/create', upload.array('files'), async (req, res) => {
  const { companyName, address, contactEmail, assignShips, adminFirstName, adminLastName, adminEmail, adminContactNumber } = req.body;

  if (!companyName || !address || !contactEmail || !adminFirstName || !adminLastName || !adminEmail || !adminContactNumber || !assignShips) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const session = await Organization.startSession();
  session.startTransaction();

  try {
    const organizationCount = await Organization.countDocuments().session(session);
    if (organizationCount === 0) {
      await resetCounter();
    }

    const loginCounter = await LoginCounter.findOneAndUpdate(
      {},
      { $inc: { seq: 1 } },
      { new: true, upsert: true, session }
    );

   

  

    const orgseq = await getNextSequence('orgId') ;
    const orgId = `ORG${orgseq}`;

    const loginUserId = `HYLA${loginCounter.seq}_${orgId}_ADMIN`;

    const newOrganization = new Organization({
      orgId,
      companyName,
      address,
      contactEmail: encryptData(contactEmail),
      assignShips,
      adminFirstName,
      adminLastName,
      adminEmail: encryptData(adminEmail),
      adminContactNumber: encryptData(adminContactNumber),
      files: req.files.map(file => file.path)
    });

    await newOrganization.save({ session });

    const hashedPassword = CryptoJS.SHA256(adminContactNumber).toString();

    const adminUser = new LoginUsers({
      loginUserId,
      role: 'organization admin',
      email: adminEmail,
      password: hashedPassword,
    });

    await adminUser.save({ session });
    await sendLoginEmail(adminEmail, adminContactNumber);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({ message: 'Organization created and email sent to admin.' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating organization:', error);
    res.status(500).json({ message: 'Error creating organization or sending email.', error: error.message });
  }
});


// Function to generate a random password
function generateRandomPassword(length = 12) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?'; // Define the character set
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length); // Get a random index
    password += charset[randomIndex]; // Append the random character to the password
  }

  return password; // Return the generated password
}


// @desc Get all organizations
// @route GET /api/organizations/getData
// @access Public
router.get('/getData', async (req, res) => {
  try {
    const organizations = await Organization.find();

    const decryptedOrganizations = organizations.map((org) => {
      // Decrypt the values only if available, otherwise use the original (encrypted) values
      const decryptedContactEmail = decryptData(org.contactEmail) || org.contactEmail;
      const decryptedAdminEmail = decryptData(org.adminEmail) || org.adminEmail;
      const decryptedAdminContactNumber = decryptData(org.adminContactNumber) || org.adminContactNumber;

      return {
        ...org._doc, // Spread the entire document fields
        contactEmail: decryptedContactEmail, // Replace with decrypted value or fallback to original
        adminEmail: decryptedAdminEmail,     // Replace with decrypted value or fallback
        adminContactNumber: decryptedAdminContactNumber // Replace with decrypted value or fallback
      };
    });

    res.json(decryptedOrganizations);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});


// Get all organizations
router.get('/', async (req, res) => {
  try {
    const organizations = await Organization.find({}, 'companyName');

    res.json(organizations.map(org => org.companyName));
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Get organization details by name
router.get('/:name', async (req, res) => {
  try {
    const organization = await Organization.findOne({ companyName: req.params.name });

    if (!organization) {
      return res.status(404).send('Organization not found');
    }
    const decryptedContactEmail = decryptData(organization.contactEmail) || organization.contactEmail;
    res.json({
      orgId: organization.orgId,
      address: organization.address,
      contactEmail: decryptedContactEmail,
    });

  } catch (error) {
    console.error('Error fetching organization details:', error);
    res.status(500).send('Internal Server Error');
  }
});


// New API endpoint to get available vessels based on organization ID
router.get('/getAvailableVessels/:orgId', async (req, res) => {
  try {
    const orgId = req.params.orgId;
    const organization = await Organization.findOne({ orgId });
    console.log(organization);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({ assignShips: organization.assignShips });
  } catch (error) {
    console.error('Error fetching available vessels:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// @desc Request a password reset
// @route POST /api/organizations/reset-password
// @access Public
router.post('/reset-password', async (req, res) => {
  const { email, tempPassword, newPassword } = req.body;

  if (!email || !tempPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Find the user in the LoginUsers collection
    const user = await LoginUsers.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the temporary password matches the stored hashed password
    const isPasswordValid = CryptoJS.SHA256(tempPassword).toString() === user.password;

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid temporary password' });
    }

    // Hash the new password
    const hashedNewPassword = CryptoJS.SHA256(newPassword).toString();

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error', error });
  }
});

// @desc Verify the password reset token
// @route GET /api/organizations/verify-token
// @access Public
router.get('/verify-token', (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  jwt.verify(token, encryptionKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Token is valid
    res.json({ message: 'Token is valid', email: decoded.email });
  });
});



module.exports = router;


