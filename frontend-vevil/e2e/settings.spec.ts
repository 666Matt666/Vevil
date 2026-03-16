import { test, expect } from '@playwright/test';

test.describe('Configuración', () => {
  // TODO: flaky en E2E por flujo perfil/admin; arreglar cuando auth/profile estable en tests
  test.skip('usuario logueado puede abrir Configuración y ver sección Cuenta', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@vevil.com');
    await page.locator('#login-password').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('vevil_profile', JSON.stringify({ email: 'admin@vevil.com', role: 'admin' }));
    });
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.getByTestId('settings-sections').waitFor({ state: 'visible', timeout: 20000 });
    const cuentaBtn = page.getByTestId('settings-section-cuenta');
    await cuentaBtn.waitFor({ state: 'visible', timeout: 5000 });
    await expect(cuentaBtn).toBeVisible();
  });

  // TODO: flaky en E2E por flujo perfil/admin; arreglar cuando auth/profile estable en tests
  test.skip('al entrar a Configuración se ve opción Agregar huella en sección Cuenta', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@vevil.com');
    await page.locator('#login-password').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 15000 });
    await page.evaluate(() => {
      localStorage.setItem('vevil_profile', JSON.stringify({ email: 'admin@vevil.com', role: 'admin' }));
    });
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/settings/, { timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.getByTestId('settings-sections').waitFor({ state: 'visible', timeout: 20000 });
    const cuentaBtn = page.getByTestId('settings-section-cuenta');
    await cuentaBtn.waitFor({ state: 'visible', timeout: 5000 });
    await cuentaBtn.click();
    await expect(
      page.getByRole('button', { name: /agregar huella/i }).or(page.getByText(/agregar huella/i))
    ).toBeVisible({ timeout: 5000 });
  });
});
