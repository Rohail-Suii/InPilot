import { test, expect } from '@playwright/test';

test.describe('Authentication Pages', () => {
  test('login page loads successfully', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    // Check that the page has rendered with a heading or form
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('register page loads successfully', async ({ page }) => {
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('login page has email and password fields', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('register page has name, email, and password fields', async ({ page }) => {
    await page.goto('/register');
    const nameInput = page.getByLabel(/name/i);
    const emailInput = page.getByLabel(/email/i);
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('login with invalid credentials shows an error', async ({ page }) => {
    await page.goto('/login');
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    await emailInput.fill('nonexistent@example.com');
    await passwordInput.fill('WrongPassword123');

    const submitButton = page.getByRole('button', { name: /sign in|log in|submit/i });
    await submitButton.click();

    // Wait for an error message to appear
    const errorMessage = page.getByText(/invalid|error|incorrect|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('login page has link to register page', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /sign up|register|create.*account/i });
    await expect(registerLink).toBeVisible();
  });

  test('register page has link to login page', async ({ page }) => {
    await page.goto('/register');
    const loginLink = page.getByRole('link', { name: /sign in|log in|already.*account/i });
    await expect(loginLink).toBeVisible();
  });

  test('can navigate from login to register', async ({ page }) => {
    await page.goto('/login');
    const registerLink = page.getByRole('link', { name: /sign up|register|create.*account/i });
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('can navigate from register to login', async ({ page }) => {
    await page.goto('/register');
    const loginLink = page.getByRole('link', { name: /sign in|log in|already.*account/i });
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/);
  });
});
