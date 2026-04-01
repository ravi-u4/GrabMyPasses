const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/studentAuth");
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.log("❌ Database Error:", error);
  }
}

module.exports = connectDB;
