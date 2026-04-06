const mongoose = require("mongoose");

const organizerSchema = new mongoose.Schema({
  name: String,
  college: String,
  mobile: String,
  email: { type: String, unique: true },
  password: String,
  
  //FETCH DATA 
  rollNo: String,
  gender: String,
  dob: Date,
  course: String,
  // ------------------------------------------
  // NEW FIELDS FOR OTP
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Organizer", organizerSchema);