
const express = require("express");

const router = express.Router();

const {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
} = require("../controllers/requestController");

const { protect } = require("../middleware/authMiddleware");

// Send a request
router.post("/", protect, sendRequest);

// Get received requests
router.get("/received", protect, getReceivedRequests);

// Get sent requests
router.get("/sent", protect, getSentRequests);

// Accept or reject a request
router.patch("/:id/respond", protect, respondToRequest);

module.exports = router;
