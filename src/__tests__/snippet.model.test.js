const mongoose = require("mongoose");
let Snippet;
let User;

// Ensure test DB URI is set - use a test database on MongoDB Atlas
if (!process.env.MONGODB_URI) {
  // Fallback to local MongoDB if Atlas is not configured
  process.env.MONGODB_URI = "mongodb://localhost:27017/ai-snippet-service-test";
}

// For testing, we'll use a test database by modifying the URI
const getTestDatabaseUri = () => {
  const baseUri = process.env.MONGODB_URI;
  if (baseUri.includes("mongodb+srv://")) {
    // MongoDB Atlas - add test database name before the query parameters
    if (baseUri.includes("/?")) {
      // No database specified, add test database
      return baseUri.replace("/?", "/ai-snippet-service-test?");
    } else if (baseUri.includes("/")) {
      // Database already specified, replace it
      return baseUri.replace(/\/[^?]+/, "/ai-snippet-service-test");
    }
  }
  return baseUri;
};

describe("Snippet Model", () => {
  let testUser;

  beforeAll(async () => {
    // Dynamically import the models after we create them
    Snippet = require("../models/snippet");
    User = require("../models/user");
    const testUri = getTestDatabaseUri();
    try {
      await mongoose.connect(testUri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });
    } catch (error) {
      console.error("Failed to connect to test database:", error.message);
      throw error;
    }
  }, 30000); // 30 second timeout

  afterAll(async () => {
    // Only disconnect, do not drop the database unless you want to clear all data
    try {
      await mongoose.disconnect();
    } catch (error) {
      console.error("Error during mongoose disconnect:", error.message);
    }
  }, 30000); // 30 second timeout

  beforeEach(async () => {
    // Clean up all documents after each test for isolation
    if (Snippet && Snippet.deleteMany) {
      await Snippet.deleteMany({});
    }
    if (User && User.deleteMany) {
      await User.deleteMany({});
    }

    // Create a test user for snippets
    testUser = new User({ email: "test@example.com" });
    await testUser.save();
  });

  it("should require text, summary, and createdBy fields", async () => {
    const snippet = new Snippet();
    let err;
    try {
      await snippet.validate();
    } catch (e) {
      err = e;
    }
    expect(err).toBeDefined();
    expect(err.errors.text).toBeDefined();
    expect(err.errors.summary).toBeDefined();
    expect(err.errors.createdBy).toBeDefined();
  });

  it("should save a valid snippet and set createdAt", async () => {
    const snippet = new Snippet({
      text: "This is a test snippet.",
      summary: "Test summary.",
      createdBy: testUser._id,
    });
    const saved = await snippet.save();
    expect(saved._id).toBeDefined();
    expect(saved.text).toBe("This is a test snippet.");
    expect(saved.summary).toBe("Test summary.");
    expect(saved.createdBy.toString()).toBe(testUser._id.toString());
    expect(saved.createdAt).toBeInstanceOf(Date);
  });

  it("should have indexes for efficient queries", async () => {
    const indexes = await Snippet.collection.getIndexes({ full: true });
    const hasTextIndex = indexes.some((idx) => idx.key && idx.key.text);
    const hasCreatedByIndex = indexes.some(
      (idx) => idx.key && idx.key.createdBy
    );
    const hasCreatedAtIndex = indexes.some(
      (idx) => idx.key && idx.key.createdAt
    );

    expect(hasTextIndex).toBe(true);
    expect(hasCreatedByIndex).toBe(true);
    expect(hasCreatedAtIndex).toBe(true);
  });
});
