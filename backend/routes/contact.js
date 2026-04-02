/* backend/routes/contact.js */
const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// POST: Save a new contact message
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, query } = req.body;

    if (!name || !email || !phone || !query) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    await Contact.create({ name, email, phone, query });

    return res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.error("Contact Form Error:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET: Fetch all messages 
router.get("/", async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    return res.json({ success: true, messages });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;