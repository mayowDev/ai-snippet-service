const Snippet = require("../models/snippet");
const User = require("../models/user");
const { summarize } = require("./ai");
const mongoose = require("mongoose");

async function createSnippet({ text, userInfo, snippetCache }) {
  // Fallback: If MongoDB is down, create snippet in cache only
  if (mongoose.connection.readyState !== 1) {
    // Check for duplicate in cache
    const existingSnippet = snippetCache.find(s => s.text.trim() === text.trim());
    if (existingSnippet) {
      return {
        status: 200,
        data: {
          id: existingSnippet._id || existingSnippet.id,
          text: existingSnippet.text,
          summary: existingSnippet.summary,
          userInfo: {
            email: userInfo.email,
            summariesCreated: userInfo.summariesCreated,
            remainingSummaries: userInfo.remainingSummaries,
            isProUser: userInfo.isProUser,
          },
        },
      };
    }
    // Generate AI summary
    const summary = await summarize(text);
    // Create a fake _id and createdAt for cache
    const fakeId = `cache_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const snippet = {
      _id: fakeId,
      text: text.trim(),
      summary,
      createdBy: userInfo.id,
      createdAt: new Date(),
    };
    snippetCache.unshift(snippet);
    if (snippetCache.length > 100) snippetCache.pop();
    return {
      status: 201,
      data: {
        id: snippet._id,
        text: snippet.text,
        summary: snippet.summary,
        userInfo: {
          email: userInfo.email,
          summariesCreated: userInfo.summariesCreated,
          remainingSummaries: userInfo.remainingSummaries,
          isProUser: userInfo.isProUser,
        },
      },
    };
  }

  // Normal DB logic
  // Check if similar snippet already exists (simple text comparison for now)
  const existingSnippet = await Snippet.findOne({ text: text.trim() });
  if (existingSnippet) {
    return {
      status: 200,
      data: {
        id: existingSnippet._id,
        text: existingSnippet.text,
        summary: existingSnippet.summary,
        userInfo: {
          email: userInfo.email,
          summariesCreated: userInfo.summariesCreated,
          remainingSummaries: userInfo.remainingSummaries,
          isProUser: userInfo.isProUser,
        },
      },
    };
  }

  // Generate AI summary
  const summary = await summarize(text);

  // Create and save the snippet
  const snippet = new Snippet({
    text: text.trim(),
    summary,
    createdBy: userInfo.id,
  });

  const savedSnippet = await snippet.save();

  // Increment user's summary count and get updated user info
  const updatedUser = await User.findByIdAndUpdate(
    userInfo.id,
    {
      $inc: { summariesCreated: 1 },
      lastSummaryAt: new Date(),
    },
    { new: true }
  );
  snippetCache.unshift(savedSnippet);
  if (snippetCache.length > 100) {
    snippetCache.pop();
  }

  return {
    status: 201,
    data: {
      id: savedSnippet._id,
      text: savedSnippet.text,
      summary: savedSnippet.summary,
      userInfo: {
        email: updatedUser.email,
        summariesCreated: updatedUser.summariesCreated,
        remainingSummaries: updatedUser.remainingFreeSummaries,
        isProUser: updatedUser.isProUser,
      },
    },
  };
}

async function getAllSnippets(snippetCache) {
  if (mongoose.connection.readyState !== 1) {
    if (snippetCache.length > 0) {
      return { status: 200, data: snippetCache };
    }
    return { status: 503, data: { error: "Database unavailable and no cache." } };
  }
  const snippets = await Snippet.find()
    .populate("createdBy", "email")
    .sort({ createdAt: -1 })
    .select("_id text summary createdAt createdBy");

  const formattedSnippets = snippets.map((snippet) => ({
    id: snippet._id,
    text: snippet.text,
    summary: snippet.summary,
    createdAt: snippet.createdAt,
    createdBy: snippet.createdBy ? snippet.createdBy.email : null,
  }));
  snippetCache.splice(0, snippetCache.length, ...formattedSnippets);
  return { status: 200, data: formattedSnippets };
}

async function getSnippetById(id, snippetCache) {
  if (mongoose.connection.readyState !== 1) {
    const cached = snippetCache.find(s => s._id.toString() === id);
    if (cached) {
      return { status: 200, data: cached };
    }
    return { status: 503, data: { error: "Database unavailable and not in cache." } };
  }
  const snippet = await Snippet.findById(id).populate("createdBy", "email");
  if (!snippet) {
    return { status: 404, data: { error: "Snippet not found" } };
  }
  return {
    status: 200,
    data: {
      id: snippet._id,
      text: snippet.text,
      summary: snippet.summary,
      createdAt: snippet.createdAt,
      createdBy: snippet.createdBy ? snippet.createdBy.email : null,
    },
  };
}

module.exports = { createSnippet, getAllSnippets, getSnippetById }; 