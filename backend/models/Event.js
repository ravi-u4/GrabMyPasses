/* backend/models/Event.js */
const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "Organizer" }, 
  title: String,
  description: String,
  college: String, 
  organizedBy: String, 
  organizerDetails: String, 
  category: String,
  venue: String,
  locationDetails: String, 
  date: Date,
  startTime: String,
  endTime: String, 
  isPaid: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  bannerUrl: String,
  maxCapacity: Number,
  participationType: { type: String, enum: ['Solo', 'Team'], default: 'Solo' },
  teamSize: { type: Number, default: 1 }, 
  bookingStartTime: { type: Date, default: Date.now },
  isBookingPaused: { type: Boolean, default: false }, 
  contacts: [{ 
    name: String, 
    number: String 
  }],
  socialLinks: {
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    x: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Event", eventSchema);