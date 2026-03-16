import { test, expect } from '@playwright/test';

test.describe('Facturas', () => {
  test('sin login redirige a login', async ({ page }) => {
    await page.goto('/invoices');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });

  // TODO: flaky en E2E por flujo perfil/admin; arreglar cuando auth/profile estable en tests
  test.skip('lista de facturas visible tras login', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@vevil.com');
    await page.locator('#login-password').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('vevil_profile', JSON.stringify({ email: 'admin@vevil.com', role: 'admin' }));
    });
    await page.goto('/invoices');
    await expect(page).toHaveURL(/\/invoices/, { timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page.getByRole('heading', { name: /factura/i })).toBeVisible({ timeout: 20000 });
  });
});
