const {
  summarize,
  AIProviderFactory,
  GeminiProvider,
  MockProvider,
} = require("../services/ai");

describe("AI Service", () => {
  let mockGeminiProvider;

  beforeEach(() => {
    mockGeminiProvider = {
      summarize: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a summary from Gemini provider", async () => {
    const mockSummary = "This is a short summary.";
    mockGeminiProvider.summarize.mockResolvedValue(mockSummary);

    const text = "This is a long blog post that needs to be summarized.";
    const summary = await summarize(text, "gemini", mockGeminiProvider);
    expect(summary).toBe(mockSummary);
    expect(mockGeminiProvider.summarize).toHaveBeenCalledWith(text);
  });

  it("should throw an error if provider fails", async () => {
    mockGeminiProvider.summarize.mockRejectedValue(new Error("API error"));
    await expect(
      summarize("test", "gemini", mockGeminiProvider)
    ).rejects.toThrow("API error");
  });

  it("should validate input text", async () => {
    await expect(summarize("", "gemini", mockGeminiProvider)).rejects.toThrow(
      "Input text is required for summarization"
    );
    await expect(summarize(null, "gemini", mockGeminiProvider)).rejects.toThrow(
      "Input text is required for summarization"
    );
    await expect(summarize(123, "gemini", mockGeminiProvider)).rejects.toThrow(
      "Input text is required for summarization"
    );
  });

  it("should create Gemini provider by default", () => {
    const provider = AIProviderFactory.createProvider("gemini");
    expect(provider).toBeInstanceOf(GeminiProvider);
  });

  it("should use Gemini as default provider when none specified", async () => {
    const mockSummary = "Default provider summary.";
    mockGeminiProvider.summarize.mockResolvedValue(mockSummary);

    const text = "Test text.";
    const summary = await summarize(text, undefined, mockGeminiProvider);
    expect(summary).toBe(mockSummary);
  });

  it("should handle rate limit errors gracefully", async () => {
    const rateLimitError = new Error("429 Rate limit exceeded");
    mockGeminiProvider.summarize.mockRejectedValue(rateLimitError);

    await expect(
      summarize("test", "gemini", mockGeminiProvider)
    ).rejects.toThrow("429 Rate limit exceeded");
  });

  it("should create MockProvider for testing", () => {
    const provider = AIProviderFactory.createProvider("mock");
    expect(provider).toBeInstanceOf(MockProvider);
  });

  it("should provide fallback with MockProvider", async () => {
    const text = "This is a test text for mock summarization.";
    const mockProvider = new MockProvider();
    const summary = await mockProvider.summarize(text);

    expect(summary).toContain("This is a test text for mock summarization");
    expect(summary).toContain("(Mock summary)");
  });
});
