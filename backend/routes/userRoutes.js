
const express = require('express');
const User = require('../models/User'); // Adjust the path as needed
const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const router = express.Router();
const LoginUsers = require('../models/LoginUsers'); 
const UserCounter = require('../models/UserCounter');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const encryptionKey = 'mysecretkey';
// Secret key used for encryption and decryption (replace with your actual key)
const secretKey = '12345';
require('dotenv').config();
const LoginCounter = require('../models/LoginCounter');

// Function to decrypt data (adjusted for your current encryption scheme)
const decryptData = (encryptedText) => {
  if (!encryptedText) {
    return null; // Handle empty or null data
  }

  try {
    // Decrypt using the same secret key as used in encryption
    const bytes = CryptoJS.AES.decrypt(encryptedText, secretKey);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData || null;
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
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

  router.post('/create', async (req, res) => {
    try {
      const userCounter = await UserCounter.findOneAndUpdate(
        {},
        { $inc: { userId: 1 } },
        { new: true, upsert: true }
      );




      const loginCounter = await LoginCounter.findOneAndUpdate(
        {},
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

 
      let loginUserId;

      // Determine loginUserId based on userType
      if (req.body.userType === 'hyla admin') {
        loginUserId = `HYLA${loginCounter.seq}`;
      } else if (req.body.userType === 'organizational user' && req.body.orgId) {
        loginUserId = `HYLA${loginCounter.seq}_${req.body.orgId}`;
      } else if (req.body.userType === 'guest') {
        loginUserId = `HYLA${loginCounter.seq}_GUEST${userCounter.userId}`;
      }
  
      
  
      const newUserData = {
        ...req.body,
        userId: userCounter.userId,
      };
  
      // Set orgId based on user type
      if (req.body.userType === 'organizational user' && req.body.orgId) {
        newUserData.orgId = `${req.body.orgId}`;
      } else {
        newUserData.orgId = null; // Adjust as necessary
      }
  
      const newUser = new User(newUserData);
      await newUser.save();
  
      const hashedPassword = CryptoJS.SHA256(decryptData(newUser.userContactNumber)).toString();
      const OrgUserAndGuest = new LoginUsers({
        loginUserId,
        role: newUser.userType,
        email: decryptData(newUser.userEmail),
        password: hashedPassword,
      });
  
      await OrgUserAndGuest.save();
      await sendLoginEmail(decryptData(newUser.userEmail), decryptData(newUser.userContactNumber));
  
      res.status(201).json({ message: 'User created and email sent successfully', user: newUser });
    } catch (error) {
      console.error('Error creating User:', error);
      res.status(500).json({ message: 'Error creating User or sending email.', error: error.message });
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



// Get organization data and decrypt sensitive fields
router.get('/getData', async (req, res) => {
  try {
    let organizations = await User.find(); // Fetch data from the database

    // Decrypt necessary fields for each organization
    organizations = organizations.map(org => ({
      ...org._doc,
      contactEmail: decryptData(org.contactEmail),
      userEmail: decryptData(org.userEmail),
      userContactNumber: decryptData(org.userContactNumber),
      // Decrypt other fields as needed
    }));

    res.status(200).json(organizations);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving data', error: error.message });
  }
});


module.exports = router;
