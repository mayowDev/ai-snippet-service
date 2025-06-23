module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/setup.js$"],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/index.js",
    "!src/__tests__/setup.js",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.js"],
};
