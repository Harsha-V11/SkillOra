
const express = require("express");

const router = express.Router();

const { getAllUsers } = require("../controllers/discoverController");
const { protect } = require("../middleware/authMiddleware");

// Get all users except the logged-in user
router.get("/", protect, getAllUsers);

module.exports = router;
