module.exports = {
  roots: ['<rootDir>/client/src'],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": ["babel-jest", { presets: ["@babel/preset-env", "@babel/preset-react"] }]
  },
  moduleNameMapper: {
    // Handle CSS imports (with CSS modules)
    '\\.module\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle CSS imports (without CSS modules)
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    // Handle image imports
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/client/src/__mocks__/fileMock.js',
    // Handle module aliases
    '^@/(.*)$': '<rootDir>/client/src/$1'
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'client/src/**/*.{js,jsx,ts,tsx}',
    '!client/src/**/*.d.ts',
    '!client/src/index.js',
    '!client/src/serviceWorker.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['text', 'lcov', 'html']
};