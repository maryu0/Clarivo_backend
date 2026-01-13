import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import apiRoutes from "./routes/index.js";
import { connectDB, isDBConnected } from "./config/database.js";

// Load environment variables
dotenv.config();

// Connect to MongoDB
await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Middleware
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Request logging
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" })); // Parse JSON bodies with 50mb limit for audio
app.use(express.urlencoded({ extended: true, limit: "50mb" })); // Parse URL-encoded bodies

// Health check route
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    database: isDBConnected() ? "connected" : "disconnected",
  });
});

// API routes
app.use("/api", apiRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Clarivo API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.url} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Clarivo API server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Frontend URL: ${FRONTEND_URL}`);
  console.log(`✅ Health check: http://localhost:${PORT}/health`);
});

export default app;
