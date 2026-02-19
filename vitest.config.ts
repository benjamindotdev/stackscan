import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70
      },
      exclude: [
          'test-project/**',
          'playground-app/**',
          'public/**',
          'dist/**',
          'vitest.config.ts',
          '**/*.d.ts',
          '**/*.test.ts',
          '**/*.json'
      ]
    },
    include: ['src/**/*.test.ts'],
  },
});
