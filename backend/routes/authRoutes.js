
const express = require("express");

const router = express.Router();

const {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
} = require("../controllers/authController");

// Send email verification OTP
router.post("/send-otp", sendOtp);

// Verify email OTP
router.post("/verify-otp", verifyOtp);

// Register verified user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

module.exports = router;
