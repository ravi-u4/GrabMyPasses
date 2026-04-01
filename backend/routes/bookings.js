/* backend/routes/bookings.js */
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Event = require("../models/Event");
const sendEmail = require("../utils/sendEmail"); 

router.post("/", async (req, res) => {
  try {
    const { email, eventId, forceRebook } = req.body;
    if (!email || !eventId) return res.json({ success: false, message: "Missing data" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const event = await Event.findById(eventId);
    if (!event) return res.json({ success: false, message: "Event not found" });

    // ✅ CHECK IF BOOKINGS ARE PAUSED
    if (event.isBookingPaused) {
        return res.json({ success: false, message: "Bookings for this event are currently paused by the organizer." });
    }

    // ✅ CHECK FOR EXISTING BOOKINGS & CANCELLATIONS
    const userBookings = await Booking.find({ user: user._id, event: event._id });
    const cancelCount = userBookings.filter(b => b.status === "CANCELLED").length;
    const activeBooking = userBookings.find(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN");

    if (activeBooking) {
        if (!forceRebook) {
            return res.json({
                success: false,
                code: "ALREADY_BOOKED",
                existingBookingId: activeBooking._id,
                message: "You have already registered for this event."
            });
        } else {
            if (cancelCount >= 3) {
                return res.json({ success: false, code: "MAX_REBOOK_LIMIT", message: "Maximum rebooking limit (3 times) reached for this event." });
            }
            activeBooking.status = "CANCELLED";
            await activeBooking.save();
        }
    } else {
        if (cancelCount >= 3) {
            return res.json({ success: false, code: "MAX_REBOOK_LIMIT", message: "Maximum rebooking limit (3 times) reached for this event." });
        }
    }

    const currentPrice = event.isPaid ? (event.price || 0) : 0;
    
    let booking = await Booking.create({ 
        user: user._id, 
        event: event._id, 
        status: "CONFIRMED",
        amountPaid: currentPrice
    });

    const qrData = `BOOKING:${booking._id}`;
    const qrImage = await QRCode.toDataURL(qrData); 

    booking.qrCodeData = qrData;
    booking.qrImage = qrImage;
    await booking.save();

    // EMAIL SENDING
    try {
        const fullId = booking._id.toString();
        const shortId = fullId.substring(fullId.length - 8).toUpperCase();

        const emailSubject = `Booking Confirmed: ${event.title} (#${shortId})`;
        const eventDate = new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const emailHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
            <h2 style="color: #6d28d9; text-align: center; margin-bottom: 5px;">Booking Confirmed! ✅</h2>
            <div style="text-align: center; background-color: #f3f4f6; padding: 10px; border-radius: 8px; margin: 15px 0;">
                <span style="font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Booking ID</span><br>
                <strong style="font-size: 24px; color: #111827; letter-spacing: 2px;">${shortId}</strong>
            </div>
            <p style="font-size: 16px; color: #333;">Hi <strong>${user.name || "there"}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Your spot for <strong>${event.title}</strong> has been secured.</p>
            <div style="background: #f9fafb; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 5px solid #6d28d9;">
              <p style="margin: 5px 0;"><strong>🏢 Organized By:</strong> ${event.organizedBy || event.college || "Organizer"}</p>
              <p style="margin: 5px 0;"><strong>📍 Venue:</strong> ${event.venue || "To be announced"}</p>
              <p style="margin: 5px 0;"><strong>📅 Date:</strong> ${eventDate}</p>
              <p style="margin: 5px 0;"><strong>⏰ Time:</strong> ${event.startTime} - ${event.endTime}</p>
              <p style="margin: 5px 0;"><strong>💰 Payment:</strong> ${currentPrice > 0 ? "₹" + currentPrice : "Free"}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <p style="font-weight: bold; margin-bottom: 10px; color: #333;">Scan this QR Code at the entrance:</p>
              <img src="cid:unique@qrcode" alt="Entry QR Code" style="width: 200px; height: 200px; border: 2px solid #eee; padding: 10px; border-radius: 8px;" />
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
            <p style="text-align: center; color: #9ca3af; font-size: 12px;">Present this email or QR code at entry.<br>&copy; 2025 GrabMyPasses. All rights reserved.</p>
          </div>
        `;

        await sendEmail(email, emailSubject, `Your booking for ${event.title} is confirmed. Booking ID: ${shortId}.`, emailHtml, [ { filename: 'qrcode.png', path: qrImage, cid: 'unique@qrcode' } ]);
    } catch (emailErr) {
        console.error("⚠️ Email sending failed:", emailErr);
    }

    return res.json({ success: true, message: "Booking successful", bookingId: booking._id });

  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const { email } = req.query;
    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    let bookings = await Booking.find({ user: user._id }).populate("event").sort({ createdAt: -1 });
    bookings = bookings.filter(b => b.event !== null);
    return res.json({ success: true, bookings });
  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

router.get("/event/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.json({ success: false, message: "Event not found" });

    const bookings = await Booking.find({ event: eventId })
      .populate("user", "name email roll course semester mobile")
      .sort({ createdAt: -1 });

    const activeCount = bookings.filter(b => b.status === "CONFIRMED" || b.status === "CHECKED_IN").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amountPaid !== undefined ? b.amountPaid : (event.price || 0)), 0);

    return res.json({ success: true, bookings, eventStats: { title: event.title, price: event.price || 0, revenue: totalRevenue, count: activeCount } });
  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

router.post("/:id/checkin", async (req, res) => {
  try {
    const { id, force } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.json({ success: false, message: "Booking not found" });
    if (booking.status === "CANCELLED") return res.json({ success: false, message: "This booking has been cancelled." });
    if (booking.status === "CHECKED_IN" && !force) return res.json({ success: false, code: "ALREADY_CHECKED_IN", message: "User already checked in!", checkedInAt: booking.checkedInAt });

    booking.status = "CHECKED_IN";
    booking.checkedInAt = new Date();
    await booking.save();

    return res.json({ success: true, message: "Entry Approved", checkedInAt: booking.checkedInAt });
  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    let searchId = req.params.id.trim();
    if (searchId.startsWith("BOOKING:")) searchId = searchId.replace("BOOKING:", "");

    let booking;
    if (mongoose.Types.ObjectId.isValid(searchId)) booking = await Booking.findById(searchId).populate("event").populate("user");
    if (!booking) {
      const allBookings = await Booking.find().populate("event").populate("user");
      booking = allBookings.find(b => String(b._id).toUpperCase().endsWith(searchId.toUpperCase()));
    }
    if (!booking) return res.json({ success: false, message: "Booking not found" });
    return res.json({ success: true, booking });
  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

router.post('/scan', async (req, res) => {
  try {
    let { bookingId, organizerId } = req.body; 
    if (!bookingId || !organizerId) return res.status(400).json({ success: false, message: "Missing Data" });

    bookingId = bookingId.trim();
    if (bookingId.startsWith("BOOKING:")) bookingId = bookingId.replace("BOOKING:", "");

    const booking = await Booking.findById(bookingId).populate("event user");
    if (!booking) return res.status(404).json({ success: false, message: "❌ Invalid Ticket ID" });

    if (!booking.event.organizer || booking.event.organizer.toString() !== organizerId) {
      return res.status(403).json({ success: false, message: "⛔ Access Denied" });
    }

    if (booking.status === "CANCELLED") return res.status(400).json({ success: false, message: "🚫 Ticket Cancelled" });
    if (booking.status === 'scanned' || booking.status === 'CHECKED_IN') {
      return res.status(400).json({ success: false, message: "⚠️ Already Used", details: { user: booking.user?.name || "Guest", scannedAt: booking.scannedAt } });
    }

    booking.status = 'CHECKED_IN';
    booking.checkedInAt = new Date();
    await booking.save();

    return res.json({ success: true, message: "✅ Access Granted", booking: { user: booking.user?.name || "Guest", event: booking.event?.title, type: booking.type } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;