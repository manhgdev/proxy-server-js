export default {
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/tests/**/*.test.js'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/jest-setup.js'],
  testTimeout: 30000
}; 