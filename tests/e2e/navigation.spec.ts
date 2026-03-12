import { test, expect } from '@playwright/test';

test.describe('Public Page Navigation', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Verify the page has content (not a blank page)
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('landing page has a heading', async ({ page }) => {
    await page.goto('/');
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('features page loads successfully', async ({ page }) => {
    await page.goto('/features');
    await expect(page).toHaveURL(/\/features/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('about page loads successfully', async ({ page }) => {
    await page.goto('/about');
    await expect(page).toHaveURL(/\/about/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('privacy page loads successfully', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page).toHaveURL(/\/privacy/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('terms page loads successfully', async ({ page }) => {
    await page.goto('/terms');
    await expect(page).toHaveURL(/\/terms/);
    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
  });

  test('landing page has navigation links', async ({ page }) => {
    await page.goto('/');
    // Check that there is at least one navigation element
    const nav = page.getByRole('navigation');
    await expect(nav.first()).toBeVisible();
  });

  test('pages have proper title tags', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });
});
