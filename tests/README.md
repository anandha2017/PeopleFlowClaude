# Testing Guide for People & Organisation Management App

This directory contains all automated tests for the application, including unit tests, integration tests, and end-to-end (E2E) tests.

## Table of Contents

- [Overview](#overview)
- [Test Structure](#test-structure)
- [Setup](#setup)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [CI/CD Integration](#cicd-integration)

---

## Overview

We use a **hybrid testing approach** that combines:

1. **Playwright** - Traditional selector-based automation for stable, critical flows
2. **Stagehand** - AI-powered automation for dynamic UI and complex workflows
3. **Jest** - Unit and integration testing for business logic

### Testing Pyramid

```
      /\
     /  \        E2E Tests (10%)
    /____\       - Playwright: Critical paths
   /      \      - Stagehand: Complex workflows
  /        \
 /__________\    Integration Tests (30%)
/            \   - API endpoints
/              \  - Database interactions
/________________\
                  Unit Tests (60%)
                  - Business logic
                  - Utility functions
```

---

## Test Structure

```
tests/
├── e2e/                          # End-to-end tests
│   ├── playwright/               # Traditional Playwright tests
│   │   ├── auth.spec.ts         # Authentication flows
│   │   ├── people-crud.spec.ts  # People management CRUD
│   │   ├── roles.spec.ts        # Role management
│   │   └── navigation.spec.ts   # Navigation and routing
│   ├── stagehand/               # AI-powered Stagehand tests
│   │   ├── hiring-workflow.spec.ts     # Multi-step hiring workflow
│   │   ├── squad-management.spec.ts    # Squad creation and allocation
│   │   ├── org-chart.spec.ts          # Org chart interactions
│   │   ├── complex-forms.spec.ts      # Dynamic form handling
│   │   └── data-extraction.spec.ts    # Data validation scenarios
│   └── fixtures/                # Shared test utilities
│       ├── auth-helpers.ts      # Authentication helpers
│       └── test-data.json       # Test data fixtures
├── integration/                  # API integration tests
│   ├── api/
│   │   ├── people.test.ts
│   │   ├── squads.test.ts
│   │   └── hiring-needs.test.ts
│   └── database/
│       └── constraints.test.ts
├── unit/                        # Unit tests
│   ├── services/
│   ├── utils/
│   └── components/
└── README.md                    # This file
```

---

## Setup

### Prerequisites

- Node.js 20+
- npm or pnpm
- PostgreSQL (for integration tests)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Install Stagehand (AI automation)
npm install @browserbasehq/stagehand
```

### Environment Variables

Create a `.env.test` file:

```bash
# Application
BASE_URL=http://localhost:3000

# Database (for integration tests)
DATABASE_URL=postgresql://postgres:password@localhost:5432/peopleflow_test

# Stagehand (for AI-powered tests)
OPENAI_API_KEY=your_openai_api_key_here
# OR
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional
STAGEHAND_LOG_LEVEL=info
STAGEHAND_ENABLE_CACHING=true
BROWSERBASE_API_KEY=your_browserbase_key  # If using Browserbase cloud
```

---

## Running Tests

### All Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Tests

#### Playwright (Traditional)

```bash
# Run all Playwright E2E tests
npm run test:e2e

# Run in specific browser
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# Run in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npm run test:e2e tests/e2e/playwright/auth.spec.ts

# Run with UI mode (interactive)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug
```

#### Stagehand (AI-Powered)

```bash
# Run Stagehand tests
npm run test:stagehand

# Run specific Stagehand test
npm run test:stagehand tests/e2e/stagehand/hiring-workflow.spec.ts

# Run in headed mode (watch AI interact)
npm run test:stagehand:headed
```

### Unit Tests

```bash
# Run unit tests
npm run test:unit

# Run with watch mode
npm run test:unit:watch

# Run specific test file
npm run test:unit services/person.service.test.ts
```

### Integration Tests

```bash
# Run integration tests (requires test database)
npm run test:integration
```

---

## Writing Tests

### When to Use Playwright

Use Playwright for:
- ✅ Authentication flows (login, logout, MFA)
- ✅ CRUD operations with fixed forms
- ✅ Navigation and routing
- ✅ Critical paths that must be fast and stable
- ✅ Cross-browser compatibility testing

**Example:**

```typescript
import { test, expect } from '@playwright/test';

test('should create a new person', async ({ page }) => {
  await page.goto('/people');
  await page.click('button:has-text("Add New Person")');

  await page.fill('input[name="firstName"]', 'John');
  await page.fill('input[name="lastName"]', 'Doe');
  await page.fill('input[name="email"]', 'john.doe@company.com');
  await page.selectOption('select[name="location"]', 'London Office');

  await page.click('button[type="submit"]');

  await expect(page.locator('.toast-success')).toBeVisible();
  await expect(page.locator('h1')).toContainText('John Doe');
});
```

---

### When to Use Stagehand

Use Stagehand for:
- ✅ Multi-step workflows across different user roles
- ✅ Complex forms with dynamic fields
- ✅ Dynamic UI that changes frequently
- ✅ Data extraction and validation
- ✅ Exploratory testing scenarios
- ✅ Tests that need to adapt to UI changes (self-healing)

**Example:**

```typescript
import { test, expect } from '@playwright/test';
import { Stagehand } from '@browserbasehq/stagehand';
import { z } from 'zod';

test('should complete hiring approval workflow', async () => {
  const stagehand = new Stagehand({
    env: 'LOCAL',
    enableCaching: true,
  });
  await stagehand.init();

  try {
    // Login using natural language
    await stagehand.page.goto(process.env.BASE_URL + '/login');
    await stagehand.act('login with email "manager@company.com"');

    // Navigate and create hiring need
    await stagehand.act('navigate to hiring needs');
    await stagehand.act('create a new hiring request for Senior Engineer in London');

    // Extract data to verify
    const hiringNeed = await stagehand.extract(
      'extract the hiring need details',
      z.object({
        id: z.string(),
        status: z.string(),
        title: z.string(),
      })
    );

    expect(hiringNeed.status).toContain('Pending Approval');

  } finally {
    await stagehand.close();
  }
});
```

---

### Authentication in Tests

Use the provided `auth-helpers.ts` for consistent authentication:

```typescript
import { test } from '@playwright/test';
import { loginAs, setupAuthenticatedSession } from '../fixtures/auth-helpers';

// Option 1: Login via UI
test('my test', async ({ page }) => {
  await loginAs(page, 'hr');
  // ... test code
});

// Option 2: Setup authenticated session (faster, recommended)
test('my test', async ({ page }) => {
  await setupAuthenticatedSession(page, 'manager');
  // ... test code
});
```

---

### Test Data

Use `test-data.json` for consistent test data:

```typescript
import testData from '../fixtures/test-data.json';

test('should create person with test data', async ({ page }) => {
  const person = testData.testPeople[0];

  await page.fill('input[name="firstName"]', person.firstName);
  await page.fill('input[name="lastName"]', person.lastName);
  // ...
});
```

---

## Best Practices

### General Guidelines

1. **Test Isolation**
   - Each test should be independent
   - Clean up data after tests (use `test.afterEach`)
   - Use transactions for database tests

2. **Descriptive Test Names**
   ```typescript
   // ✅ Good
   test('should show error when email is already taken');

   // ❌ Bad
   test('test email');
   ```

3. **Arrange-Act-Assert Pattern**
   ```typescript
   test('should update person profile', async ({ page }) => {
     // Arrange: Setup
     await setupAuthenticatedSession(page, 'hr');
     await page.goto('/people/123');

     // Act: Perform action
     await page.fill('input[name="jobTitle"]', 'Senior Engineer');
     await page.click('button:has-text("Save")');

     // Assert: Verify result
     await expect(page.locator('.toast-success')).toBeVisible();
   });
   ```

4. **Use Data Test IDs**
   ```typescript
   // In your component
   <button data-testid="submit-button">Submit</button>

   // In your test
   await page.click('[data-testid="submit-button"]');
   ```

5. **Avoid Hard-Coded Waits**
   ```typescript
   // ❌ Bad
   await page.waitForTimeout(5000);

   // ✅ Good
   await page.waitForSelector('.data-loaded');
   await expect(page.locator('.data-loaded')).toBeVisible();
   ```

---

### Playwright-Specific

1. **Use Built-in Assertions**
   ```typescript
   await expect(page.locator('h1')).toHaveText('Welcome');
   await expect(page).toHaveURL('/dashboard');
   await expect(page.locator('.alert')).toBeVisible();
   ```

2. **Leverage Auto-Waiting**
   - Playwright automatically waits for elements to be actionable
   - No need for manual `sleep()` in most cases

3. **Take Screenshots on Failure**
   ```typescript
   test('my test', async ({ page }) => {
     try {
       // test code
     } catch (error) {
       await page.screenshot({ path: `failure-${Date.now()}.png` });
       throw error;
     }
   });
   ```

---

### Stagehand-Specific

1. **Enable Caching**
   ```typescript
   const stagehand = new Stagehand({
     env: 'LOCAL',
     enableCaching: true, // Reuse AI-generated selectors
   });
   ```

2. **Be Specific in Instructions**
   ```typescript
   // ✅ Good
   await stagehand.act('enter "john.doe@company.com" in the email input field');

   // ❌ Too vague
   await stagehand.act('enter email');
   ```

3. **Use Zod for Data Extraction**
   ```typescript
   const data = await stagehand.extract(
     'extract person details',
     z.object({
       name: z.string(),
       email: z.string().email(),
       title: z.string(),
     })
   );
   ```

4. **Close Stagehand Properly**
   ```typescript
   test('my test', async () => {
     const stagehand = new Stagehand({ env: 'LOCAL' });
     await stagehand.init();

     try {
       // test code
     } finally {
       await stagehand.close(); // Always close
     }
   });
   ```

5. **Cost Management**
   - Enable caching to reduce API calls
   - Use Playwright for repetitive actions
   - Run Stagehand tests less frequently (e.g., only on main branch)

---

## CI/CD Integration

Tests are automatically run in CI/CD pipelines.

### GitHub Actions

See `.github/workflows/e2e-tests.yml` for the full workflow.

**Key Features:**
- Playwright tests run on every PR
- Stagehand tests run only on merge to `main` (cost optimization)
- Parallel execution across browsers
- Automatic retry on failure (2 retries)
- Screenshot/video capture on failure
- HTML report generation

### Running Tests Locally Like CI

```bash
# Simulate CI environment
CI=true npm run test:e2e

# With specific browser
CI=true npm run test:e2e -- --project=chromium
```

---

## Debugging Tests

### Playwright

```bash
# Debug mode (opens inspector)
npm run test:e2e:debug

# UI mode (interactive)
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed

# Show trace viewer for failed tests
npx playwright show-trace trace.zip
```

### Stagehand

```bash
# Run in headed mode to watch AI interact
STAGEHAND_HEADLESS=false npm run test:stagehand

# Enable verbose logging
STAGEHAND_LOG_LEVEL=debug npm run test:stagehand
```

---

## Troubleshooting

### Common Issues

#### 1. Tests Failing Due to Timing Issues

**Problem:** Element not found or action timed out

**Solution:**
```typescript
// Increase timeout for specific action
await page.click('button', { timeout: 30000 });

// Or wait for element explicitly
await page.waitForSelector('.slow-loading-element', { state: 'visible' });
```

#### 2. Stagehand API Rate Limits

**Problem:** Too many API calls to OpenAI/Anthropic

**Solution:**
- Enable caching: `enableCaching: true`
- Use Playwright for repetitive actions
- Run Stagehand tests less frequently

#### 3. Test Database Not Clean

**Problem:** Tests failing due to data from previous runs

**Solution:**
```bash
# Reset test database
npm run db:reset:test
npm run db:seed:test
```

#### 4. Flaky Tests

**Problem:** Tests pass sometimes, fail other times

**Solution:**
- Use Playwright's built-in auto-waiting
- Avoid `waitForTimeout`
- Use stable selectors (data-testid)
- Check for race conditions
- Enable retries in CI

---

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [Stagehand Documentation](https://docs.stagehand.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)

---

## Contributing

When adding new tests:

1. **Choose the right tool** (Playwright vs Stagehand)
2. **Follow naming conventions** (`*.spec.ts` for E2E, `*.test.ts` for unit)
3. **Add descriptive test names** (what behavior is being tested)
4. **Use fixtures and helpers** (avoid duplication)
5. **Document complex test scenarios** (add comments)
6. **Ensure tests are isolated** (no dependencies between tests)
7. **Run tests locally before pushing** (catch issues early)

---

## Support

For questions or issues with tests:
- Check this README first
- Review example tests in `tests/e2e/`
- Consult official documentation (links above)
- Ask in team chat or create an issue

---

**Last Updated:** 2025-11-07
**Maintained by:** Engineering Team
