const mongoose = require("mongoose");

let isConnected = false; 

const connectDB = async () => {
  
  if (isConnected) {
    return;
  }

  // Double check mongoose's internal state
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10, 
      bufferCommands: false, 
    });
    
    isConnected = db.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    throw error;
  }
};

module.exports = connectDB;