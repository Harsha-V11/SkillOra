
const User = require("../models/User");

// Get logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully.",
      user,
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    res.status(500).json({
      message: "Unable to fetch your profile.",
    });
  }
};

// Get another user's profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully.",
      user,
    });
  } catch (error) {
    console.error("Get user profile error:", error);

    res.status(500).json({
      message: "Unable to fetch this profile.",
    });
  }
};

// Update logged-in user's profile
const updateMyProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "profession",
      "bio",
      "teachSkills",
      "learnSkills",
      "availabilityDays",
      "availabilityTime",
      "isTeachingOpen",
      "certificationName",
      "certificationIssuer",
      "certificateUrl",
      "profileImage",
      "notifications",
      "emailUpdates",
    ];

    const updates = {};

    // Only accept permitted profile fields.
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No profile changes were provided.",
      });
    }

    // Validate name.
    if (updates.name !== undefined) {
      if (typeof updates.name !== "string" || !updates.name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty.",
        });
      }

      updates.name = updates.name.trim();
    }

    // Validate skill arrays.
    for (const field of ["teachSkills", "learnSkills"]) {
      if (updates[field] !== undefined) {
        if (
          !Array.isArray(updates[field]) ||
          !updates[field].every(
            (skill) =>
              typeof skill === "string" && skill.trim().length > 0
          )
        ) {
          return res.status(400).json({
            message: `${field} must contain valid skill names.`,
          });
        }

        updates[field] = [
          ...new Set(updates[field].map((skill) => skill.trim())),
        ];
      }
    }

    // Validate availability days.
    if (updates.availabilityDays !== undefined) {
      if (typeof updates.availabilityDays !== "string") {
        return res.status(400).json({
          message: "Invalid availability days.",
        });
      }

      const validDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      const selectedDays = updates.availabilityDays
        .split(",")
        .map((day) => day.trim())
        .filter(Boolean);

      if (
        selectedDays.some((day) => !validDays.includes(day)) ||
        new Set(selectedDays).size !== selectedDays.length
      ) {
        return res.status(400).json({
          message: "Please select valid availability days.",
        });
      }

      updates.availabilityDays = selectedDays.join(", ");
    }

    // Validate availability time (24-hour format).
    if (updates.availabilityTime !== undefined) {
      if (typeof updates.availabilityTime !== "string") {
        return res.status(400).json({
          message: "Invalid availability time.",
        });
      }

      const match = updates.availabilityTime.match(
        /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-3]):([0-5]\d)$/
      );

      if (!match) {
        return res.status(400).json({
          message: "Please provide a valid availability time range.",
        });
      }

      const startMinutes = Number(match[1]) * 60 + Number(match[2]);
      const endMinutes = Number(match[3]) * 60 + Number(match[4]);

      if (endMinutes <= startMinutes) {
        return res.status(400).json({
          message: "End time must be later than start time.",
        });
      }
    }

    // Validate certificate URL.
    if (updates.certificateUrl !== undefined) {
      if (typeof updates.certificateUrl !== "string") {
        return res.status(400).json({
          message: "Invalid certificate URL.",
        });
      }

      const certificateUrl = updates.certificateUrl.trim();

      if (certificateUrl) {
        try {
          const parsedUrl = new URL(certificateUrl);

          if (
            !["http:", "https:"].includes(parsedUrl.protocol)
          ) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return res.status(400).json({
            message: "Please enter a valid certificate URL.",
          });
        }
      }

      updates.certificateUrl = certificateUrl;
    }

    // Load the logged-in user.
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // Apply permitted updates.
    Object.keys(updates).forEach((field) => {
      user[field] = updates[field];
    });

    // Save changes with schema validation.
    await user.save();

    // Never return the password.
    const updatedUser = await User.findById(user._id).select("-password");

    res.status(200).json({
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: "Unable to update your profile. Please try again.",
    });
  }
};

module.exports = {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
};
