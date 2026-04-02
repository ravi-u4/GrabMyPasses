// backend/routes/admin.js
const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");

//create first admin manually
router.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    if (!data.email || !data.password) {
      return res.json({ success: false, message: "Missing email or password" });
    }

    const exists = await Admin.findOne({ email: data.email });
    if (exists) {
      return res.json({ success: false, message: "Admin already exists" });
    }

    const admin = await Admin.create(data);
    return res.json({
      success: true,
      message: "Admin created",
      admin: {
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.log("ADMIN SIGNUP ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// Admin login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.json({ success: false, message: "Admin not found" });
    }

    if (password !== admin.password) {
      return res.json({ success: false, message: "Wrong password" });
    }

    return res.json({
      success: true,
      message: "Admin login successful",
      admin: {
        name: admin.name,
        email: admin.email
      }
    });
  } catch (err) {
    console.log("ADMIN LOGIN ERROR:", err);
    return res.json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
