import express from "express";
import axios from "axios";
import Session from "../models/Session.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// ML Service URL
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:5001";

/**
 * POST /api/speech/analyze
 * Analyze speech audio using ML service
 * Requires authentication
 */
router.post("/analyze", protect, async (req, res) => {
  try {
    const { audioData, targetPhrase, language, streak } = req.body;

    // Validate required fields
    if (!audioData || !targetPhrase) {
      return res.status(400).json({
        success: false,
        error: "Audio data and target phrase are required",
      });
    }

    console.log("📝 Processing speech analysis request...");
    console.log(`Target phrase: "${targetPhrase}"`);
    console.log(`Language: ${language || "en-US"}`);

    // Call ML service for analysis
    console.log(`🤖 Calling ML service at ${ML_SERVICE_URL}/analyze...`);

    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/analyze`,
      {
        audioData: audioData,
        targetPhrase: targetPhrase,
        language: language || "en-US",
      },
      {
        timeout: 30000, // 30 second timeout
        maxContentLength: 100 * 1024 * 1024, // 100MB
        maxBodyLength: 100 * 1024 * 1024,
      }
    );

    if (!mlResponse.data.success) {
      throw new Error(mlResponse.data.error || "ML service analysis failed");
    }

    const mlData = mlResponse.data;
    console.log(
      `✓ ML analysis completed: Score ${mlData.scoring.finalScore}/100`
    );

    // Extract results from ML service
    const transcription = mlData.transcription;
    const scoring = mlData.scoring;
    const feedback = mlData.feedback;

    // Create session record in database
    const session = await Session.create({
      userId: req.user._id,
      language: language || "en-US",
      targetPhrase: targetPhrase,
      transcribedText: transcription.text,
      accuracy: scoring.accuracy,
      fluency: scoring.fluency,
      prosody: scoring.prosody,
      finalScore: scoring.finalScore,
      wpm: scoring.wpm,
      duration: scoring.duration,
      color: scoring.color,
      wordComparison: scoring.wordComparison || [],
      feedback: feedback,
    });

    console.log(`💾 Session saved: ${session.sessionId}`);

    // Return formatted response matching frontend expectations
    res.json({
      success: true,
      message: "Speech analysis completed",
      data: {
        sessionId: session.sessionId,
        transcription: {
          text: transcription.text,
          confidence: transcription.confidence,
        },
        scoring: {
          finalScore: scoring.finalScore,
          color: scoring.color,
          accuracy: scoring.accuracy,
          fluency: scoring.fluency,
          prosody: scoring.prosody,
          wpm: scoring.wpm,
          duration: scoring.duration,
          wordComparison: scoring.wordComparison || [],
        },
        feedback: {
          message: feedback,
          tips: [
            "Speak clearly and at a natural pace",
            "Focus on pronouncing each word distinctly",
            "Practice the challenging words individually",
          ],
          encouragement:
            streak > 0
              ? `Amazing! ${streak + 1} correct in a row! 🔥`
              : "Keep practicing for better results!",
        },
      },
    });
  } catch (error) {
    console.error("Speech analysis error:", error);

    // Check if it's an ML service error
    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "ML service is not running. Please start the ML service first.",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze speech",
    });
  }
});

/**
 * POST /api/speech/synthesize
 * Text-to-speech synthesis using ML service
 */
router.post("/synthesize", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        error: "Text is required",
      });
    }

    console.log(`🔊 Synthesizing speech for: "${text}"`);

    // Call ML service for TTS
    const mlResponse = await axios.post(
      `${ML_SERVICE_URL}/pronounce`,
      { text },
      {
        responseType: "arraybuffer",
        timeout: 10000,
      }
    );

    // Return audio file
    res.set("Content-Type", "audio/mpeg");
    res.send(mlResponse.data);
  } catch (error) {
    console.error("TTS error:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "ML service is not running",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to synthesize speech",
    });
  }
});

/**
 * GET /api/speech/exercises
 * Get practice sentences from ML service
 */
router.get("/exercises", async (req, res) => {
  try {
    const category = req.query.category || "all";

    console.log(`📚 Fetching exercises (category: ${category})`);

    // Call ML service
    const mlResponse = await axios.get(`${ML_SERVICE_URL}/exercises`, {
      params: { category },
      timeout: 5000,
    });

    res.json(mlResponse.data);
  } catch (error) {
    console.error("Exercises error:", error);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "ML service is not running",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to fetch exercises",
    });
  }
});

export default router;
