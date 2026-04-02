// backend/models/Booking.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  event: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "CONFIRMED" }, // CONFIRMED, CHECKED_IN, CANCELLED
  checkedInAt: { type: Date }, 
  qrCodeData: String,
  qrImage: String,
  amountPaid: { type: Number, default: 0 } // Locks in the price at the time of booking
});

module.exports = mongoose.model("Booking", bookingSchema);