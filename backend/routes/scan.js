const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const organizerAuth = require("../middleware/organizerAuth");

router.post("/", organizerAuth, async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID is required"
      });
    }

    const booking = await Booking.findById(bookingId)
      .populate("event user");

    if (!booking || !booking.event) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found"
      });
    }

    // ✅ STEP 6: Organizer Ownership Check
    if (String(booking.event.organizerId) !== String(req.organizer._id)) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: This ticket does not belong to your event"
      });
    }

    if (booking.status === "scanned") {
      return res.status(400).json({
        success: false,
        message: "Already Used",
        details: {
          user: booking.user?.name,
          scannedAt: booking.scannedAt
        }
      });
    }

    booking.status = "scanned";
    booking.scannedAt = new Date();
    await booking.save();

    return res.json({
      success: true,
      booking: {
        user: booking.user?.name,
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
