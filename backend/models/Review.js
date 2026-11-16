
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      required: true,
      minlength: 1,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// One review per user for each session
reviewSchema.index(
  { session: 1, reviewer: 1 },
  { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);
