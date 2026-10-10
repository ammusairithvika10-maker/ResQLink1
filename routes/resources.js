const express = require("express");
const Resource = require("../models/Resource");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources);
  } catch (error) {
    console.error("GET resources error:", error);
    res.status(500).json({ message: "Failed to fetch resources" });
  }
});

router.post("/", async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json(resource);
  } catch (error) {
    console.error("POST resource error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json(resource);
  } catch (error) {
    console.error("PUT resource error:", error);
    res.status(400).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: "Resource not found" });
    }

    res.json({ message: "Resource deleted successfully" });
  } catch (error) {
    console.error("DELETE resource error:", error);
    res.status(400).json({ message: "Invalid resource ID" });
  }
});

module.exports = router;