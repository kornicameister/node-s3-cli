import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './test-reports/unit/junit.xml',
    },
    setupFiles: ['aws-sdk-client-mock-jest'],
    coverage: {
      enabled: true,
      provider: 'istanbul',
      reporter: ['text', 'text-summary', 'lcov'],
    },
  },
});
