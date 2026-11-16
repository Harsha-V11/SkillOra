
const express = require("express");

const router = express.Router();

const {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

// Get logged-in user's profile
router.get("/me", protect, getMyProfile);

// Update logged-in user's profile
router.put("/me", protect, updateMyProfile);

// Get another user's profile
router.get("/:userId", protect, getUserProfile);

module.exports = router;
