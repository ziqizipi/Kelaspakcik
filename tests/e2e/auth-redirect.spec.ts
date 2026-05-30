import { test, expect } from "@playwright/test"

/**
 * E2E Tests for authenticated page access control.
 * Verifies that unauthenticated users are redirected to login.
 */
test.describe("Auth Protection", () => {
  const protectedPages = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/conversations", name: "Conversations" },
    { path: "/orders", name: "Orders" },
    { path: "/customers", name: "Customers" },
    { path: "/settings", name: "Settings" },
    { path: "/settings/team", name: "Team Settings" },
    { path: "/settings/ai", name: "AI Settings" },
    { path: "/settings/channels", name: "Channels" },
    { path: "/settings/escalation", name: "Escalation" },
    { path: "/settings/reports", name: "Reports" },
    { path: "/settings/security", name: "Security" },
    { path: "/bulk-message", name: "Bulk Message" },
  ]

  protectedPages.forEach(({ path, name }) => {
    test(`should redirect to /login when accessing ${name} without auth`, async ({ page }) => {
      await page.goto(path)
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test("should redirect to /login when accessing root without auth", async ({ page }) => {
    await page.goto("/")
    // Root redirects to dashboard, which redirects to login
    await expect(page).toHaveURL(/\/login/)
  })
})

/**
 * E2E Tests for dashboard page structure.
 * Note: These tests assume authentication is bypassed in test environment.
 * In production, these would require proper session handling.
 */
test.describe("Dashboard Page", () => {
  test.skip("dashboard loads with correct structure", async ({ page }) => {
    // This test is skipped by default as it requires auth
    // Enable when running with proper test auth setup
  })
})

test.describe("Navigation", () => {
  test.skip("sidebar navigation links are present", async ({ page }) => {
    // This test is skipped by default as it requires auth
  })
})
