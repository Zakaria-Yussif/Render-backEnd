const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); // ✅ Using bcryptjs (no native build issues)
const nodemailer = require('nodemailer');
const SignUp = require('../Modules/signUp');
require('dotenv').config(); // ✅ For reading environment variables

// Password update route
router.put("/updatePassword", async (req, res) => {
  const { email, newPassword } = req.body;

  try {
    // Validate input
    if (!email || !newPassword || newPassword.trim() === "") {
      return res.status(400).json({ msg: "Email and new password are required" });
    }

    // Find the user by email
    const user = await SignUp.findOne({ email });
    if (!user) {
      return res.status(404).json({ msg: "Email not registered" });
    }

    // Hash and update the password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ msg: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});


// Password reset email request route
router.post("/passwordResetRequest", async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const userEmail = await SignUp.findOne({ email });
    if (!userEmail) {
      return res.status(404).json({ msg: "Email not registered" });
    }

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Mail content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="margin: 20px;">
          <h1>ConnectTeam</h1>
          <h4>Hi ${userEmail.name},</h4>
          <p>You requested a password reset. Click the button below to reset it:</p>
          <a href="http://localhost:3000/resetPassword" style="display: inline-block; padding: 10px; background-color: #009E60; color: #fff; text-decoration: none;">Reset Password</a>
          <p>If you didn’t request this, just ignore this email.</p>
          <img src="https://media.istockphoto.com/id/495341926/photo/talking-to-partner.jpg?s=612x612" style="margin-top: 20px; height: 200px; width: 420px;" />
          <div style="margin-top: 30px;">
            <p>Follow us on:</p>
            <img src="https://1.bp.blogspot.com/-S8HTBQqmfcs/XN0ACIRD9PI/AAAAAAAAAlo/FLhccuLdMfIFLhocRjWqsr9cVGdTN_8sgCPcBGAYYCw/s1600/f_logo_RGB-Blue_1024.png" alt="Facebook" style="width: 30px; height: 30px; margin-right: 10px;" />
            <img src="http://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style="width: 30px; height: 30px; margin-right: 10px;" />
            <img src="https://tse2.mm.bing.net/th?id=OIP.PXTov9TveYX3Upu592UOygHaHa&pid=Api&P=0&h=220" alt="Twitter" style="width: 30px; height: 30px;" />
          </div>
          <p style="color: gray; font-size: 12px;">&copy; ConnectBusiness.com</p>
        </div>
      `
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending reset email:", error);
        return res.status(500).json({ msg: "Failed to send password reset email" });
      } else {
        console.log("Reset email sent:", info.response);
        return res.status(200).json({ msg: "Password reset link sent to email" });
      }
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return res.status(500).json({ msg: "Internal server error" });
  }
});

module.exports = router;
