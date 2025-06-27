const express = require('express');
const router = express.Router();
 const bcrypt = require('bcrypt');
// const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken'); // Import jwt module
const connection = require("../connection")
const SignUp = require('../Modules/signUp'); // Assuming you have a SignUp model
require('dotenv').config();
const saltRounds = 10;


// Define the route handler using the router object
router.post('/', async (req, res) => {
    const { password, email } = req.body;
    try {
        // Find user by email
        const user = await SignUp.findOne({ email });
        console.log("user", user )
        
        // If user is not found or password is invalid, return 401
        if (!user) {
            return res.status(401).json({ msg: "User not found" });
        }
        
        // Compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);
              console.log("isValidPassword",isValidPassword)
        if (!isValidPassword) {
            return res.status(401).json({ msg: "Invalid password" });
        }
        
        // Generate JWT token
        const token = jwt.sign({
            userId: user._id,
            email: user.email,
            name: user.name
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }); // Corrected the typo in ACCESS_TOKEN_SECRET
        
        // Send token in response
        res.json({ token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;
