module.exports = {
  collectCoverage: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  globals: {
    "ts-jest": {
      diagnostics: false
    },
  },
  modulePathIgnorePatterns: [
    "<rootDir>/src/__tests__/project/.w3"
  ],
  testPathIgnorePatterns: [
    "<rootDir>/src/__tests__/project/.w3"
  ],
  transformIgnorePatterns: [
    "<rootDir>/src/__tests__/project/.w3"
  ],
  setupFilesAfterEnv: ["./jest.setup.js"],
};
