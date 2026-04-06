require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

// API Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const organizerRoutes = require("./routes/organizer");
const scanRoutes = require("./routes/scan");
const contactRoutes = require("./routes/contact");

const app = express();

// --------------------
// Middlewares
// --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Database Middleware
// --------------------
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).json({ success: false, message: "Database connection error" });
  }
});

// --------------------
// API Routes
// --------------------
app.use("/api", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/scan", scanRoutes);
app.use("/api/contact", contactRoutes);

// --------------------
// 404 Fallback for APIs
// --------------------
app.use("/api", (req, res) => {
    res.status(404).json({ success: false, message: "API route not found" });
});

// --------------------
// Start Server / Export for Vercel
// --------------------
if (process.env.NODE_ENV !== 'production') {
  app.listen(5000, "0.0.0.0", () => {
    console.log("✅ Server running on port 5000");
  });
}

// Vercel needs this export to run your Express app
module.exports = app;