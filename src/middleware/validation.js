const { z } = require("zod");

// Schema for creating a new snippet
const createSnippetSchema = z.object({
  text: z
    .string()
    .min(1, "Text is required")
    .max(10000, "Text must be less than 10,000 characters")
    .trim(),
  email: z
    .string()
    .email("Please provide a valid email address")
    .min(1, "Email is required")
    .trim(),
});

// Schema for snippet ID parameter
const snippetIdSchema = z.object({
  id: z
    .string()
    .min(1, "Snippet ID is required")
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid snippet ID format"),
});

// Validation middleware for request body
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

// Validation middleware for request parameters
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse(req.params);
      req.params = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Invalid parameters",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
};

module.exports = {
  createSnippetSchema,
  snippetIdSchema,
  validateBody,
  validateParams,
};
