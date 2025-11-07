import { test, expect } from '@playwright/test';

/**
 * Authentication Tests
 *
 * Tests using traditional Playwright approach with fixed selectors.
 * These tests cover critical authentication flows that must be stable and fast.
 */

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"]', 'admin@company.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Verify user name displayed
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Admin User');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@company.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should enforce MFA for admin users', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@company.com');
    await page.fill('input[name="password"]', 'SecurePassword123!');
    await page.click('button[type="submit"]');

    // Verify MFA prompt
    await expect(page.locator('[data-testid="mfa-input"]')).toBeVisible();
    await page.fill('[data-testid="mfa-input"]', '123456');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
  });

  test('should show validation for empty email', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('should show validation for invalid email format', async ({ page }) => {
    await page.fill('input[name="email"]', 'not-an-email');
    await page.fill('input[name="password"]', 'SomePassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid email format')).toBeVisible();
  });

  test('should handle SSO login redirect', async ({ page }) => {
    await page.click('button:has-text("Sign in with Azure AD")');

    // Should redirect to Azure AD (or mock SSO)
    await expect(page).toHaveURL(/login\.microsoftonline\.com|localhost.*\/mock-sso/);
  });

  test('should show account locked message after failed attempts', async ({ page }) => {
    // Attempt 5 failed logins
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="email"]', 'test@company.com');
      await page.fill('input[name="password"]', 'WrongPassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // 6th attempt should show locked message
    await page.fill('input[name="email"]', 'test@company.com');
    await page.fill('input[name="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Account locked')).toBeVisible();
  });

  test('should remember me checkbox extend session', async ({ page, context }) => {
    await page.fill('input[name="email"]', 'user@company.com');
    await page.fill('input[name="password"]', 'UserPassword123!');
    await page.check('input[name="rememberMe"]');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');

    // Check that remember-me cookie is set
    const cookies = await context.cookies();
    const rememberCookie = cookies.find(c => c.name === 'remember_me');
    expect(rememberCookie).toBeDefined();
    expect(rememberCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 86400); // > 1 day
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'user@company.com');
    await page.fill('input[name="password"]', 'UserPassword123!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');

    // Verify redirect to login
    await expect(page).toHaveURL('/login');

    // Verify cannot access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});
