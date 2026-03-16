import { test, expect } from '@playwright/test';

test.describe('Auditoría', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|correo/i).fill('admin@vevil.com');
    await page.getByRole('textbox', { name: /contraseña/i }).fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 10000 });
  });

  test('ruta /audit muestra la pantalla de auditoría', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.getByRole('heading', { name: /auditoría/i })).toBeVisible({ timeout: 5000 });
  });

  test('hay filtros y botón Aplicar', async ({ page }) => {
    await page.goto('/audit');
    await expect(page.getByRole('heading', { name: /auditoría/i })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: /aplicar/i })).toBeVisible();
  });

  test('navegación desde menú lateral lleva a /audit', async ({ page }) => {
    await page.getByRole('link', { name: /auditoría/i }).click();
    await expect(page).toHaveURL(/\/audit/);
    await expect(page.getByRole('heading', { name: /auditoría/i })).toBeVisible({ timeout: 5000 });
  });
});
