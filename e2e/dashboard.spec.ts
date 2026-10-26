import { expect, test, type Page } from '@playwright/test'
import { mockBackend, type MockState } from './mocks'

// Every route linked from the dashboard sidebar.
const ROUTES = [
  '/dashboard',
  '/dashboard/cost-explorer',
  '/dashboard/resources',
  '/dashboard/scans',
  '/dashboard/advisor',
  '/dashboard/rightsizing',
  '/dashboard/reserved-instances',
  '/dashboard/regressions',
  '/dashboard/budgets',
  '/dashboard/deploys',
  '/dashboard/audit',
  '/dashboard/team',
  '/dashboard/credentials',
  '/dashboard/webhooks',
  '/dashboard/billing',
  '/dashboard/settings',
]

// Routes kept for old links but hidden from the sidebar.
const HIDDEN_ROUTES = [
  'actions', 'api-docs', 'api-keys', 'autostop', 'cost-estimate', 'drift', 'forecast', 'kubernetes',
  'runs', 'savings-plans', 'savings-report', 'tags', 'ttl', 'unit-economics', 'virtual-tags',
].map((r) => `/dashboard/${r}`)

const SETTLE_MS = 25_000

function collectConsoleErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (m) => {
    // The browser logs every failed HTTP response as a console error; those are
    // the mocked failures under test, not application errors.
    if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errors.push(m.text())
  })
  return errors
}

/** The page is settled when nothing in <main> is a loading skeleton and it shows real text. */
async function expectSettled(page: Page) {
  const main = page.locator('main')
  await expect(main.locator('h1').first()).toBeVisible({ timeout: SETTLE_MS })
  await expect
    .poll(async () => main.evaluate((el) => {
      const visible = (n: Element) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.height > 0 }
      const loading = [...el.querySelectorAll('[data-testid="loading-state"], .animate-pulse')].filter(visible).length
      return { loading, text: (el as HTMLElement).innerText.trim().length > 40 }
    }), { timeout: SETTLE_MS, intervals: [250] })
    .toEqual({ loading: 0, text: true })
  // app/error.tsx (an uncaught render error) shows this heading.
  await expect(page.getByRole('heading', { name: 'Something went wrong' })).toHaveCount(0)
}

for (const state of ['empty', 'error500', 'hang'] as MockState[]) {
  test.describe(`state: ${state}`, () => {
    for (const route of ROUTES) {
      test(`${route} settles`, async ({ page }) => {
        if (state === 'hang') test.setTimeout(60_000)
        const errors = collectConsoleErrors(page)
        const calls = await mockBackend(page, state)
        await page.goto(route)
        await expectSettled(page)

        if (state !== 'empty' && calls.length > 0) {
          // Any page that asked the backend for data must explain the failure and offer a retry.
          await expect(page.locator('main [data-testid="error-state"], main [role="alert"]').first()).toBeVisible()
          if (state === 'hang') await expect(page.locator('main').getByText('The backend may be waking up', { exact: false }).first()).toBeVisible()
        }
        expect(errors).toEqual([])
      })
    }
  })
}

test('hidden routes still load and say the feature is not available', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await mockBackend(page, 'empty')
  for (const route of HIDDEN_ROUTES) {
    await page.goto(route)
    await expect(page.getByTestId('not-available'), route).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('sidebar shows AWS only and labels coming-soon items', async ({ page }) => {
  await mockBackend(page, 'empty')
  await page.goto('/dashboard')
  await expect(page.getByText(/azure|gcp/i)).toHaveCount(0)
  const nav = page.getByRole('navigation', { name: 'Dashboard' })
  for (const label of ['Regressions', 'Budgets', 'Deploys', 'Activity Log', 'Team']) {
    await expect(nav.getByRole('link', { name: new RegExp(label) })).toContainText('Soon')
  }
  for (const hidden of HIDDEN_ROUTES) await expect(nav.locator(`a[href="${hidden}"]`)).toHaveCount(0)
})

test('empty tenant: overview asks to connect AWS', async ({ page }) => {
  await mockBackend(page, 'empty')
  await page.goto('/dashboard')
  await expect(page.getByTestId('empty-state')).toContainText('Connect your AWS account')
  await expect(page.getByRole('link', { name: 'Connect AWS' })).toHaveAttribute('href', '/dashboard/credentials')
})

test('401 is reported as a session problem, not as an empty account', async ({ page }) => {
  await mockBackend(page, 'error401')
  await page.goto('/dashboard')
  await expect(page.getByTestId('error-state')).toContainText('session couldn’t be verified')
  await expect(page.getByText('Connect your AWS account')).toHaveCount(0)
})

test('scanned tenant: overview shows real spend and findings', async ({ page }) => {
  const errors = collectConsoleErrors(page)
  await mockBackend(page, 'scanned')
  await page.goto('/dashboard')
  await expect(page.getByText('$1,243.57')).toBeVisible()
  await expect(page.getByText('Amazon Elastic Compute Cloud - Compute')).toBeVisible()
  await expect(page.getByText(/Idle — avg CPU 1.8%/)).toBeVisible()
  await expect(page.getByText('$30/mo')).toBeVisible()
  expect(errors).toEqual([])
})

test('first requests after a hard load carry the auth token', async ({ page }) => {
  await mockBackend(page, 'empty')
  // Registered last, so it runs first and then falls through to the mock.
  const auth: string[] = []
  await page.route('http://mock-api.test/**', (route) => {
    if (route.request().method() !== 'OPTIONS') auth.push(route.request().headers()['authorization'] || '')
    return route.fallback()
  })
  await page.goto('/dashboard')
  await expect(page.getByTestId('empty-state')).toBeVisible()
  expect(auth.length).toBeGreaterThan(0)
  expect(auth.every((h) => h === 'Bearer e2e-test-token')).toBe(true)
})

test('Run scan shows progress, disables itself, then explains the result', async ({ page }) => {
  await mockBackend(page, 'empty')
  let release!: () => void
  const gate = new Promise<void>((r) => { release = r })
  await page.route('http://mock-api.test/scan', async (route) => {
    if (route.request().method() !== 'POST') return route.fallback()
    await gate
    return route.fallback()
  })
  await page.goto('/dashboard/scans')
  const header = page.locator('header')
  await header.getByRole('button', { name: 'Run scan' }).click()
  await expect(header.getByRole('button', { name: 'Scanning…' })).toBeDisabled()
  await expect(page.getByTestId('scan-status')).toContainText('Scanning your AWS account')
  release()
  await expect(page.getByTestId('scan-status')).toContainText('Connect an AWS account before running a scan')
  await expect(header.getByRole('button', { name: 'Run scan' })).toBeEnabled()
})

test('no horizontal overflow at 390 px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await mockBackend(page, 'scanned')
  for (const route of ROUTES) {
    await page.goto(route)
    await expectSettled(page)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    expect(overflow, route).toBeLessThanOrEqual(0)
  }
})

test('icon-only buttons have accessible names', async ({ page }) => {
  await mockBackend(page, 'empty')
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/dashboard')
    await expectSettled(page)
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button, a')].filter((el) => {
        const r = el.getBoundingClientRect()
        if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden') return false
        return !(el as HTMLElement).innerText.trim() && !el.getAttribute('aria-label') && !el.getAttribute('title')
      }).map((el) => el.outerHTML.slice(0, 80)))
    expect(unnamed, `width ${width}`).toEqual([])
  }
})
