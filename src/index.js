require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { connectDatabase } = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;
let mongoConnected = false;
let snippetCache = [];

// Import routes
const snippetRoutes = require("./routes/snippets");

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint (at root)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    dbConnected: mongoConnected,
    message: "AI Snippet Service is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/snippets", snippetRoutes);

// 404 handler for unknown routes
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    mongoConnected =  await connectDatabase();

   app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

module.exports = app;

// Only start the server if run directly
if (require.main === module) {
  startServer();
}