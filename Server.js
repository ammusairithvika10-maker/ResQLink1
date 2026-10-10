require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const resourceRoutes = require("./routes/resources");
const authRoutes = require("./routes/auth");
const emergencyRequestRoutes = require("./routes/emergencyRequests");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/resources", resourceRoutes);
app.use("/api/emergency-requests", emergencyRequestRoutes);

app.get("/", (req, res) => {
  res.json({ message: "ResQLink API is running!" });
});


const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });