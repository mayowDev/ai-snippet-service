const express = require("express");
const mongoose = require("mongoose");
const Snippet = require("../models/snippet");
const User = require("../models/user");
const { summarize } = require("../services/ai");
const {
  createSnippetSchema,
  snippetIdSchema,
  validateBody,
  validateParams,
} = require("../middleware/validation");
const {
  apiRateLimiter,
  userRateLimiter,
  checkUserQuota,
  authenticateUser,
} = require("../middleware/rateLimit");

const router = express.Router();

// Apply API rate limiting to all routes
router.use(apiRateLimiter);

// POST /snippets - Create a new snippet with AI summary
router.post(
  "/",
  authenticateUser, // Authenticate user by email
  userRateLimiter, // Rate limit per user (30 seconds)
  checkUserQuota, // Check if user has remaining summaries
  validateBody(createSnippetSchema),
  async (req, res) => {
    console.log("POST /snippets called with body:", req.body);
    try {
      const { text } = req.body;
      const userInfo = req.userInfo; // From checkUserQuota middleware

      // Check if similar snippet already exists (simple text comparison for now)
      const existingSnippet = await Snippet.findOne({ text: text.trim() });
      if (existingSnippet) {
        return res.status(200).json({
          id: existingSnippet._id,
          text: existingSnippet.text,
          summary: existingSnippet.summary,
          userInfo: {
            email: userInfo.email,
            summariesCreated: userInfo.summariesCreated,
            remainingSummaries: userInfo.remainingSummaries,
            isProUser: userInfo.isProUser,
          },
        });
      }

      // Generate AI summary
      const summary = await summarize(text);

      // Create and save the snippet
      const snippet = new Snippet({
        text: text.trim(),
        summary,
        createdBy: userInfo.id, // Track which user created it
      });

      const savedSnippet = await snippet.save();

      // Increment user's summary count and get updated user info
      const updatedUser = await User.findByIdAndUpdate(
        userInfo.id,
        {
          $inc: { summariesCreated: 1 },
          lastSummaryAt: new Date(),
        },
        { new: true }
      );

      res.status(201).json({
        id: savedSnippet._id,
        text: savedSnippet.text,
        summary: savedSnippet.summary,
        userInfo: {
          email: updatedUser.email,
          summariesCreated: updatedUser.summariesCreated,
          remainingSummaries: updatedUser.remainingFreeSummaries,
          isProUser: updatedUser.isProUser,
        },
      });
    } catch (error) {
      console.error("Error creating snippet:", error);

      // Handle specific AI service errors
      if (
        error.message.includes("overloaded") ||
        error.message.includes("rate limit")
      ) {
        return res.status(503).json({
          error: "AI service temporarily unavailable",
          message: error.message,
          retryAfter: 60,
        });
      }

      res.status(500).json({
        error: "Failed to create snippet",
        message: error.message,
      });
    }
  }
);

// GET /snippets - Get all snippets sorted by latest
router.get("/", async (req, res) => {
  try {
    const snippets = await Snippet.find()
      .populate("createdBy", "email") // Populate user email
      .sort({ createdAt: -1 }) // Latest first
      .select("_id text summary createdAt createdBy");

    const formattedSnippets = snippets.map((snippet) => ({
      id: snippet._id,
      text: snippet.text,
      summary: snippet.summary,
      createdAt: snippet.createdAt,
      createdBy: snippet.createdBy ? snippet.createdBy.email : null,
    }));

    res.json(formattedSnippets);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    res.status(500).json({
      error: "Failed to fetch snippets",
      message: error.message,
    });
  }
});

// GET /snippets/:id - Get a single snippet by ID
router.get("/:id", validateParams(snippetIdSchema), async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid snippet ID format",
      });
    }

    const snippet = await Snippet.findById(id).populate("createdBy", "email");

    if (!snippet) {
      return res.status(404).json({
        error: "Snippet not found",
      });
    }

    res.json({
      id: snippet._id,
      text: snippet.text,
      summary: snippet.summary,
      createdAt: snippet.createdAt,
      createdBy: snippet.createdBy ? snippet.createdBy.email : null,
    });
  } catch (error) {
    console.error("Error fetching snippet:", error);
    res.status(500).json({
      error: "Failed to fetch snippet",
      message: error.message,
    });
  }
});

// GET /user/status - Get current user's status and quota
router.get("/user/status", authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json({
      email: user.email,
      summariesCreated: user.summariesCreated,
      remainingSummaries: user.remainingFreeSummaries,
      isProUser: user.isProUser,
      lastSummaryAt: user.lastSummaryAt,
      canCreateSummary: user.canCreateSummary(),
    });
  } catch (error) {
    console.error("Error fetching user status:", error);
    res.status(500).json({
      error: "Failed to fetch user status",
      message: error.message,
    });
  }
});

module.exports = router;
