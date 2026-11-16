
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Session = require("../models/Session");

// Create a review for a completed session
const createReview = async (req, res) => {
  try {
    const { sessionId, rating, comment } = req.body;

    // Validate required fields
    if (!sessionId || rating === undefined || rating === null) {
      return res.status(400).json({
        message: "Session ID and rating are required.",
      });
    }

    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    // Validate rating
    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number between 1 and 5.",
      });
    }

    // Validate comment
    if (typeof comment !== "string") {
      return res.status(400).json({
        message: "Please provide a valid review comment.",
      });
    }

    const normalizedComment = comment.trim();

    if (!normalizedComment) {
      return res.status(400).json({
        message: "Review comment is required.",
      });
    }

    if (normalizedComment.length > 1000) {
      return res.status(400).json({
        message: "Review comment cannot exceed 1000 characters.",
      });
    }

    // Find session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    // Only completed sessions can be reviewed
    if (session.status !== "completed") {
      return res.status(400).json({
        message: "You can only review completed sessions.",
      });
    }

    const reviewerId = req.user._id.toString();

    let revieweeId;

    // Identify the other participant
    if (session.teacher.toString() === reviewerId) {
      revieweeId = session.student;
    } else if (session.student.toString() === reviewerId) {
      revieweeId = session.teacher;
    } else {
      return res.status(403).json({
        message: "You are not a participant in this session.",
      });
    }

    // Prevent duplicate reviews
    const existingReview = await Review.findOne({
      session: sessionId,
      reviewer: req.user._id,
    });

    if (existingReview) {
      return res.status(409).json({
        message: "You have already reviewed this session.",
      });
    }

    // Create review
    const review = await Review.create({
      session: sessionId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating: numericRating,
      comment: normalizedComment,
    });

    res.status(201).json({
      message: "Review submitted successfully.",
      review,
    });
  } catch (error) {
    // Handle duplicate review submissions
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You have already reviewed this session.",
      });
    }

    console.error("Create review error:", error);

    res.status(500).json({
      message: "Unable to submit review. Please try again.",
    });
  }
};

// Get reviews received by a user
const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const reviews = await Review.find({
      reviewee: userId,
    })
      .populate("reviewer", "name profession profileImage")
      .populate("session", "skill scheduledAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully.",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get user reviews error:", error);

    res.status(500).json({
      message: "Unable to fetch user reviews.",
    });
  }
};

// Get reviews submitted by logged-in user
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewer: req.user._id,
    })
      .populate("reviewee", "name profession profileImage")
      .populate("session", "skill scheduledAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Your reviews fetched successfully.",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get my reviews error:", error);

    res.status(500).json({
      message: "Unable to fetch your reviews.",
    });
  }
};

module.exports = {
  createReview,
  getUserReviews,
  getMyReviews,
};
