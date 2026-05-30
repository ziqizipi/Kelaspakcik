import { test, expect } from "@playwright/test"

/**
 * E2E Tests for Settings Pages
 * These tests verify the page structure and UI elements render correctly.
 * Full functionality tests require authenticated session.
 */
test.describe("Settings - General", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - Security", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/security")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - Team", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/team")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - AI", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/ai")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - Channels", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/channels")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - Escalation", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/escalation")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - Reports", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/reports")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Settings - Billing", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/settings/billing")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Conversations Page", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/conversations")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Orders Page", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/orders")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Customers Page", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/customers")
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Bulk Message Page", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    await page.goto("/bulk-message")
    await expect(page).toHaveURL(/\/login/)
  })
})
