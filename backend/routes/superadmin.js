/* backend/routes/superadmin.js */
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organizer = require("../models/Organizer");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");

// Security Middleware: Protects God routes from unauthorized API calls
const verifyGodMode = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === process.env.SUPER_ADMIN_PASSWORD) {
    return next();
  }
  return res.status(403).json({ success: false, message: "Unauthorized God Access" });
};

// 1. GOD LOGIN
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.SUPER_ADMIN_EMAIL && password === process.env.SUPER_ADMIN_PASSWORD) {
    // We send back the password to use as a secure token for future requests
    return res.json({ success: true, token: password });
  }
  return res.json({ success: false, message: "Access Denied." });
});

// 2. FETCH EVERYTHING (Optimized for Vercel using .lean() to save memory)
router.get("/all-data", verifyGodMode, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    const organizers = await Organizer.find().select("-password").sort({ createdAt: -1 }).lean();
    const events = await Event.find().populate("organizer", "name email").sort({ createdAt: -1 }).lean();
    const bookings = await Booking.find()
      .populate("user", "name email")
      .populate("event", "title date")
      .sort({ createdAt: -1 }).lean();
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();

    return res.json({ success: true, data: { users, organizers, events, bookings, messages } });
  } catch (err) {
    console.log("SUPER ADMIN FETCH ERROR:", err);
    return res.json({ success: false, message: "Failed to fetch data." });
  }
});

// 3. TOGGLE TICKET SCAN STATUS (Absolute Power)
router.put("/toggle-scan/:id", verifyGodMode, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.json({ success: false, message: "Booking not found" });
    
    booking.scanned = !booking.scanned; // Flip the status
    await booking.save();
    
    return res.json({ success: true, message: `Ticket marked as ${booking.scanned ? 'Scanned' : 'Unscanned'}` });
  } catch (err) {
    console.log("SUPER ADMIN SCAN ERROR:", err);
    return res.json({ success: false, message: "Update failed." });
  }
});

// 4. UNIVERSAL DELETE
router.delete("/delete/:type/:id", verifyGodMode, async (req, res) => {
  try {
    const { type, id } = req.params;

    if (type === "user") await User.findByIdAndDelete(id);
    else if (type === "organizer") await Organizer.findByIdAndDelete(id);
    else if (type === "event") await Event.findByIdAndDelete(id);
    else if (type === "booking") await Booking.findByIdAndDelete(id);
    else if (type === "message") await Contact.findByIdAndDelete(id);
    else return res.json({ success: false, message: "Invalid type" });

    return res.json({ success: true, message: `${type} deleted permanently.` });
  } catch (err) {
    console.log("SUPER ADMIN DELETE ERROR:", err);
    return res.json({ success: false, message: "Deletion failed." });
  }
});

module.exports = router;