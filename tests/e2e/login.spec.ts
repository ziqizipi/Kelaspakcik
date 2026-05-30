import { test, expect } from "@playwright/test"

/**
 * E2E Tests for BalasBro.ai Authentication Flows
 */
test.describe("Login Page", () => {
  test("should display login form correctly", async ({ page }) => {
    await page.goto("/login")

    // Check brand elements
    await expect(page.locator("text=BalasBro")).toBeVisible()

    // Check form fields
    await expect(page.getByPlaceholder("you@business.com")).toBeVisible()
    await expect(page.getByPlaceholder("Enter your password")).toBeVisible()

    // Check buttons
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
    await expect(page.getByText(/forgot password/i)).toBeVisible()

    // Check create account link in CTA banner
    await expect(page.getByText(/create a free account/i)).toBeVisible()
  })

  test("should navigate to register page", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("link", { name: /create a free account/i }).click()
    await expect(page).toHaveURL(/\/register/)
  })

  test("should show validation error for empty email", async ({ page }) => {
    await page.goto("/login")
    await page.getByRole("button", { name: /sign in/i }).click()
    // Browser native validation should trigger
    await page.getByPlaceholder("you@business.com").fill("")
    await expect(page.locator("input[type='email']:invalid")).toBeVisible()
  })

  test("should show error for invalid email format", async ({ page }) => {
    await page.goto("/login")
    await page.getByPlaceholder("you@business.com").fill("notanemail")
    await page.getByRole("button", { name: /sign in/i }).click()
    // Should show browser validation or server error
    await expect(page.locator("input[type='email']:invalid")).toBeVisible()
  })
})

test.describe("Register Page", () => {
  test("should display registration form", async ({ page }) => {
    await page.goto("/register")

    await expect(page.getByText("Create your account")).toBeVisible()
    await expect(page.getByPlaceholder("you@business.com")).toBeVisible()
    await expect(page.getByPlaceholder("Your full name")).toBeVisible()
    await expect(page.getByPlaceholder("Create a password")).toBeVisible()
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible()
  })

  test("should navigate to login page", async ({ page }) => {
    await page.goto("/register")
    await page.getByRole("link", { name: /sign in/i }).click()
    await expect(page).toHaveURL(/\/login/)
  })
})

test.describe("Forgot Password Page", () => {
  test("should display forgot password form", async ({ page }) => {
    await page.goto("/forgot-password")

    await expect(page.getByText(/reset your password/i)).toBeVisible()
    await expect(page.getByPlaceholder("you@business.com")).toBeVisible()
    await expect(page.getByRole("button", { name: /send reset link/i })).toBeVisible()
  })

  test("should show success message after submitting valid email", async ({ page }) => {
    await page.goto("/forgot-password")
    await page.getByPlaceholder("you@business.com").fill("test@example.com")
    await page.getByRole("button", { name: /send reset link/i }).click()

    // Should show success message (even if email doesn't exist - security measure)
    await expect(page.getByText(/check your email/i)).toBeVisible()
  })
})

test.describe("Reset Password Page", () => {
  test("should redirect to forgot-password when no token", async ({ page }) => {
    await page.goto("/reset-password")
    // Should redirect when token is missing
    await expect(page).toHaveURL(/\/forgot-password|error/)
  })

  test("should display password reset form when token provided", async ({ page }) => {
    // Note: This test uses a fake token - the page will still render the form UI
    // but server will reject the actual reset
    await page.goto("/reset-password?token=fake-token")

    await expect(page.getByText(/create new password/i)).toBeVisible()
    await expect(page.getByPlaceholder(/min\. 8 characters/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /reset password/i })).toBeVisible()
  })

  test("should show error when passwords don't match", async ({ page }) => {
    await page.goto("/reset-password?token=fake-token")
    await page.getByPlaceholder(/min\. 8 characters/i).fill("password123")
    await page.getByLabel(/confirm password/i).fill("differentpassword")
    await page.getByRole("button", { name: /reset password/i }).click()

    await expect(page.getByText(/do not match|passwords do not match/i)).toBeVisible()
  })
})
