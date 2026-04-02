/* backend/routes/auth.js */
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/Booking");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcrypt"); // ADDED BCRYPT

/* =========================================================
   1. SIGNUP (Create account + Send OTP)
   ========================================================= */
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;

    if (!data.email || !data.password) {
      return res.json({ success: false, message: "Missing required fields" });
    }

    let user = await User.findOne({ email: data.email });

    if (user && user.isVerified) {
      return res.json({ success: false, message: "Email already registered" });
    }

    // Hash the password securely
    data.password = await bcrypt.hash(data.password, 10);

    if (user) {
      Object.assign(user, data);
    } else {
      user = new User(data);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min
    user.isVerified = false;

    await user.save();

    await sendEmail(
      user.email,
      "Verify Your Account - GrabMyPasses",
      `Your OTP is ${otp}. It expires in 10 minutes.`
    );

    return res.json({
      success: true,
      message: "OTP sent to email. Please verify.",
      email: user.email
    });

  } catch (err) {
    console.log("SIGNUP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

/* =========================================================
   2. VERIFY OTP
   ========================================================= */
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Missing email or OTP" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (user.isVerified) {
      return res.json({ success: true, message: "User already verified" });
    }

    if (user.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.json({ success: false, message: "OTP expired. Please signup again." });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Verification successful",
      user: { name: user.name, email: user.email, college: user.college }
    });

  } catch (err) {
    console.log("VERIFY OTP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

/* =========================================================
   3. LOGIN (Only Verified Users)
   ========================================================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({ success: false, message: "Missing email or password" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    if (!user.isVerified) {
      return res.json({ success: false, message: "Account not verified" });
    }

    // Compare Hash (with fallback for old plain-text test accounts)
    let isMatch = false;
    if (user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, user.password);
    } else {
        isMatch = (password === user.password);
    }

    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: { name: user.name, email: user.email, college: user.college }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

/* =========================================================
   4. GET USER PROFILE
   ========================================================= */
router.get("/profile", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ success: false, message: "Missing email" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    return res.json({ success: true, user });
  } catch (err) {
    console.log("PROFILE ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

/* =========================================================
   5. DELETE ACCOUNT + BOOKINGS
   ========================================================= */
router.delete("/profile", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Missing email" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    await Booking.deleteMany({ user: user._id });
    await User.findByIdAndDelete(user._id);

    return res.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

module.exports = router;