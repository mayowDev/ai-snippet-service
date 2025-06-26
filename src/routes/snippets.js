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
const { createSnippet, getAllSnippets, getSnippetById } = require("../services/snippetService");
const { sendError, sendSuccess } = require("../utils/response");

const router = express.Router();

// Apply API rate limiting to all routes
router.use(apiRateLimiter);
let snippetCache = [];
// POST /snippets - Create a new snippet with AI summary
router.post(
  "/",
  authenticateUser, // Authenticate user by email
  userRateLimiter, // Rate limit per user (30 seconds)
  checkUserQuota, // Check if user has remaining summaries
  validateBody(createSnippetSchema),
  async (req, res) => {
    try {
      const { text } = req.body;
      const userInfo = req.userInfo; // From checkUserQuota middleware
      const result = await createSnippet({ text, userInfo, snippetCache });
      return sendSuccess(res, result.status, result.data);
    } catch (error) {
      console.error("Error creating snippet:", error);
      return sendError(res, 500, "Failed to create snippet", error.message);
    }
  }
);

// GET /snippets - Get all snippets sorted by latest
router.get("/", async (req, res) => {
  try {
    const result = await getAllSnippets(snippetCache);
    return sendSuccess(res, result.status, result.data);
  } catch (error) {
    console.error("Error fetching snippets:", error);
    return sendError(res, 500, "Failed to fetch snippets", error.message);
  }
});

// GET /snippets/:id - Get a single snippet by ID
router.get("/:id", validateParams(snippetIdSchema), async (req, res) => {
  try {
    const result = await getSnippetById(req.params.id, snippetCache);
    return sendSuccess(res, result.status, result.data);
  } catch (error) {
    console.error("Error fetching snippet by id:", error);
    return sendError(res, 500, "Failed to fetch snippet", error.message);
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
