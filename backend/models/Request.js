
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Retained for backward compatibility
    skill: {
      type: String,
      required: true,
      trim: true,
    },

    // The type of learning arrangement
    exchangeMode: {
      type: String,
      enum: ["mutual", "teacher-learner"],
      default: "teacher-learner",
      required: true,
    },

    // Skill the sender wants to learn from the receiver
    requestedSkill: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
    },

    // Skill the sender offers to teach the receiver
    offeredSkill: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (value) {
          return (
            this.exchangeMode !== "mutual" ||
            Boolean(value && value.trim())
          );
        },
        message: "Offered skill is required for mutual exchange.",
      },
    },

    message: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// Sender and receiver must be different users
requestSchema.pre("validate", function () {
  if (
    this.sender &&
    this.receiver &&
    this.sender.toString() === this.receiver.toString()
  ) {
    this.invalidate(
      "receiver",
      "You cannot send a request to yourself."
    );
  }
});

module.exports = mongoose.model("Request", requestSchema);
