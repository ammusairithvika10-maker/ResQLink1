const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Water", "Medicine", "Blood", "Shelter", "Rescue", "Other"]
    },
    quantity: { type: Number, required: true, min: 0 },
    location: { type: String, required: true },
    owner: { type: String, required: true },
    phone: { type: String, required: true },
    available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);