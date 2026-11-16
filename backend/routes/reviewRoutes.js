
const express = require("express");

const router = express.Router();

const {
  createReview,
  getUserReviews,
  getMyReviews,
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

// Submit a review (login required)
router.post("/", protect, createReview);

// Get reviews submitted by logged-in user
router.get("/my", protect, getMyReviews);

// Get reviews received by a particular user (login required)
router.get("/user/:userId", protect, getUserReviews);

module.exports = router;
