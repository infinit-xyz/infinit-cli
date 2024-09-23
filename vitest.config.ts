import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import type { CoverageReporter } from 'vitest/node'

const coverageReporter: CoverageReporter[] = ['text', 'json']

export default defineConfig({
  test: {
    coverage: {
      reporter: coverageReporter,
      provider: 'v8',
      include: ['src/**/*'],
      exclude: ['**/*.test.*'],
    },
    testTimeout: 25_000,
    env: loadEnv('', process.cwd(), ''),
  },
  plugins: [tsconfigPaths()],
})
