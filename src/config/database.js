const mongoose = require("mongoose");

/**
 * Get database URI based on environment
 */
const getDatabaseUri = () => {
  if (process.env.NODE_ENV === "test") {
    // Use test database with unique name
    const testDbName = `test-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    return process.env.MONGODB_URI.replace("/?", `/${testDbName}?`);
  }
  return process.env.MONGODB_URI;
};

/**
 * Connect to MongoDB with proper configuration
 */
const connectDatabase = async () => {
  try {
    const uri = getDatabaseUri();
    const options = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    console.log(
      `Connecting to database: ${uri.split("/").pop().split("?")[1].split("=")[3]}`
    );
    await mongoose.connect(uri, options);

    console.log("Database connected successfully");

    // Handle connection events
    mongoose.connection.on("error", (error) => {
      console.error("Database connection error:", error);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Database disconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      await mongoose.connection.close();
      console.log("Database connection closed through app termination");
      process.exit(0);
    });
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
};

/**
 * Disconnect from MongoDB
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log("Database disconnected successfully");
  } catch (error) {
    console.error("Error disconnecting from database:", error);
    throw error;
  }
};

/**
 * Check database health
 */
const checkDatabaseHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return { status: "healthy", connected: true };
  } catch (error) {
    return { status: "unhealthy", connected: false, error: error.message };
  }
};

module.exports = {
  getDatabaseUri,
  connectDatabase,
  disconnectDatabase,
  checkDatabaseHealth,
};
