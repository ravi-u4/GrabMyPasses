// backend/routes/events.js
const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const Booking = require("../models/Booking");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Cloudinary Integrations
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Setup Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 1. Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Setup Cloudinary Storage for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "grabmypasses_events", 
    allowed_formats: ["jpg", "png", "jpeg", "webp"], 
    transformation: [{ width: 800, height: 600, crop: "limit" }] // Activated: Saves bandwidth and loads faster
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Max size 2MB 
});

// ==========================================
// Vercel Edge Caching Middleware
// ==========================================
const cacheMiddleware = (req, res, next) => {
    // s-maxage=60: Cache at the Vercel edge for 60 seconds
    res.setHeader(
        'Cache-Control',
        'public, s-maxage=60, stale-while-revalidate=120'
    );
    next();
};

// GET all events (CACHED, PAGINATED, LEAN, FILTERED)
router.get("/", cacheMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip = (page - 1) * limit;

    // 1. Base query: Only show events happening today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let query = { date: { $gte: today } };

    // 2. Category Filter
    if (req.query.category && req.query.category !== 'All') {
        query.category = req.query.category;
    }

    // 3. Search Filter (Matches title, college, or venue)
    if (req.query.search) {
        const searchRegex = new RegExp(req.query.search, 'i');
        query.$or = [
            { title: searchRegex },
            { college: searchRegex },
            { venue: searchRegex }
        ];
    }

    // 4. Fetch paginated events
    const events = await Event.find(query)
        .sort({ date: 1 })
        .skip(skip)
        .limit(limit)
        .lean(); 

    // 5. Count totals for pagination UI
    const totalEvents = await Event.countDocuments(query);
    const totalPages = Math.ceil(totalEvents / limit);

    // 6. Get all unique categories from upcoming events to build the frontend buttons
    const distinctCategories = await Event.distinct("category", { date: { $gte: today } });

    return res.json({ 
        success: true, 
        events,
        categories: ['All', ...distinctCategories.filter(Boolean)],
        pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalEvents: totalEvents,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Server Error" });
  }
});

// ===============================================================
//  PREVENT ROUTE SHADOWING
// ===============================================================
// GET Organizer's events (Dashboard) - (NOT CACHED, LEAN)
router.get("/my-events", async (req, res) => {
  try {
    const { organizerId } = req.query;
    if (!organizerId) return res.json({ success: false, message: "Missing organizer ID" });

    const events = await Event.find({ organizer: organizerId })
        .sort({ date: 1 })
        .lean(); 

    let totalTickets = 0;
    let totalRevenue = 0;

    const eventsWithStats = await Promise.all(
      events.map(async (event) => {
        const eventBookings = await Booking.find({ event: event._id }).lean();
        
        const activeBookings = eventBookings.filter(b => {
            const status = (b.status || "").toUpperCase();
            return status === "CONFIRMED" || status === "CHECKED_IN" || status === "SCANNED";
        });
        const ticketCount = activeBookings.length;
        
        const revenue = eventBookings.reduce((sum, b) => sum + (b.amountPaid !== undefined ? b.amountPaid : (event.price || 0)), 0);

        totalTickets += ticketCount;
        totalRevenue += revenue;

        event.ticketsSold = ticketCount;
        event.eventRevenue = revenue;
        return event;
      })
    );

    return res.json({ success: true, events: eventsWithStats, stats: { totalEvents: events.length, totalTickets, totalRevenue } });
  } catch (err) {
    console.error("My Events Error:", err);
    return res.json({ success: false, message: "Server Error fetching your events" });
  }
});

// GET single event (CACHED, LEAN)
router.get("/:id", cacheMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
        .populate("organizer", "name email")
        .lean(); 

    if (!event) return res.json({ success: false, message: "Event not found" });
    return res.json({ success: true, event });
  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

// POST create event
router.post("/", upload.single("bannerImage"), async (req, res) => {
  try {
    const data = req.body; 
    if (!data.organizerId) return res.json({ success: false, message: "Unauthorized: No organizer ID" });

    if (data.contacts) { try { data.contacts = JSON.parse(data.contacts); } catch (e) { data.contacts = []; } }
    if (data.socialLinks) { try { data.socialLinks = JSON.parse(data.socialLinks); } catch (e) { data.socialLinks = {}; } }

    const eventData = {
      ...data,
      organizer: data.organizerId,
      bannerUrl: req.file ? req.file.path : (data.bannerUrl || ""),
      participationType: data.participationType || 'Solo',
      teamSize: data.participationType === 'Team' ? (data.teamSize || 1) : 1,
      bookingStartTime: data.bookingStartTimeStr ? new Date(data.bookingStartTimeStr) : new Date(),
      socialLinks: data.socialLinks || {}
    };

    const event = await Event.create(eventData);
    return res.json({ success: true, message: "Event created", event });
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes("File size too large")) {
        return res.json({ success: false, message: "File too large. Max size is 2MB." });
    }
    return res.json({ success: false, message: "Server Error" });
  }
});

// PUT update event
router.put("/:id", upload.single("bannerImage"), async (req, res) => {
    try {
        const data = req.body;
        const event = await Event.findById(req.params.id);
        if (!event) return res.json({ success: false, message: "Event not found" });

        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && key !== 'contacts' && key !== 'socialLinks' && key !== 'bookingStartTimeStr') {
                event[key] = data[key];
            }
        });

        event.isPaid = (data.isPaid === 'true' || data.isPaid === true); 
        event.price = event.isPaid ? (data.price || event.price) : 0;
        
        if (data.participationType) {
            event.participationType = data.participationType;
            event.teamSize = event.participationType === 'Team' ? (data.teamSize || event.teamSize) : 1;
        }

        if (data.bookingStartTimeStr) event.bookingStartTime = new Date(data.bookingStartTimeStr);
        if (data.contacts) { try { event.contacts = JSON.parse(data.contacts); } catch (e) {} }
        if (data.socialLinks) { try { event.socialLinks = JSON.parse(data.socialLinks); } catch (e) {} }
        
        if (req.file) event.bannerUrl = req.file.path;

        await event.save();
        return res.json({ success: true, message: "Event updated successfully", event });
    } catch (err) {
        return res.json({ success: false, message: "Server Error" });
    }
});

// toggle pause status
router.patch("/:id/toggle-pause", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.json({ success: false, message: "Event not found" });
        
        event.isBookingPaused = !event.isBookingPaused;
        await event.save();
        
        return res.json({ success: true, isBookingPaused: event.isBookingPaused, message: event.isBookingPaused ? "Bookings paused" : "Bookings resumed" });
    } catch (err) {
        return res.json({ success: false, message: "Server Error" });
    }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    await Booking.deleteMany({ event: req.params.id });
    await Event.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: "Event deleted" });
  } catch (err) {
    return res.json({ success: false, message: "Server Error" });
  }
});

// ==========================================
// POST Generate AI Description
// ==========================================
router.post('/generate-description', async (req, res) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const finalPrompt = `
        You are an expert event copywriter for a college event management platform called "GrabMyPasses".
        Write an engaging, exciting, and professional description for an event based on this user prompt: "${prompt}".
        Make it readable with clear spacing. Keep it between 3 to 6 sentences. Do not use markdown like asterisks (*), bolding, or hashtags, just output plain formatted text.
        `;

        const result = await model.generateContent(finalPrompt);
        const responseText = result.response.text();

        res.json({
            success: true,
            description: responseText.trim()
        });
        
    } catch (error) {
        console.error("AI Generation Error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to generate AI description. Please check your API key and quota." 
        });
    }
});

module.exports = router;