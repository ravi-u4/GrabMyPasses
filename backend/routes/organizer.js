// backend/routes/organizer.js
const express = require("express");
const router = express.Router();
const Organizer = require("../models/Organizer");

// ORGANIZER SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.password) {
      return res.json({ success: false, message: "Missing email or password" });
    }

    const exists = await Organizer.findOne({ email: data.email });
    if (exists) {
      return res.json({ success: false, message: "Organizer already exists" });
    }

    const organizer = await Organizer.create(data);
    return res.json({
      success: true,
      message: "Organizer created successfully",
      organizer: {
        _id: organizer._id,
        name: organizer.name,
        email: organizer.email,
        college: organizer.college
      }
    });
  } catch (err) {
    console.log("ORGANIZER SIGNUP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// ORGANIZER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const organizer = await Organizer.findOne({ email });
    if (!organizer) {
      return res.json({ success: false, message: "Organizer not found" });
    }

    if (password !== organizer.password) {
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

// GET ORGANIZER PROFILE
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

// UPDATE ORGANIZER PROFILE
router.put("/:id", async (req, res) => {
  try {
    // Destructure all possible fields
    const { name, college, mobile, password, rollNo, gender, dob, course } = req.body;
    
    // Create update object
    const updateData = { name, college, mobile, rollNo, gender, dob, course };
    
    // Only update password if provided and not empty
    if (password && password.trim() !== "") {
        updateData.password = password;
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

// DELETE ORGANIZER
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