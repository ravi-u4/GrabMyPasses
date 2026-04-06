/* backend/routes/organizer.js */
const express = require("express");
const router = express.Router();
const Organizer = require("../models/Organizer");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail"); // Added for OTP emails

// 1. ORGANIZER SIGNUP (Create account + Send OTP)
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.password) {
      return res.json({ success: false, message: "Missing email or password" });
    }

    let organizer = await Organizer.findOne({ email: data.email });

    if (organizer && organizer.isVerified) {
      return res.json({ success: false, message: "Organizer already exists and is verified" });
    }

    // Hash the password securely
    data.password = await bcrypt.hash(data.password, 10);

    if (organizer) {
      Object.assign(organizer, data);
    } else {
      organizer = new Organizer(data);
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    organizer.otp = otp;
    organizer.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    organizer.isVerified = false;

    await organizer.save();

    await sendEmail(
      organizer.email,
      "Verify Your Organizer Account - GrabMyPasses",
      `Your OTP is ${otp}. It expires in 10 minutes.`
    );

    return res.json({
      success: true,
      message: "OTP sent to email. Please verify.",
      email: organizer.email
    });
  } catch (err) {
    console.log("ORGANIZER SIGNUP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// 2. VERIFY ORGANIZER OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.json({ success: false, message: "Missing email or OTP" });
    }

    const organizer = await Organizer.findOne({ email });
    if (!organizer) return res.json({ success: false, message: "Organizer not found" });

    if (organizer.isVerified) {
      return res.json({ success: true, message: "Organizer already verified" });
    }

    if (organizer.otp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (organizer.otpExpires < Date.now()) {
      return res.json({ success: false, message: "OTP expired. Please signup again." });
    }

    organizer.isVerified = true;
    organizer.otp = undefined;
    organizer.otpExpires = undefined;
    await organizer.save();

    return res.json({
      success: true,
      message: "Verification successful",
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        college: organizer.college
      }
    });
  } catch (err) {
    console.log("VERIFY ORGANIZER OTP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// 3. ORGANIZER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    // Check if verified
    if (!organizer.isVerified) {
      return res.json({ success: false, message: "Account not verified. Please sign up again to get an OTP." });
    }

    // Compare Hash
    let isMatch = false;
    if (organizer.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(password, organizer.password);
    } else {
        isMatch = (password === organizer.password);
    }

    if (!isMatch) {
      return res.json({ success: false, message: "Wrong password" });
    }

    return res.json({
      success: true,
      message: "Login successful",
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        college: organizer.college
      }
    });
  } catch (err) {
    console.log("ORGANIZER LOGIN ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// 4. GET ORGANIZER PROFILE
router.get("/:id", async (req, res) => {
  try {
    const organizer = await Organizer.findById(req.params.id).select("-password");
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }
    return res.json({ success: true, organizer });
  } catch (err) {
    console.log("GET ORGANIZER ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// 5. UPDATE ORGANIZER PROFILE
router.put("/:id", async (req, res) => {
  try {
    const { name, college, mobile, password, rollNo, gender, dob, course } = req.body;
    
    const updateData = { name, college, mobile, rollNo, gender, dob, course };
    
    // Only update and hash password if provided and not empty
    if (password && password.trim() !== "") {
        updateData.password = await bcrypt.hash(password, 10);
    }

    const organizer = await Organizer.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    return res.json({ success: true, message: "Profile updated", organizer });
  } catch (err) {
    console.log("UPDATE ORGANIZER ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// 6. DELETE ORGANIZER
router.delete("/:id", async (req, res) => {
  try {
    const organizer = await Organizer.findByIdAndDelete(req.params.id);
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }
    return res.json({ success: true, message: "Organizer deleted successfully" });
  } catch (err) {
    console.log("DELETE ORGANIZER ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

module.exports = router;