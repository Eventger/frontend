import path from 'node:path'

import { defineConfig } from '@playwright/test'

const projectRoot = path.resolve(
  import.meta.dirname,
  '../..',
)

export default defineConfig({
  testDir: import.meta.dirname,
  testMatch: 'responsive.spec.ts',
  outputDir: '../../reports/responsive-artifacts',
  reporter: [['list'], ['html', {
    outputFolder: '../../reports/responsive-report',
    open: 'never',
  }]],
  use: {
    baseURL: 'http://127.0.0.1:4175',
    browserName: 'chromium',
    channel: 'chrome',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm exec vite -- --config tests/visual/vite.config.ts --host 127.0.0.1 --port 4175',
    cwd: projectRoot,
    url: 'http://127.0.0.1:4175/tests/visual/index.html',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
