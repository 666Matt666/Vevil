import { test, expect } from '@playwright/test';

test.describe('Solicitud de registro', () => {
  test('muestra formulario de solicitud de registro', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByRole('heading', { name: /vevil/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /solicitar registro/i })).toBeVisible();
    await expect(page.getByLabel(/nombre/i).first()).toBeVisible();
    await expect(page.getByLabel(/apellido/i)).toBeVisible();
    await expect(page.getByLabel(/correo/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /enviar solicitud/i })).toBeVisible();
  });

  test('al enviar solicitud muestra mensaje de revisar correo', async ({ page }) => {
    await page.goto('/register');
    await page.getByLabel(/nombre/i).first().fill('E2E Test');
    await page.getByLabel(/correo/i).fill(`e2e-${Date.now()}@test.com`);
    await page.getByRole('button', { name: /enviar solicitud/i }).click();
    await expect(
      page.getByText(/revisá tu correo|revisa tu correo|enviado|confirmar/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test('enlace a confirmar sin token muestra error', async ({ page }) => {
    await page.goto('/confirm-registration');
    await expect(
      page.getByText(/falta|inválido|expirado|enlace/i)
    ).toBeVisible({ timeout: 5000 });
  });

  test('confirmación con token inválido muestra mensaje de error', async ({ page }) => {
    await page.goto('/confirm-registration?token=token-invalido-123');
    await expect(
      page.getByText(/inválido|expirado|no es válido/i)
    ).toBeVisible({ timeout: 8000 });
  });
});

test.describe('Solicitudes de registro (admin)', () => {
  test('admin ve ítem Solicitudes de registro en el menú', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|correo/i).fill('admin@vevil.com');
    await page.getByLabel(/contraseña|password/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 10000 });
    await expect(
      page.getByRole('link', { name: /solicitudes de registro/i })
    ).toBeVisible({ timeout: 5000 });
  });

  test('admin puede abrir pantalla de solicitudes pendientes', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|correo/i).fill('admin@vevil.com');
    await page.getByLabel(/contraseña|password/i).fill('admin123');
    await page.getByRole('button', { name: /iniciar|entrar|login/i }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 10000 });
    await page.getByRole('link', { name: /solicitudes de registro/i }).click();
    await expect(page).toHaveURL(/\/pending-registrations/);
    await expect(
      page.getByRole('heading', { name: /solicitudes de registro/i })
    ).toBeVisible();
  });
});
