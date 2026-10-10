
const mongoose = require("mongoose");

const emergencyRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    category: {
      type: String,
      enum: ["Food", "Water", "Medicine", "Blood", "Shelter", "Rescue", "Other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "High", "Critical"],
      default: "Normal",
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Completed", "Cancelled"],
      default: "Pending",
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);
