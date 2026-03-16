import { test, expect } from '@playwright/test';

test.describe('Recuperar contraseña', () => {
  test('muestra formulario de olvidé contraseña', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { name: /vevil/i })).toBeVisible();
    await expect(page.getByText(/recuperar|restablecer/i).first()).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar|enlace/i })).toBeVisible();
  });

  test('al enviar email muestra mensaje de éxito', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /enviar|enlace/i }).click();
    await expect(page.getByText(/recibirás|instrucciones|bandeja|spam/i).first()).toBeVisible({ timeout: 8000 });
  });

  test('enlace a reset sin token muestra mensaje inválido', async ({ page }) => {
    await page.goto('/reset-password');
    await expect(page.getByText(/inválido|expirado|válido/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('link').filter({ hasText: /solicitar|recuperar|olvidaste/i })).toBeVisible();
  });

  test('reset con token en URL muestra formulario de nueva contraseña', async ({ page }) => {
    await page.goto('/reset-password?token=alguntoken');
    await expect(page.getByText(/nueva contraseña/i).first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.getByRole('button', { name: /restablecer/i })).toBeVisible();
  });
});
