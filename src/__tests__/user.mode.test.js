const mongoose = require("mongoose");
const User = require("../models/user");

describe("User Model", () => {
  beforeAll(async () => {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/test";
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("User Creation", () => {
    it("should create a user with valid email", async () => {
      const userData = {
        email: "test@example.com",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe("test@example.com");
      expect(savedUser.summariesCreated).toBe(0);
      expect(savedUser.isProUser).toBe(false);
      expect(savedUser.hasExceededFreeLimit).toBe(false);
      expect(savedUser.remainingFreeSummaries).toBe(5);
    });

    it("should validate email format", async () => {
      const userData = {
        email: "invalid-email",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require email", async () => {
      const user = new User({});
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("User Quota Management", () => {
    it("should track summaries created", async () => {
      const user = new User({ email: "test@example.com" });
      await user.save();

      expect(user.summariesCreated).toBe(0);
      expect(user.canCreateSummary()).toBe(true);

      await user.incrementSummaryCount();
      expect(user.summariesCreated).toBe(1);
      expect(user.canCreateSummary()).toBe(true);
    });

    it("should enforce 5-summary limit for free users", async () => {
      const user = new User({ email: "test@example.com" });
      await user.save();

      // Create 5 summaries
      for (let i = 0; i < 5; i++) {
        await user.incrementSummaryCount();
      }

      expect(user.summariesCreated).toBe(5);
      expect(user.canCreateSummary()).toBe(false);
      expect(user.hasExceededFreeLimit).toBe(true);
      expect(user.remainingFreeSummaries).toBe(0);
    });

    it("should allow unlimited summaries for pro users", async () => {
      const user = new User({
        email: "pro@example.com",
        isProUser: true,
      });
      await user.save();

      // Create 10 summaries (more than free limit)
      for (let i = 0; i < 10; i++) {
        await user.incrementSummaryCount();
      }

      expect(user.summariesCreated).toBe(10);
      expect(user.canCreateSummary()).toBe(true);
      expect(user.hasExceededFreeLimit).toBe(false);
      expect(user.remainingFreeSummaries).toBe(Infinity);
    });
  });

  describe("User Static Methods", () => {
    it("should find or create user by email", async () => {
      const email = "findorcreate@example.com";

      // First call should create user
      const user1 = await User.findOrCreateByEmail(email);
      expect(user1.email).toBe(email);
      expect(user1.summariesCreated).toBe(0);

      // Second call should find existing user
      const user2 = await User.findOrCreateByEmail(email);
      expect(user2._id.toString()).toBe(user1._id.toString());
      expect(user2.email).toBe(email);
    });
  });

  describe("User Virtual Properties", () => {
    it("should calculate remaining summaries correctly", async () => {
      const user = new User({ email: "virtual@example.com" });
      await user.save();

      expect(user.remainingFreeSummaries).toBe(5);

      await user.incrementSummaryCount();
      expect(user.remainingFreeSummaries).toBe(4);

      // Create 4 more summaries
      for (let i = 0; i < 4; i++) {
        await user.incrementSummaryCount();
      }

      expect(user.remainingFreeSummaries).toBe(0);
    });

    it("should handle pro user remaining summaries", async () => {
      const user = new User({
        email: "pro@example.com",
        isProUser: true,
      });
      await user.save();

      expect(user.remainingFreeSummaries).toBe(Infinity);
      expect(user.hasExceededFreeLimit).toBe(false);
    });
  });
});
