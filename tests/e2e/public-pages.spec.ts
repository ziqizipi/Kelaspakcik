import { test, expect } from "@playwright/test"

/**
 * E2E Tests for Public Marketing Pages
 */
test.describe("Landing Page", () => {
  test("should load without errors", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text())
      }
    })

    await page.goto("/")
    await expect(page).toHaveTitle(/BalasBro/i)

    // Should not have console errors
    const criticalErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test("should have sign in and sign up links", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible()
  })
})

test.describe("Pricing Page", () => {
  test("should load pricing information", async ({ page }) => {
    await page.goto("/pricing")
    await expect(page.getByText(/pricing/i)).toBeVisible()
  })
})

test.describe("How It Works Page", () => {
  test("should load without errors", async ({ page }) => {
    await page.goto("/how-it-works")
    await expect(page.getByText(/how it works/i)).toBeVisible()
  })
})

test.describe("Contact Page", () => {
  test("should load without errors", async ({ page }) => {
    await page.goto("/contact")
    await expect(page.getByText(/contact/i)).toBeVisible()
  })
})
