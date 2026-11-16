
const User = require("../models/User");

// Add a skill
const addSkill = async (req, res) => {
  try {
    const { type } = req.params;
    const { skill } = req.body;

    if (!["teach", "learn"].includes(type)) {
      return res.status(400).json({
        message: "Invalid skill type. Use teach or learn.",
      });
    }

    if (!skill || !skill.trim()) {
      return res.status(400).json({
        message: "Please provide a skill.",
      });
    }

    const field = type === "teach" ? "teachSkills" : "learnSkills";

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { [field]: skill.trim() } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Skill added successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Remove a skill
const removeSkill = async (req, res) => {
  try {
    const { type, skill } = req.params;

    if (!["teach", "learn"].includes(type)) {
      return res.status(400).json({
        message: "Invalid skill type. Use teach or learn.",
      });
    }

    const field = type === "teach" ? "teachSkills" : "learnSkills";

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { [field]: skill } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Skill removed successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  addSkill,
  removeSkill,
};
