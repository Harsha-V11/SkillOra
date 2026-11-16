
const express = require("express");

const router = express.Router();

const {
  createSession,
  getMySessions,
  getSessionById,
  updateSessionStatus,
} = require("../controllers/sessionController");

const { protect } = require("../middleware/authMiddleware");

// Create a session
router.post("/", protect, createSession);

// Get all my sessions
router.get("/", protect, getMySessions);

// Get session details
router.get("/:id", protect, getSessionById);

// Update session status
router.patch("/:id/status", protect, updateSessionStatus);

module.exports = router;
