import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:5174',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      cwd: '../bloglist',
      command: 'npm run test:server',
      url: 'http://127.0.0.1:3001/api/blogs',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { PORT: '3001' },
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
      cwd: '../bloglist/frontend',
      url: 'http://127.0.0.1:5174',
      reuseExistingServer: false,
      timeout: 120_000,
      env: { BLOG_API_PROXY: 'http://127.0.0.1:3001' },
    },
  ],
})
