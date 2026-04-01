require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");

// API Routes
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const bookingRoutes = require("./routes/bookings");
const organizerRoutes = require("./routes/organizer");
const scanRoutes = require("./routes/scan");

const app = express();

// --------------------
// Database Middleware (Updated for Vercel)
// --------------------
// Ensure DB is connected before any route is processed
app.use(async (req, res, next) => {
  try {
    await connectDB(); 
    next();
  } catch (err) {
    console.error("Database connection failed in middleware:", err);
    res.status(500).json({ error: "Database connection error" });
  }
});

// --------------------
// Middlewares
// --------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --------------------
// Static Files
// --------------------
app.use(express.static(path.join(__dirname, "../frontend")));
app.use(express.static(path.join(__dirname, "../landing-page")));

// --------------------
// API Routes
// --------------------
app.use("/api", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/organizer", organizerRoutes);
app.use("/api/scan", scanRoutes);

// --------------------
// Page Routes
// --------------------
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../landing-page/index.html"))
);

app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/login/login.html"))
);

app.get("/signup", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/signup/signup.html"))
);

app.get("/events", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/events/events.html"))
);

app.get("/mypasses", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/mypasses/mypasses.html"))
);

app.get("/ticket", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/ticket/ticket.html"))
);

// --------------------
// Admin Pages
// --------------------
app.get("/admin/login", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/admin/login.html"))
);

app.get("/admin/dashboard", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/admin/dashboard.html"))
);

app.get("/admin/scan", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/admin/scan.html"))
);

app.get("/create-event", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/admin/create-event.html"))
);

// --------------------
// Legal / Footer Pages
// --------------------
app.get("/contact", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/contact/contact.html"))
);

app.get("/terms", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/legal/terms.html"))
);

app.get("/privacy", (req, res) =>
  res.sendFile(path.join(__dirname, "../frontend/legal/privacy.html"))
);

// --------------------
// 404 Fallback
// --------------------
app.use((req, res) =>
  res.status(404).sendFile(path.join(__dirname, "../frontend/404.html"))
);

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