
const mongoose = require("mongoose");
const Request = require("../models/Request");
const User = require("../models/User");

const normalizeSkill = (skill) =>
  String(skill || "").trim().toLowerCase();

const hasSkill = (skills, skill) => {
  const target = normalizeSkill(skill);

  return (
    Array.isArray(skills) &&
    skills.some((item) => normalizeSkill(item) === target)
  );
};

// Send a skill exchange request
const sendRequest = async (req, res) => {
  try {
    const {
      receiverId,
      exchangeMode,
      requestedSkill,
      offeredSkill,
      message,
    } = req.body;

    // Validate receiver ID
    if (
      !receiverId ||
      typeof receiverId !== "string" ||
      !mongoose.Types.ObjectId.isValid(receiverId)
    ) {
      return res.status(400).json({
        message: "Please select a valid user.",
      });
    }

    // Validate requested skill
    if (
      typeof requestedSkill !== "string" ||
      !requestedSkill.trim()
    ) {
      return res.status(400).json({
        message: "Receiver and requested skill are required.",
      });
    }

    if (requestedSkill.trim().length > 100) {
      return res.status(400).json({
        message: "Requested skill cannot exceed 100 characters.",
      });
    }

    // Validate exchange arrangement
    if (!["mutual", "teacher-learner"].includes(exchangeMode)) {
      return res.status(400).json({
        message: "Please select a valid exchange arrangement.",
      });
    }

    // Validate optional message
    const normalizedMessage =
      message === undefined ? "" : message;

    if (typeof normalizedMessage !== "string") {
      return res.status(400).json({
        message: "Please provide a valid message.",
      });
    }

    if (normalizedMessage.trim().length > 1000) {
      return res.status(400).json({
        message: "Message cannot exceed 1000 characters.",
      });
    }

    // Validate offered skill for mutual exchange
    if (
      offeredSkill !== undefined &&
      typeof offeredSkill !== "string"
    ) {
      return res.status(400).json({
        message: "Please provide a valid offered skill.",
      });
    }

    const normalizedRequestedSkill = requestedSkill.trim();
    const normalizedOfferedSkill =
      typeof offeredSkill === "string" ? offeredSkill.trim() : "";

    if (normalizedOfferedSkill.length > 100) {
      return res.status(400).json({
        message: "Offered skill cannot exceed 100 characters.",
      });
    }

    if (
      exchangeMode === "mutual" &&
      !normalizedOfferedSkill
    ) {
      return res.status(400).json({
        message: "Please select a skill you can teach in return.",
      });
    }

    if (
      receiverId === req.user._id.toString()
    ) {
      return res.status(400).json({
        message: "You cannot send a request to yourself.",
      });
    }

    const [sender, receiver] = await Promise.all([
      User.findById(req.user._id),
      User.findById(receiverId),
    ]);

    if (!sender) {
      return res.status(404).json({
        message: "Your user account could not be found.",
      });
    }

    if (!receiver) {
      return res.status(404).json({
        message: "Receiver not found.",
      });
    }

    if (receiver.isTeachingOpen === false) {
      return res.status(400).json({
        message: "This user is currently unavailable for teaching.",
      });
    }

    // Receiver must be able to teach the requested skill
    if (!hasSkill(receiver.teachSkills, normalizedRequestedSkill)) {
      return res.status(400).json({
        message: "The selected user does not teach this skill.",
      });
    }

    // Mutual exchange requires both sides to have matching skills
    if (exchangeMode === "mutual") {
      if (!hasSkill(sender.teachSkills, normalizedOfferedSkill)) {
        return res.status(400).json({
          message: "You must have the offered skill in your teaching skills.",
        });
      }

      if (!hasSkill(receiver.learnSkills, normalizedOfferedSkill)) {
        return res.status(400).json({
          message: "The receiver is not looking to learn this offered skill.",
        });
      }
    }

    // Prevent duplicate pending requests with the same arrangement
    const pendingRequests = await Request.find({
      sender: sender._id,
      receiver: receiver._id,
      status: "pending",
    });

    const duplicateRequest = pendingRequests.some((request) => {
      const sameMode = request.exchangeMode === exchangeMode;

      // Support older requests using the legacy skill field
      const existingRequestedSkill =
        request.requestedSkill || request.skill;

      const sameRequestedSkill =
        normalizeSkill(existingRequestedSkill) ===
        normalizeSkill(normalizedRequestedSkill);

      const sameOfferedSkill =
        normalizeSkill(request.offeredSkill) ===
        normalizeSkill(
          exchangeMode === "mutual" ? normalizedOfferedSkill : ""
        );

      return (
        sameMode &&
        sameRequestedSkill &&
        sameOfferedSkill
      );
    });

    if (duplicateRequest) {
      return res.status(409).json({
        message: "A matching pending request already exists.",
      });
    }

    // Create request
    const request = await Request.create({
      sender: sender._id,
      receiver: receiver._id,
      exchangeMode,
      requestedSkill: normalizedRequestedSkill,
      offeredSkill:
        exchangeMode === "mutual" ? normalizedOfferedSkill : "",
      skill: normalizedRequestedSkill,
      message: normalizedMessage.trim(),
    });

    res.status(201).json({
      message: "Request sent successfully.",
      request,
    });
  } catch (error) {
    console.error("Send request error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        message: "A matching request already exists.",
      });
    }

    res.status(500).json({
      message: "Unable to send request. Please try again.",
    });
  }
};

// Get requests received by logged-in user
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      receiver: req.user._id,
    })
      .populate(
        "sender",
        "name email profession profileImage teachSkills learnSkills"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Received requests fetched successfully.",
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get received requests error:", error);

    res.status(500).json({
      message: "Unable to fetch received requests.",
    });
  }
};

// Get requests sent by logged-in user
const getSentRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      sender: req.user._id,
    })
      .populate(
        "receiver",
        "name email profession profileImage teachSkills learnSkills"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Sent requests fetched successfully.",
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get sent requests error:", error);

    res.status(500).json({
      message: "Unable to fetch sent requests.",
    });
  }
};

// Accept or reject a received request
const respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Validate request ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid request ID.",
      });
    }

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Status must be accepted or rejected.",
      });
    }

    // Only the receiver can respond
    const request = await Request.findOne({
      _id: id,
      receiver: req.user._id,
    });

    if (!request) {
      return res.status(404).json({
        message: "Request not found.",
      });
    }

    if (request.status !== "pending") {
      return res.status(400).json({
        message: "This request has already been handled.",
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Request ${status} successfully.`,
      request,
    });
  } catch (error) {
    console.error("Respond to request error:", error);

    res.status(500).json({
      message: "Unable to update request. Please try again.",
    });
  }
};

module.exports = {
  sendRequest,
  getReceivedRequests,
  getSentRequests,
  respondToRequest,
};
