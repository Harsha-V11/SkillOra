
const express = require("express");

const router = express.Router();

const {
  addSkill,
  removeSkill,
} = require("../controllers/skillController");

const { protect } = require("../middleware/authMiddleware");

// Add a teaching or learning skill
router.post("/:type", protect, addSkill);

// Remove a teaching or learning skill
router.delete("/:type/:skill", protect, removeSkill);

module.exports = router;
