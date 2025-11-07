import { Page } from '@playwright/test';

/**
 * Authentication Helper Functions
 *
 * Reusable authentication utilities for E2E tests.
 * These helpers reduce code duplication and ensure consistent auth flows.
 */

export interface UserCredentials {
  email: string;
  password: string;
  role?: string;
}

export const TEST_USERS: Record<string, UserCredentials> = {
  admin: {
    email: 'admin@company.com',
    password: 'AdminPass123!',
    role: 'Super Admin',
  },
  hr: {
    email: 'hr@company.com',
    password: 'HRPass123!',
    role: 'HR Admin',
  },
  manager: {
    email: 'manager@company.com',
    password: 'ManagerPass123!',
    role: 'Manager',
  },
  director: {
    email: 'director@company.com',
    password: 'DirectorPass123!',
    role: 'Department Head',
  },
  finance: {
    email: 'finance@company.com',
    password: 'FinancePass123!',
    role: 'Finance Approver',
  },
  recruiter: {
    email: 'recruiter@company.com',
    password: 'RecruiterPass123!',
    role: 'Recruiter',
  },
  employee: {
    email: 'employee@company.com',
    password: 'EmployeePass123!',
    role: 'Employee',
  },
  pm: {
    email: 'pm@company.com',
    password: 'PMPass123!',
    role: 'Product Manager',
  },
};

/**
 * Login helper for Playwright tests
 *
 * @param page - Playwright page object
 * @param credentials - User credentials
 */
export async function login(page: Page, credentials: UserCredentials): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');

  // Wait for navigation to complete
  await page.waitForURL(/\/(dashboard|home)/);
}

/**
 * Login as a specific test user by role
 *
 * @param page - Playwright page object
 * @param role - User role key from TEST_USERS
 */
export async function loginAs(page: Page, role: keyof typeof TEST_USERS): Promise<void> {
  const credentials = TEST_USERS[role];
  if (!credentials) {
    throw new Error(`Unknown test user role: ${role}`);
  }
  await login(page, credentials);
}

/**
 * Login with MFA
 *
 * @param page - Playwright page object
 * @param credentials - User credentials
 * @param mfaCode - MFA code (default: 123456 for test env)
 */
export async function loginWithMFA(
  page: Page,
  credentials: UserCredentials,
  mfaCode: string = '123456'
): Promise<void> {
  await page.goto('/login');
  await page.fill('input[name="email"]', credentials.email);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');

  // Wait for MFA prompt
  await page.waitForSelector('[data-testid="mfa-input"]');
  await page.fill('[data-testid="mfa-input"]', mfaCode);
  await page.click('button[type="submit"]');

  // Wait for dashboard
  await page.waitForURL(/\/dashboard/);
}

/**
 * Logout helper
 *
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  await page.click('[data-testid="user-menu"]');
  await page.click('text=Logout');
  await page.waitForURL('/login');
}

/**
 * Check if user is logged in
 *
 * @param page - Playwright page object
 * @returns true if logged in, false otherwise
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const url = page.url();
  return !url.includes('/login');
}

/**
 * Get authentication token from browser storage
 *
 * @param page - Playwright page object
 * @returns JWT token or null
 */
export async function getAuthToken(page: Page): Promise<string | null> {
  const token = await page.evaluate(() => {
    return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
  });
  return token;
}

/**
 * Set authentication token directly (for API testing or bypassing UI login)
 *
 * @param page - Playwright page object
 * @param token - JWT token
 */
export async function setAuthToken(page: Page, token: string): Promise<void> {
  await page.evaluate((token) => {
    localStorage.setItem('auth_token', token);
  }, token);
}

/**
 * Clear authentication data
 *
 * @param page - Playwright page object
 */
export async function clearAuth(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Login via API (faster than UI for setup in tests)
 *
 * @param page - Playwright page object
 * @param credentials - User credentials
 * @returns Authentication response with token
 */
export async function loginViaAPI(
  page: Page,
  credentials: UserCredentials
): Promise<{ token: string; user: any }> {
  const baseURL = process.env.BASE_URL || 'http://localhost:3000';

  const response = await page.request.post(`${baseURL}/api/v1/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  if (!response.ok()) {
    throw new Error(`Login API failed: ${response.status()} ${await response.text()}`);
  }

  const data = await response.json();

  // Set token in browser storage
  await setAuthToken(page, data.token);

  return data;
}

/**
 * Setup authenticated session for test
 * This is the recommended way to start tests that don't specifically test login
 *
 * @param page - Playwright page object
 * @param role - User role
 */
export async function setupAuthenticatedSession(
  page: Page,
  role: keyof typeof TEST_USERS = 'employee'
): Promise<void> {
  const credentials = TEST_USERS[role];

  // Try API login first (faster), fallback to UI login if API fails
  try {
    await loginViaAPI(page, credentials);
    await page.goto('/dashboard');
  } catch (error) {
    console.log('API login failed, falling back to UI login:', error);
    await loginAs(page, role);
  }
}
