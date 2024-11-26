const express = require('express');
const CryptoJS = require('crypto-js');
const LoginUsers = require('../models/LoginUsers'); // Import your LoginUsers model
const jwt = require('jsonwebtoken');

const router = express.Router();
const encryptionKey = 'mysecretkey'; // Your encryption key

// @desc User sign-in
// @route POST /api/organizations/signin
// @access Public
router.post('/', async (req, res) => {
    const { email, password } = req.body;

    
  
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
  
    try {
      // Convert email to lowercase to avoid case-sensitive issues
      const user = await LoginUsers.findOne({ email: email.toLowerCase() });
      console.log(user);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
    
      const isPasswordValid = CryptoJS.SHA256(password).toString() === user.password;
 

  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid password' });
      }
  
    
  
      // Generate JWT if password matches
      const token = jwt.sign({ id: user.loginUserId, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
      return res.status(200).json({ message: 'Sign-in successful', token });
    } catch (error) {
      console.error('Error during sign-in:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });


  

module.exports = router;
