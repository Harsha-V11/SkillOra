
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      maxlength: 128,
    },

    profession: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100,
    },

    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    teachSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 100,
        },
      ],
      default: [],
    },

    learnSkills: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 100,
        },
      ],
      default: [],
    },

    availabilityDays: {
      type: String,
      default: "Monday – Friday",
      trim: true,
    },

    availabilityTime: {
      type: String,
      default: "5:00 PM – 8:00 PM",
      trim: true,
    },

    isTeachingOpen: {
      type: Boolean,
      default: true,
    },

    certificationName: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    certificationIssuer: {
      type: String,
      default: "",
      trim: true,
      maxlength: 150,
    },

    certificateUrl: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    // Account Settings
    notifications: {
      type: Boolean,
      default: true,
    },

    emailUpdates: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare login password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
