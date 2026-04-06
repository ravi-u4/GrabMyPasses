/* backend/routes/superadmin.js */
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Organizer = require("../models/Organizer");
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const Contact = require("../models/Contact");

// Security Middleware
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
    return res.json({ success: true, token: password });
  }
  return res.json({ success: false, message: "Access Denied." });
});

// 2. FETCH EVERYTHING
router.get("/all-data", verifyGodMode, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    const organizers = await Organizer.find().select("-password").sort({ createdAt: -1 }).lean();
    const events = await Event.find().populate("organizer", "name email mobile").sort({ createdAt: -1 }).lean();
    const bookings = await Booking.find()
      .populate("user", "name email mobile college")
      .populate("event", "title date price")
      .sort({ createdAt: -1 }).lean();
    const messages = await Contact.find().sort({ createdAt: -1 }).lean();

    // Calculate absolute stats
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);

    return res.json({ 
        success: true, 
        data: { users, organizers, events, bookings, messages, stats: { totalRevenue } } 
    });
  } catch (err) {
    console.log("SUPER ADMIN FETCH ERROR:", err);
    return res.json({ success: false, message: "Failed to fetch data." });
  }
});

// 3. TOGGLE BOOKING STATUS (CONFIRMED <-> CHECKED_IN <-> CANCELLED)
router.put("/booking-status/:id", verifyGodMode, async (req, res) => {
  try {
    const { status } = req.body; // Pass the desired status
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.json({ success: false, message: "Booking not found" });
    
    booking.status = status;
    if (status === "CHECKED_IN") booking.checkedInAt = new Date();
    await booking.save();
    
    return res.json({ success: true, message: `Booking updated to ${status}` });
  } catch (err) {
    return res.json({ success: false, message: "Update failed." });
  }
});

// 4. EDIT EVENT DETAILS
router.put("/edit-event/:id", verifyGodMode, async (req, res) => {
    try {
      const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!event) return res.json({ success: false, message: "Event not found" });
      return res.json({ success: true, message: "Event updated successfully", event });
    } catch (err) {
      return res.json({ success: false, message: "Event update failed." });
    }
});

// 5. UPDATE CONTACT STATUS (Mark as Read)
router.put("/contact-status/:id", verifyGodMode, async (req, res) => {
    try {
        const msg = await Contact.findById(req.params.id);
        msg.status = msg.status === "Unread" ? "Read" : "Unread";
        await msg.save();
        return res.json({ success: true, message: `Message marked as ${msg.status}` });
    } catch (err) {
        return res.json({ success: false, message: "Status update failed." });
    }
});

// 6. UNIVERSAL DELETE
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
    return res.json({ success: false, message: "Deletion failed." });
  }
});

// 7. TOGGLE VERIFICATION STATUS (God Power to bypass OTP)
router.put("/toggle-verify/:type/:id", verifyGodMode, async (req, res) => {
  try {
    const { type, id } = req.params;
    let account;

    if (type === "user") account = await User.findById(id);
    else if (type === "organizer") account = await Organizer.findById(id);
    else return res.json({ success: false, message: "Invalid account type" });

    if (!account) return res.json({ success: false, message: "Account not found" });

    account.isVerified = !account.isVerified; // Flip the status (true to false, false to true)
    await account.save();

    return res.json({ 
        success: true, 
        message: `${type.toUpperCase()} marked as ${account.isVerified ? 'Verified' : 'Unverified'}` 
    });
  } catch (err) {
    console.log("SUPER ADMIN VERIFY ERROR:", err);
    return res.json({ success: false, message: "Update failed." });
  }
});

module.exports = router;