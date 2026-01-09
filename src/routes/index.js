import express from "express";
import sessionRoutes from "./sessions.js";
import speechRoutes from "./speech.js";
import userRoutes from "./users.js";

const router = express.Router();

// Mount route modules
router.use("/sessions", sessionRoutes);
router.use("/speech", speechRoutes);
router.use("/users", userRoutes);

// API info route
router.get("/", (req, res) => {
  res.json({
    message: "Clarivo API v1",
    availableRoutes: [
      "GET /api/users - Get all users",
      "POST /api/users - Create a new user",
      "GET /api/users/:id - Get user by ID",
      "PUT /api/users/:id - Update user",
      "DELETE /api/users/:id - Delete user",
      "GET /api/sessions - Get all sessions",
      "POST /api/sessions - Create a new session",
      "GET /api/sessions/:id - Get session by ID",
      "POST /api/speech/analyze - Analyze speech (placeholder for Azure integration)",
    ],
  });
});

export default router;
