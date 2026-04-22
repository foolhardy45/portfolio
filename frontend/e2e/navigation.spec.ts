import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates between the main pages', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Navigation principale' });

    await nav.getByRole('link', { name: 'Projets' }).click();
    await expect(page).toHaveURL(/\/projets$/);

    await nav.getByRole('link', { name: 'À propos' }).click();
    await expect(page).toHaveURL(/\/a-propos$/);

    await nav.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/contact$/);

    await page.getByRole('link', { name: 'Tayrell' }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});
