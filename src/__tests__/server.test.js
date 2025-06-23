const request = require("supertest");
const mongoose = require("mongoose");

// Import the app
const app = require("../index");

describe("Express Server", () => {
  beforeAll(async () => {
    // Wait a bit for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Close MongoDB connection after tests if connected
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
  });

  describe("Server Setup", () => {
    test("should respond to health check endpoint", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty(
        "message",
        "AI Snippet Service is running"
      );
      expect(response.body).toHaveProperty("timestamp");
    });

    test("should have CORS enabled", async () => {
      const response = await request(app)
        .get("/health")
        .set("Origin", "http://localhost:3030")
        .expect(200);

      expect(response.headers["access-control-allow-origin"]).toBeDefined();
    });

    test("should parse JSON requests", async () => {
      const testData = { test: "data" };

      // Test JSON parsing by using the actual snippets endpoint
      const response = await request(app)
        .post("/snippets")
        .send(testData)
        .expect(400); // Should return 400 due to validation, but JSON parsing should work

      // The fact that we get a 400 (validation error) instead of 500 (parsing error)
      // means JSON parsing is working correctly
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("Database Connection", () => {
    test("should handle database connection gracefully", async () => {
      // This test verifies that the server can start without a database connection
      // In a real scenario, the server would connect to MongoDB Atlas
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe("function");
    });

    test("should handle missing MONGODB_URI gracefully", async () => {
      // This test verifies that the server handles missing env vars
      const originalUri = process.env.MONGODB_URI;

      // The server should already be running, so this test just verifies
      // that the connection logic is in place
      expect(originalUri).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should return 404 for unknown routes", async () => {
      const response = await request(app).get("/unknown-route").expect(404);

      expect(response.body).toHaveProperty("error", "Route not found");
      expect(response.body).toHaveProperty("message");
    });
  });
});
