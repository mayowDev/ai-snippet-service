// Test setup file
require("dotenv").config(); // Load the main .env file

// Set test environment variables if not already set
process.env.NODE_ENV = "test";
process.env.PORT = "4000";

// Ensure MONGODB_URI is available for tests
if (!process.env.MONGODB_URI) {
  console.warn("MONGODB_URI not found in environment variables");
}

// Set a dummy OpenAI API key for tests if not present
if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = "test-key";
}

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
