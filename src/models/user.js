const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(email);
        },
        message: "Please provide a valid email address",
      },
    },
    summariesCreated: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSummaryAt: {
      type: Date,
      default: null,
    },
    isProUser: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for efficient queries (email already has unique index from schema)
userSchema.index({ summariesCreated: 1 });

// Virtual for checking if user has exceeded free tier limit
userSchema.virtual("hasExceededFreeLimit").get(function () {
  return !this.isProUser && this.summariesCreated >= 5;
});

// Virtual for remaining free summaries
userSchema.virtual("remainingFreeSummaries").get(function () {
  if (this.isProUser) return Infinity;
  return Math.max(0, 5 - this.summariesCreated);
});

// Method to increment summary count
userSchema.methods.incrementSummaryCount = function () {
  this.summariesCreated += 1;
  this.lastSummaryAt = new Date();
  return this.save();
};

// Method to check if user can create summary
userSchema.methods.canCreateSummary = function () {
  if (this.isProUser) return true;
  return this.summariesCreated < 5;
};

// Static method to find or create user
userSchema.statics.findOrCreateByEmail = async function (email) {
  let user = await this.findOne({ email });
  if (!user) {
    user = new this({ email });
    await user.save();
  }
  return user;
};

module.exports = mongoose.model("User", userSchema);
