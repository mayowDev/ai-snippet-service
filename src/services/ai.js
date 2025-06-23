const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * AI Provider Factory - Creates instances of different AI providers
 */
class AIProviderFactory {
  static createProvider(provider = "gemini") {
    switch (provider.toLowerCase()) {
      case "openai":
        return new OpenAIProvider();
      case "gemini":
        return new GeminiProvider();
      case "mock":
        return new MockProvider();
      default:
        return new GeminiProvider(); // Default to Gemini
    }
  }
}

/**
 * Base AI Provider class
 */
class BaseAIProvider {
  async summarize(text) {
    throw new Error("summarize method must be implemented by subclass");
  }
}

/**
 * OpenAI Provider (Fallback)
 */
class OpenAIProvider extends BaseAIProvider {
  constructor() {
    super();
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY environment variable is required for OpenAI provider"
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  async summarize(text) {
    if (!text || typeof text !== "string") {
      throw new Error("Input text is required for summarization");
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Summarize this in 30 words or less." },
          { role: "user", content: text },
        ],
        max_tokens: 100,
        temperature: 0.5,
      });
      return response.choices[0].message.content.trim();
    } catch (error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
  }
}

/**
 * Google Gemini Provider (Primary - Most generous free tier)
 */
class GeminiProvider extends BaseAIProvider {
  constructor() {
    super();
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY environment variable is required for Gemini provider"
      );
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async summarize(text) {
    if (!text || typeof text !== "string") {
      throw new Error("Input text is required for summarization");
    }

    try {
      const prompt = `Summarize this text in 30 words or less: ${text}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}

/**
 * Mock Provider for testing and fallback
 */
class MockProvider extends BaseAIProvider {
  async summarize(text) {
    if (!text || typeof text !== "string") {
      throw new Error("Input text is required for summarization");
    }

    // Simple mock summarization for testing
    const words = text.split(" ").slice(0, 10).join(" ");
    return `${words}... (Mock summary)`;
  }
}

/**
 * Main summarize function with provider fallback and error handling
 * @param {string} text - The raw text to summarize
 * @param {string} [preferredProvider] - Preferred provider ('gemini', 'openai', 'mock')
 * @param {Object} [providerInstance] - Optional injected provider instance (for testing)
 * @returns {Promise<string>} - The AI-generated summary
 */
async function summarize(
  text,
  preferredProvider = "gemini",
  providerInstance = null
) {
  if (!text || typeof text !== "string") {
    throw new Error("Input text is required for summarization");
  }

  // If provider instance is injected (for testing), use it directly
  if (providerInstance) {
    return await providerInstance.summarize(text);
  }

  // Try preferred provider first, then fallback to others
  const providers = [preferredProvider];

  // Add fallback providers if different from preferred
  if (preferredProvider !== "gemini") providers.push("gemini");
  if (preferredProvider !== "openai") providers.push("openai");
  if (preferredProvider !== "mock") providers.push("mock"); // Final fallback

  for (const provider of providers) {
    try {
      const aiProvider = AIProviderFactory.createProvider(provider);
      const summary = await aiProvider.summarize(text);
      console.log(`Successfully used ${provider} provider for summarization`);
      return summary;
    } catch (error) {
      console.warn(`${provider} provider failed: ${error.message}`);

      // Check if it's a rate limit error
      if (
        error.message.includes("429") ||
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        throw new Error(
          `AI service is currently overloaded. Please try again in a few minutes. (${error.message})`
        );
      }

      if (provider === providers[providers.length - 1]) {
        // Last provider failed, throw the error
        throw new Error(
          `All AI providers failed. Please try again later. Last error: ${error.message}`
        );
      }
      // Continue to next provider
    }
  }
}

module.exports = {
  summarize,
  AIProviderFactory,
  OpenAIProvider,
  GeminiProvider,
  MockProvider,
};
