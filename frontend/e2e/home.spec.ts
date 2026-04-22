import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and displays the brand', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Tayrell/);
    await expect(page.getByRole('link', { name: 'Tayrell' })).toBeVisible();
  });

  test('exposes the main navigation links', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Navigation principale' });
    await expect(nav.getByRole('link', { name: 'Projets' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'À propos' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Contact' })).toBeVisible();
  });
});
