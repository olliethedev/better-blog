/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.(ts|tsx)',
    '<rootDir>/src/**/*.(test|spec).(ts|tsx)'
  ],
  collectCoverageFrom: [
    'src/**/*.(ts|tsx)',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/types/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};