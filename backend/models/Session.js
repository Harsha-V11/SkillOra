
const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    skill: {
      type: String,
      required: true,
      trim: true,
    },

    // Identifies which direction of the request this session represents
    direction: {
      type: String,
      enum: ["requested", "offered"],
      default: "requested",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      default: 60,
      min: 15,
      max: 240,
      validate: {
        validator: Number.isInteger,
        message: "Duration must be a whole number.",
      },
    },

    meetingLink: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["upcoming", "completed", "cancelled"],
      default: "upcoming",
    },
  },
  { timestamps: true }
);

// Teacher and student must be different users
sessionSchema.pre("validate", function () {
  if (
    this.teacher &&
    this.student &&
    this.teacher.toString() === this.student.toString()
  ) {
    this.invalidate(
      "student",
      "Teacher and student cannot be the same user."
    );
  }
});

// Prevent duplicate sessions for the same request and direction
sessionSchema.index(
  { request: 1, direction: 1 },
  { unique: true }
);

module.exports = mongoose.model("Session", sessionSchema);
