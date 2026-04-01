const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  name: String,
  college: String,
  mobile: String,
  email: String,
  password: String,
  
  // --- ADD THESE LINES TO FETCH YOUR DATA ---
  rollNo: String,
  gender: String,
  dob: Date,
  course: String,
  // ------------------------------------------
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Organizer", organizerSchema);