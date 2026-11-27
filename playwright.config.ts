import { defineConfig } from '@playwright/test'

// Exercise an existing development server (including Docker) when requested.
// API calls remain mocked by the receipt tests.
const existingServer = process.env.RECEIPT_TEST_BASE_URL
const baseURL = existingServer || 'http://127.0.0.1:5192'

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.pw.ts',
  workers: 1,
  timeout: 45000,
  use: { baseURL, browserName: 'chromium', trace: 'retain-on-failure' },
  webServer: existingServer ? undefined : { command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 5192 --strictPort', url: baseURL },
})
