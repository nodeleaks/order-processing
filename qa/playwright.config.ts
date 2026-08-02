import { defineConfig } from '@playwright/test'

/**
 * API_URL points at whatever environment we're testing:
 *  - http://localhost:3000 for local/CI runs against `npm run local`
 *  - the deployed dev API Gateway URL (from terraform output `api_url`) for real e2e runs
 */
const API_URL = process.env.API_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  use: {
    baseURL: API_URL,
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
    trace: 'retain-on-failure',
  },
  timeout: 20_000,
  expect: {
    timeout: 5_000,
  },
})
