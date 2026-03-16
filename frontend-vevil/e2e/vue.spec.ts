import { test, expect } from '@playwright/test';

// App React: raíz redirige a dashboard o login
test('visits the app root url', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/(login|dashboard)/);
  await expect(page.locator('h1')).toContainText(/Vevil|Bienvenido/i);
})
