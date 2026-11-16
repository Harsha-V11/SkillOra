
const User = require("../models/User");
const EmailVerification = require("../models/EmailVerification");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendOtpEmail } = require("../config/mailer");

// Generate login JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Securely hash OTP using HMAC
const hashOtp = (otp) => {
  return crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(otp)
    .digest("hex");
};

// Validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Send email verification OTP
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (
      typeof email !== "string" ||
      !isValidEmail(email.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "This email is already registered.",
      });
    }

    const existingVerification = await EmailVerification.findOne({
      email: normalizedEmail,
    });

    // Allow one OTP every 60 seconds
    if (existingVerification && existingVerification.lastSentAt) {
      const elapsed =
        Date.now() - existingVerification.lastSentAt.getTime();

      if (elapsed < 60000) {
        return res.status(429).json({
          message: "Please wait 60 seconds before requesting another OTP.",
        });
      }
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    // Send email before saving the new OTP
    await sendOtpEmail(normalizedEmail, otp);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await EmailVerification.findOneAndUpdate(
      { email: normalizedEmail },
      {
        otpHash: hashOtp(otp),
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: "OTP sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("OTP sending error:", error.message);

    res.status(500).json({
      message: "Unable to send OTP. Please try again later.",
    });
  }
};

// Verify email OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !isValidEmail(email.trim()) ||
      !/^\d{6}$/.test(otp.trim())
    ) {
      return res.status(400).json({
        message: "Please provide a valid email address and six-digit OTP.",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedOtp = otp.trim();

    const verification = await EmailVerification.findOne({
      email: normalizedEmail,
    });

    if (!verification) {
      return res.status(400).json({
        message: "Please request a new OTP.",
      });
    }

    if (verification.expiresAt <= new Date()) {
      await EmailVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(400).json({
        message: "OTP has expired. Please request a new one.",
      });
    }

    if (verification.attempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Request a new OTP.",
      });
    }

    const submittedHash = hashOtp(normalizedOtp);

    const storedHash = verification.otpHash;

    const isValidHash =
      typeof storedHash === "string" &&
      /^[a-f0-9]{64}$/i.test(storedHash);

    if (!isValidHash) {
      return res.status(400).json({
        message: "Invalid OTP verification. Please request a new OTP.",
      });
    }

    const isValid = crypto.timingSafeEqual(
      Buffer.from(submittedHash, "hex"),
      Buffer.from(storedHash, "hex")
    );

    if (!isValid) {
      verification.attempts += 1;
      await verification.save();

      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
      });
    }

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    const verificationToken = jwt.sign(
      {
        email: normalizedEmail,
        purpose: "email-verification",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    res.status(200).json({
      message: "Email verified successfully.",
      verificationToken,
    });
  } catch (error) {
    console.error("OTP verification error:", error.message);

    res.status(500).json({
      message: "Unable to verify OTP.",
    });
  }
};

// Register only after email verification
const registerUser = async (req, res) => {
  try {
    const { name, email, password, verificationToken } = req.body;

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      typeof verificationToken !== "string"
    ) {
      return res.status(400).json({
        message: "All fields and email verification are required.",
      });
    }

    const normalizedName = name.trim();
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedName || normalizedName.length > 100) {
      return res.status(400).json({
        message: "Please provide a valid name (maximum 100 characters).",
      });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must contain at least 8 characters.",
      });
    }

    if (password.length > 128) {
      return res.status(400).json({
        message: "Password cannot exceed 128 characters.",
      });
    }

    // Verify email verification token
    let decoded;

    try {
      decoded = jwt.verify(
        verificationToken,
        process.env.JWT_SECRET
      );
    } catch {
      return res.status(401).json({
        message: "Email verification expired. Please verify again.",
      });
    }

    if (
      decoded.purpose !== "email-verification" ||
      decoded.email !== normalizedEmail
    ) {
      return res.status(401).json({
        message: "Email verification does not match this email address.",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
    });

    res.status(201).json({
      message: "Registration successful.",
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Unable to complete registration. Please try again.",
    });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please provide email and password.",
      });
    }

    if (!isValidEmail(email.trim())) {
      return res.status(400).json({
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (user && (await user.comparePassword(password))) {
      return res.status(200).json({
        message: "Login successful.",
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    res.status(401).json({
      message: "Invalid email or password.",
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
};
