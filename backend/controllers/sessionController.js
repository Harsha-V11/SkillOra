
const Session = require("../models/Session");
const Request = require("../models/Request");
const mongoose = require("mongoose");

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
};

// Create a session from an accepted request
const createSession = async (req, res) => {
  try {
    const {
      requestId,
      direction = "requested",
      scheduledAt,
      duration = 60,
      meetingLink = "",
    } = req.body;

    if (!requestId || !scheduledAt) {
      return res.status(400).json({
        message: "Request ID and scheduled date are required.",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    if (!["requested", "offered"].includes(direction)) {
      return res.status(400).json({
        message: "Invalid session direction.",
      });
    }

    // Validate and normalize meeting link
    const normalizedMeetingLink =
      typeof meetingLink === "string" ? meetingLink.trim() : null;

    if (
      normalizedMeetingLink === null ||
      !isValidUrl(normalizedMeetingLink)
    ) {
      return res.status(400).json({
        message: "Please provide a valid meeting link.",
      });
    }

    const date = new Date(scheduledAt);

    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({
        message: "Please provide a valid future date and time.",
      });
    }

    const sessionDuration = Number(duration);

    if (
      !Number.isInteger(sessionDuration) ||
      sessionDuration < 15 ||
      sessionDuration > 240
    ) {
      return res.status(400).json({
        message: "Session duration must be between 15 and 240 minutes.",
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    if (request.status !== "accepted") {
      return res.status(400).json({
        message: "A session can only be created from an accepted request.",
      });
    }

    const userId = req.user._id.toString();

    const isParticipant =
      request.sender.toString() === userId ||
      request.receiver.toString() === userId;

    if (!isParticipant) {
      return res.status(403).json({
        message: "You are not part of this request.",
      });
    }

    // Support older requests that do not have the new fields
    const exchangeMode = request.exchangeMode || "teacher-learner";
    const requestedSkill = request.requestedSkill || request.skill;

    let teacher;
    let student;
    let skill;

    if (direction === "requested") {
      // Receiver teaches the requested skill to sender
      teacher = request.receiver;
      student = request.sender;
      skill = requestedSkill;
    } else {
      // Only mutual exchanges can have the offered direction
      if (exchangeMode !== "mutual") {
        return res.status(400).json({
          message:
            "Teacher–Learner requests support only one session direction.",
        });
      }

      if (!request.offeredSkill) {
        return res.status(400).json({
          message: "The offered teaching skill is missing from this request.",
        });
      }

      // Sender teaches the offered skill to receiver
      teacher = request.sender;
      student = request.receiver;
      skill = request.offeredSkill;
    }

    // Prevent duplicate sessions for the same direction
    const existingSession = await Session.findOne({
      request: requestId,
      direction,
    });

    if (existingSession) {
      return res.status(409).json({
        message:
          "A session already exists for this direction of the request.",
      });
    }

    const session = await Session.create({
      request: requestId,
      teacher,
      student,
      skill,
      direction,
      scheduledAt: date,
      duration: sessionDuration,
      meetingLink: normalizedMeetingLink,
    });

    res.status(201).json({
      message: "Session created successfully.",
      session,
    });
  } catch (error) {
    console.error("Create session error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        message:
          "A session already exists for this direction of the request.",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// Get all sessions involving logged-in user
const getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { teacher: req.user._id },
        { student: req.user._id },
      ],
    })
      .populate("teacher", "name email profession profileImage")
      .populate("student", "name email profession profileImage")
      .populate("request", "exchangeMode requestedSkill offeredSkill status")
      .sort({ scheduledAt: 1 });

    res.status(200).json({
      message: "Sessions fetched successfully.",
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Get one session by ID
const getSessionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    const session = await Session.findById(req.params.id)
      .populate("teacher", "name email profession profileImage")
      .populate("student", "name email profession profileImage")
      .populate("request", "exchangeMode requestedSkill offeredSkill status");

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    const isParticipant =
      session.teacher._id.toString() === req.user._id.toString() ||
      session.student._id.toString() === req.user._id.toString();

    if (!isParticipant) {
      return res.status(403).json({
        message: "You cannot access this session.",
      });
    }

    res.status(200).json({
      message: "Session fetched successfully.",
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Update session status
const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate session ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid session ID.",
      });
    }

    if (!["completed", "cancelled"].includes(status)) {
      return res.status(400).json({
        message: "Status must be completed or cancelled.",
      });
    }

    const session = await Session.findOne({
      _id: req.params.id,
      $or: [
        { teacher: req.user._id },
        { student: req.user._id },
      ],
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found.",
      });
    }

    if (session.status !== "upcoming") {
      return res.status(400).json({
        message: "This session has already been handled.",
      });
    }

    session.status = status;
    await session.save();

    res.status(200).json({
      message: `Session ${status} successfully.`,
      session,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createSession,
  getMySessions,
  getSessionById,
  updateSessionStatus,
};
