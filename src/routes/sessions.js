import express from "express";

const router = express.Router();

// Mock data for MVP
let sessions = [
  {
    id: "1",
    date: "2026-01-08",
    language: "English (US)",
    score: 82,
    duration: "15:32",
    wordsAttempted: 24,
    wordsCorrect: 20,
  },
  {
    id: "2",
    date: "2026-01-07",
    language: "English (US)",
    score: 78,
    duration: "12:45",
    wordsAttempted: 20,
    wordsCorrect: 16,
  },
];

// GET all sessions
router.get("/", (req, res) => {
  res.json({
    success: true,
    count: sessions.length,
    data: sessions,
  });
});

// GET session by ID
router.get("/:id", (req, res) => {
  const session = sessions.find((s) => s.id === req.params.id);

  if (!session) {
    return res.status(404).json({
      success: false,
      error: "Session not found",
    });
  }

  res.json({
    success: true,
    data: session,
  });
});

// POST create new session
router.post("/", (req, res) => {
  const { language, score, duration, wordsAttempted, wordsCorrect } = req.body;

  const newSession = {
    id: String(sessions.length + 1),
    date: new Date().toISOString().split("T")[0],
    language: language || "English (US)",
    score: score || 0,
    duration: duration || "0:00",
    wordsAttempted: wordsAttempted || 0,
    wordsCorrect: wordsCorrect || 0,
  };

  sessions.push(newSession);

  res.status(201).json({
    success: true,
    message: "Session created successfully",
    data: newSession,
  });
});

// DELETE session by ID
router.delete("/:id", (req, res) => {
  const initialLength = sessions.length;
  sessions = sessions.filter((s) => s.id !== req.params.id);

  if (sessions.length === initialLength) {
    return res.status(404).json({
      success: false,
      error: "Session not found",
    });
  }

  res.json({
    success: true,
    message: "Session deleted successfully",
  });
});

export default router;
