const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log("✅ Using existing MongoDB connection");
    return;
  }

  // DIAGNOSTIC LOG: This will tell us if Vercel actually has your URI
  if (!process.env.MONGO_URI) {
    console.log("❌ FATAL ERROR: MONGO_URI is UNDEFINED on Vercel!");
  } else {
    console.log("🔍 MONGO_URI is loaded. Starts with:", process.env.MONGO_URI.substring(0, 15) + "...");
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000, // Fail after 5s instead of 10s
    });
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.log("❌ Database Connection Error:", error.message);
  }
}

module.exports = connectDB;