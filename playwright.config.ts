import { defineConfig, devices } from '@playwright/test'

// Runs against a production build made with `npm run build:e2e`, where Clerk is
// replaced by e2e/clerk-stub and the backend is mocked per test with page.route().
const PORT = Number(process.env.E2E_PORT || 3200)

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.CI ? 4 : 6,
  timeout: 45_000,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/dashboard/settings`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      CLOUDLINK_E2E_CLERK_STUB: '1',
      // Placeholders only: the stubbed build never talks to Clerk or Stripe.
      NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_live_e2e_placeholder',
      CLERK_SECRET_KEY: 'sk_live_e2e_placeholder',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_e2e_placeholder',
      STRIPE_SECRET_KEY: 'sk_e2e_placeholder',
      STRIPE_WEBHOOK_SECRET: 'whsec_e2e_placeholder',
      STRIPE_STARTER_PRICE_ID: 'price_e2e_placeholder',
      STRIPE_GROWTH_PRICE_ID: 'price_e2e_placeholder',
      CLOUDLINK_API_URL: 'http://127.0.0.1:9',
    },
  },
})
