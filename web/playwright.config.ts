import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  reporter: [['list'], ['html', {open: 'never'}]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:14321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {},
  },
  projects: [
    {name: 'editor', testMatch: '**/*.editor.spec.ts'},
    {name: 'execution', testMatch: '**/*.execution.spec.ts', timeout: 60_000},
  ],
  webServer: {
    // Use a separate port and ignore Astro's dev lock; leave the user's server alone.
    command: 'npm run dev -- --ignore-lock --host 127.0.0.1 --port 14321',
    url: 'http://127.0.0.1:14321/microgames/',
    // Suppress Astro's agent-detected daemon mode so Playwright owns shutdown.
    env: {ASTRO_DEV_BACKGROUND: '1'},
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
