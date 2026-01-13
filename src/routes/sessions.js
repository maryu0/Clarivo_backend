import express from "express";
import Session from "../models/Session.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

/**
 * GET /api/sessions
 * Get all sessions for the authenticated user
 */
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 50, skip = 0, language } = req.query;

    // Build query
    const query = { userId: req.user._id };
    if (language) {
      query.language = language;
    }

    const sessions = await Session.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .select("-mlResponse -__v");

    const total = await Session.countDocuments(query);

    res.json({
      success: true,
      count: sessions.length,
      total,
      data: sessions.map((session) => session.toPublicProfile()),
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch sessions",
    });
  }
});

/**
 * GET /api/sessions/stats
 * Get session statistics for the authenticated user
 */
router.get("/stats", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get total sessions
    const totalSessions = await Session.countDocuments({ userId });

    // Get best score
    const bestScoreSession = await Session.findOne({ userId })
      .sort({ finalScore: -1 })
      .limit(1);

    // Calculate average score
    const avgResult = await Session.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$finalScore" },
          avgWpm: { $avg: "$wpm" },
        },
      },
    ]);

    // Calculate streak (consecutive days with sessions)
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .select("createdAt");

    let streak = 0;
    let lastDate = null;

    for (const session of sessions) {
      const sessionDate = new Date(session.createdAt).toDateString();

      if (!lastDate) {
        streak = 1;
        lastDate = new Date(sessionDate);
      } else {
        const dayDiff = Math.floor(
          (lastDate - new Date(sessionDate)) / (1000 * 60 * 60 * 24)
        );

        if (dayDiff === 1) {
          streak++;
          lastDate = new Date(sessionDate);
        } else if (dayDiff > 1) {
          break;
        }
      }
    }

    res.json({
      success: true,
      data: {
        totalSessions,
        bestScore: bestScoreSession?.finalScore || 0,
        averageScore: avgResult[0]?.avgScore || 0,
        averageWpm: avgResult[0]?.avgWpm || 0,
        streak,
      },
    });
  } catch (error) {
    console.error("Error fetching session stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch session statistics",
    });
  }
});

/**
 * GET /api/sessions/:id
 * Get a single session by ID
 */
router.get("/:id", protect, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).select("-mlResponse -__v");

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      data: session.toPublicProfile(),
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch session",
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete session",
    });
  }
});

export default router;
