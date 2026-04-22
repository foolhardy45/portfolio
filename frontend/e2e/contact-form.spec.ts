import { test, expect } from '@playwright/test';

test.describe('Contact form', () => {
  test('submits and shows a success message', async ({ page }) => {
    await page.route('**/api/contact', async (route) => {
      expect(route.request().method()).toBe('POST');
      const payload = route.request().postDataJSON() as Record<string, string>;
      expect(payload).toMatchObject({
        name: 'Jane Doe',
        email: 'jane@example.com',
      });
      expect(payload['message']).toContain('portfolio');

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Message sent successfully.' }),
      });
    });

    await page.goto('/contact');

    const form = page.locator('form');
    await form.getByLabel('Nom').fill('Jane Doe');
    await form.getByLabel('Email').fill('jane@example.com');
    await form
      .getByLabel('Message')
      .fill("Bonjour, j'ai vu votre portfolio et j'aimerais en discuter.");

    await form.getByRole('button', { name: /Envoyer le message/ }).click();

    await expect(page.getByText('Message envoyé avec succès !')).toBeVisible();
  });

  test('keeps the submit button disabled while the form is invalid', async ({ page }) => {
    await page.goto('/contact');

    const form = page.locator('form');
    const submit = form.getByRole('button', { name: /Envoyer le message/ });
    await expect(submit).toBeDisabled();

    await form.getByLabel('Nom').fill('Jane');
    await form.getByLabel('Email').fill('not-an-email');
    await form.getByLabel('Message').fill('Trop court');
    await expect(submit).toBeDisabled();

    await form.getByLabel('Email').fill('jane@example.com');
    await form.getByLabel('Message').fill('Message valide de plus de dix caractères.');
    await expect(submit).toBeEnabled();
  });
});
