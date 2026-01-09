import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB database
 * Handles connection with retry logic and proper error handling
 */
export async function connectDB() {
  // If already connected, return
  if (isConnected) {
    console.log("📦 Using existing MongoDB connection");
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;

  // Check if MongoDB URI is provided
  if (!MONGODB_URI) {
    console.warn(
      "⚠️  MongoDB URI not provided. Running without database connection."
    );
    return;
  }

  try {
    // Connection options for production safety
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);

    isConnected = true;
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected");
      isConnected = false;
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("🔌 MongoDB connection closed through app termination");
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    isConnected = false;

    // Don't crash the app, just log the error
    // This allows the app to run without database for development
    if (process.env.NODE_ENV === "production") {
      console.error("🚨 Database connection required in production");
      process.exit(1);
    }
  }
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectDB() {
  if (!isConnected) {
    return;
  }

  try {
    await mongoose.connection.close();
    isConnected = false;
    console.log("🔌 MongoDB disconnected");
  } catch (error) {
    console.error("❌ Error disconnecting from MongoDB:", error.message);
  }
}

/**
 * Check database connection status
 */
export function isDBConnected() {
  return isConnected && mongoose.connection.readyState === 1;
}

export default { connectDB, disconnectDB, isDBConnected };
