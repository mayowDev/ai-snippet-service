const mongoose = require("mongoose");

const snippetSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, "Text is required"],
    trim: true,
  },
  summary: {
    type: String,
    required: [true, "Summary is required"],
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
});

// Create indexes for efficient queries
snippetSchema.index({ text: 1 });
snippetSchema.index({ createdBy: 1 });
snippetSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Snippet", snippetSchema);
