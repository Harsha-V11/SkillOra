
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const skillRoutes = require("./routes/skillRoutes");
const discoverRoutes = require("./routes/discoverRoutes");
const requestRoutes = require("./routes/requestRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const { protect } = require("./middleware/authMiddleware");

const app = express();

// Middleware
const allowedOrigins = (
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use(express.json({ limit: "10kb" }));

// Public test route
app.get("/", (req, res) => {
  res.send("SkillSwap Backend is running!");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Application routes
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/discover", discoverRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/reviews", reviewRoutes);

// Protected test route
app.get("/api/protected", protect, (req, res) => {
  res.status(200).json({
    message: "You have successfully accessed a protected route!",
    user: req.user,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found.",
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({
      message: "Invalid JSON request body.",
    });
  }

  res.status(500).json({
    message: "Internal server error.",
  });
});

// Start server after MongoDB connects
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`SkillSwap server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start SkillSwap server:", error.message);
    process.exit(1);
  });
