const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const organizerAuth = require("../middleware/organizerAuth");

router.post("/", organizerAuth, async (req, res) => {
  try {
    let { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    // 1. Strip the "BOOKING:" prefix if scanned from QR Code
    bookingId = bookingId.trim();
    if (bookingId.startsWith("BOOKING:")) {
      bookingId = bookingId.replace("BOOKING:", "");
    }

    let booking;

    // 2. Handle both full Database IDs and 8-character manual short IDs
    if (mongoose.Types.ObjectId.isValid(bookingId)) {
      booking = await Booking.findById(bookingId).populate("event user");
    } else {
      // Fallback for manual 8-character short ID entry
      const allBookings = await Booking.find().populate("event user");
      booking = allBookings.find(b => 
        String(b._id).toUpperCase().endsWith(bookingId.toUpperCase())
      );
    }

    if (!booking || !booking.event) {
      return res.status(404).json({
        success: false,
        message: "Invalid Ticket ID"
      });
    }

    // 3. Organizer Ownership Check
    const eventOrganizerId = booking.event.organizerId || booking.event.organizer;
    if (String(eventOrganizerId) !== String(req.organizer._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This ticket does not belong to your event"
      });
    }

    // 4. Prevent Double Scanning
    if (booking.status === "scanned" || booking.status === "CHECKED_IN") {
      return res.status(400).json({
        success: false,
        message: "Already Used",
        details: {
          user: booking.user?.name || "Guest",
          scannedAt: booking.scannedAt || booking.checkedInAt
        }
      });
    }

    // 5. Mark as Scanned / Checked In
    booking.status = "scanned";
    booking.scannedAt = new Date();
    booking.checkedInAt = new Date(); // keeping it consistent with bookings.js
    await booking.save();

    return res.json({
      success: true,
      booking: {
        user: booking.user?.name || "Guest",
        event: booking.event?.title
      }
    });
  } catch (err) {
    console.error("SCAN ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

module.exports = router;