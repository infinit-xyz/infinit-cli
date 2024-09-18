import { loadEnv } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'
import type { CoverageReporter } from 'vitest/node'

const coverageReporter: CoverageReporter[] = ['text', 'json-summary']

export default defineConfig({
  test: {
    coverage: {
      reporter: coverageReporter,
      provider: 'istanbul',
      include: ['src/**/*'],
      exclude: ['**/*.test.*'],
    },
    env: loadEnv('', process.cwd(), ''),
  },
  plugins: [tsconfigPaths()],
})
