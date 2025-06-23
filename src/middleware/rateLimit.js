const mongoose = require("mongoose");

const rateLimit = require("express-rate-limit");
const User = require("../models/user");

// Store for tracking rate limits (in production, use Redis)
const rateLimitStore = new Map();

/**
 * Rate limiter for API requests (15 requests per minute to respect Gemini limits)
 */
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15, // 15 requests per minute (Gemini's limit)
  message: {
    error: "Rate limit exceeded",
    message: "Too many requests. Please try again in 1 minute.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "API rate limit exceeded. Please try again in 1 minute.",
      retryAfter: 60,
    });
  },
});

/**
 * Rate limiter for individual users (1 request per 30 seconds)
 */
const userRateLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1, // 1 request per 30 seconds
  keyGenerator: (req) => {
    // Use email as key for rate limiting
    return req.user?.email || req.ip;
  },
  message: {
    error: "User rate limit exceeded",
    message: "Please wait 30 seconds between requests.",
    retryAfter: 30,
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "User rate limit exceeded",
      message: "Please wait 30 seconds between requests.",
      retryAfter: 30,
    });
  },
});

/**
 * Middleware to check user quota before processing request
 */
const checkUserQuota = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    // Allow guest@example.com to pass if DB is down
    if (req.user && req.user.email === "guest@example.com") {
      req.userInfo = {
        id: "guest",
        email: "guest@example.com",
        summariesCreated: 0,
        remainingSummaries: Infinity,
        isProUser: false,
      };
      return next();
    }
    return res.status(503).json({
      error: "User quota service unavailable. Please try again later.",
    });
  }
  try {
    if (!req.user) {
      return res.status(401).json({
        error: "Authentication required",
        message: "Please provide a valid email address.",
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "User account not found.",
      });
    }

    // Check if user can create summary
    if (!user.canCreateSummary()) {
      return res.status(403).json({
        error: "Quota exceeded",
        message:
          "You have reached your free tier limit of 5 summaries. Contact admin for pro access.",
        remainingSummaries: 0,
        isProUser: user.isProUser,
      });
    }

    // Add user info to request
    req.userInfo = {
      id: user._id,
      email: user.email,
      summariesCreated: user.summariesCreated,
      remainingSummaries: user.remainingFreeSummaries,
      isProUser: user.isProUser,
    };

    next();
  } catch (error) {
    console.error("Error checking user quota:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Failed to check user quota.",
    });
  }
};

/**
 * Middleware to authenticate user by email
 */
const authenticateUser = async (req, res, next) => {
  try {
    // Get email from body (POST requests) or query (GET requests)
    const email = req.body.email || req.query.email;

    if (!email) {
      console.log("authenticateUser: No email provided");
      return res.status(400).json({
        error: "Email required",
        message: "Email address is required for authentication.",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("authenticateUser: Invalid email format:", email);
      return res.status(400).json({
        error: "Invalid email",
        message: "Please provide a valid email address.",
      });
    }

    // Fallback: allow guest@example.com if DB is down
    if (mongoose.connection.readyState !== 1) {
      if (email === "guest@example.com") {
        req.user = {
          id: "guest",
          email: "guest@example.com",
        };
        return next();
      }
      return res.status(503).json({
        error: "Authentication service unavailable. Please try again later.",
      });
    }
    // Find or create user
    const user = await User.findOrCreateByEmail(email);

    // Add user to request
    req.user = {
      id: user._id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({
      error: "Authentication failed",
      message: "Failed to authenticate user.",
    });
  }
};

module.exports = {
  apiRateLimiter,
  userRateLimiter,
  checkUserQuota,
  authenticateUser,
};
