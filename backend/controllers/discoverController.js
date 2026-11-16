
const User = require("../models/User");

// Get all users for discovery
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Users fetched successfully.",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Discover users error:", error);

    res.status(500).json({
      message: "Unable to fetch users. Please try again.",
    });
  }
};

module.exports = {
  getAllUsers,
};
