
const mongoose = require("mongoose");

const emailVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    otpHash: {
      type: String,
      required: true,
      match: /^[a-f0-9]{64}$/i,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Attempts must be a whole number.",
      },
    },

    lastSentAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Automatically delete expired verification records
emailVerificationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

module.exports = mongoose.model(
  "EmailVerification",
  emailVerificationSchema
);
