// db.js
const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, 
      // Add these for better serverless stability
      bufferCommands: false, // Optional: Fails fast instead of buffering
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ Database Connection Error:", error.message);
    throw error; // Rethrow so the middleware knows it failed
  }
}

module.exports = connectDB;