const request = require("supertest");
const mongoose = require("mongoose");
const Snippet = require("../models/snippet");
const User = require("../models/user");
const { summarize } = require("../services/ai");

// Import the app
const app = require("../index");

// Mock the AI service
jest.mock("../services/ai");

describe("Snippet Routes", () => {
  let testUser;
  let testCounter = 0;

  beforeAll(async () => {
    // Ensure we're using test database
    const testUri = process.env.MONGODB_URI.includes("mongodb+srv://")
      ? process.env.MONGODB_URI.replace("/?", "/ai-snippet-service-test?")
      : process.env.MONGODB_URI;

    await mongoose.connect(testUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clean up and create test user with unique email
    await Snippet.deleteMany({});
    await User.deleteMany({});

    testCounter++;
    const uniqueEmail = `test${testCounter}@example.com`;
    testUser = new User({ email: uniqueEmail });
    await testUser.save();

    // Mock AI service to return a predictable summary
    summarize.mockResolvedValue("This is a test summary.");
  });

  afterEach(async () => {
    await Snippet.deleteMany({});
    await User.deleteMany({});
    jest.clearAllMocks();
  });

  describe("POST /snippets", () => {
    it("should create a new snippet with AI summary", async () => {
      const snippetData = {
        text: "This is a long blog post that needs to be summarized.",
        email: testUser.email,
      };

      console.log("TEST: POST /snippets with", snippetData);

      const response = await request(app)
        .post("/snippets")
        .send(snippetData)
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.text).toBe(snippetData.text);
      expect(response.body.summary).toBe("This is a test summary.");
      expect(response.body.userInfo).toBeDefined();
      expect(response.body.userInfo.email).toBe(testUser.email);
      expect(summarize).toHaveBeenCalledWith(snippetData.text);
    });

    it("should return 400 for missing text", async () => {
      const response = await request(app)
        .post("/snippets")
        .send({ email: testUser.email })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for missing email", async () => {
      const response = await request(app)
        .post("/snippets")
        .send({ text: "Test text" })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid email", async () => {
      const response = await request(app)
        .post("/snippets")
        .send({
          text: "Test text",
          email: "invalid-email",
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for empty text", async () => {
      const response = await request(app)
        .post("/snippets")
        .send({
          text: "",
          email: testUser.email,
        })
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 500 if AI service fails", async () => {
      summarize.mockRejectedValue(new Error("AI service error"));

      const response = await request(app)
        .post("/snippets")
        .send({
          text: "Test text",
          email: testUser.email,
        })
        .expect(500);

      expect(response.body).toHaveProperty("error");
    });

    it("should enforce user quota limits", async () => {
      // Create a user that has already used 5 summaries
      const quotaUser = new User({
        email: `quota${testCounter}@example.com`,
        summariesCreated: 5,
      });
      await quotaUser.save();

      const response = await request(app)
        .post("/snippets")
        .send({
          text: "Test text",
          email: quotaUser.email,
        })
        .expect(403);

      expect(response.body.error).toBe("Quota exceeded");
      expect(response.body.message).toContain("free tier limit of 5 summaries");
    });
  });

  describe("GET /snippets", () => {
    it("should return all snippets sorted by latest", async () => {
      // Create test snippets with createdBy
      const snippet1 = await Snippet.create({
        text: "First snippet",
        summary: "First summary",
        createdBy: testUser._id,
      });

      const snippet2 = await Snippet.create({
        text: "Second snippet",
        summary: "Second summary",
        createdBy: testUser._id,
      });

      const response = await request(app).get("/snippets").expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].id).toBe(snippet2._id.toString()); // Latest first
      expect(response.body[1].id).toBe(snippet1._id.toString());
    });

    it("should return empty array when no snippets exist", async () => {
      const response = await request(app).get("/snippets").expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("GET /snippets/:id", () => {
    it("should return a single snippet by ID", async () => {
      const snippet = await Snippet.create({
        text: "Test snippet",
        summary: "Test summary",
        createdBy: testUser._id,
      });

      const response = await request(app)
        .get(`/snippets/${snippet._id}`)
        .expect(200);

      expect(response.body.id).toBe(snippet._id.toString());
      expect(response.body.text).toBe("Test snippet");
      expect(response.body.summary).toBe("Test summary");
    });

    it("should return 404 for non-existent snippet ID", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/snippets/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 400 for invalid snippet ID format", async () => {
      const response = await request(app)
        .get("/snippets/invalid-id")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /snippets/user/status", () => {
    it("should return user status and quota", async () => {
      const response = await request(app)
        .get("/snippets/user/status")
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("summariesCreated");
      expect(response.body).toHaveProperty("remainingSummaries");
      expect(response.body).toHaveProperty("isProUser");
      expect(response.body).toHaveProperty("canCreateSummary");
    });
  });
});
