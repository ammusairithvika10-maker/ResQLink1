
const express = require("express");
const EmergencyRequest = require("../models/EmergencyRequest");
const { protect, allowRoles } = require("../middleware/auth");

const router = express.Router();

// Create emergency request
router.post("/", protect, async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      quantity,
      location,
      phone,
      priority,
    } = req.body;

    const request = await EmergencyRequest.create({
      requester: req.user._id,
      title,
      category,
      description,
      quantity,
      location,
      phone,
      priority: priority || "Normal",
    });

    res.status(201).json({
      message: "Emergency request created successfully",
      request,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message || "Could not create request",
    });
  }
});

// View requests
router.get("/", protect, async (req, res) => {
  try {
    const filter =
      req.user.role === "requester"
        ? { requester: req.user._id }
        : {};

    const requests = await EmergencyRequest.find(filter)
      .populate("requester", "name email")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({
      message: "Could not load requests",
    });
  }
});

// Provider accepts a pending request
router.patch(
  "/:id/accept",
  protect,
  allowRoles("provider"),
  async (req, res) => {
    try {
      const request = await EmergencyRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          status: "Pending",
        },
        {
          $set: {
            status: "Accepted",
            assignedProvider: req.user._id,
          },
        },
        { new: true, runValidators: true }
      );

      if (!request) {
        return res.status(404).json({
          message: "Request not found or already accepted",
        });
      }

      res.json({
        message: "Request accepted",
        request,
      });
    } catch (error) {
      res.status(400).json({
        message: "Invalid request ID",
      });
    }
  }
);

// Provider completes their assigned request
router.patch(
  "/:id/complete",
  protect,
  allowRoles("provider"),
  async (req, res) => {
    try {
      const request = await EmergencyRequest.findOneAndUpdate(
        {
          _id: req.params.id,
          assignedProvider: req.user._id,
          status: "Accepted",
        },
        { $set: { status: "Completed" } },
        { new: true }
      );

      if (!request) {
        return res.status(404).json({
          message: "Assigned request not found",
        });
      }

      res.json({
        message: "Request completed",
        request,
      });
    } catch (error) {
      res.status(400).json({
        message: "Invalid request ID",
      });
    }
  }
);

module.exports = router;
