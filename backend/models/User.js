const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  college: String,
  mobile: String,
  email: { type: String, unique: true }, // Ensure email is unique
  roll: String,
  course: String,
  semester: String,
  dob: String,
  gender: String,
  password: String,
  // ✅ NEW FIELDS FOR OTP
  isVerified: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date
});

module.exports = mongoose.model("User", UserSchema);