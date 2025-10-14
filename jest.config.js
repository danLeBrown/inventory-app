module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    '@/(.*)': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/src'],
  testTimeout: 100000,
};
