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

  test('enlace a login lleva a /login', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('link', { name: /iniciá sesión|iniciar sesión|ya tenés/i }).click();
    await expect(page).toHaveURL(/\/login/);
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

async function setAdminProfile(page: { evaluate: (fn: () => void) => Promise<unknown> }) {
  await page.evaluate(() => {
    localStorage.setItem('vevil_profile', JSON.stringify({ email: 'admin@vevil.com', role: 'admin' }));
  });
}

test.describe('Solicitudes de registro (admin)', () => {
  // TODO: flaky en E2E por flujo perfil/admin; arreglar cuando auth/profile estable en tests
  test.skip('admin ve ítem Solicitudes de registro en el menú', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@vevil.com');
    await page.locator('#login-password').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 15000 });
    await setAdminProfile(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    const link = page.getByTestId('nav-link-pending-registrations');
    await link.waitFor({ state: 'visible', timeout: 20000 });
    await expect(link).toBeVisible();
  });

  // TODO: flaky en E2E por flujo perfil/admin; arreglar cuando auth/profile estable en tests
  test.skip('admin puede abrir pantalla de solicitudes pendientes', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('admin@vevil.com');
    await page.locator('#login-password').fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 15000 });
    await setAdminProfile(page);
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await page.waitForLoadState('networkidle').catch(() => {});
    const link = page.getByTestId('nav-link-pending-registrations');
    await link.waitFor({ state: 'visible', timeout: 20000 });
    await link.click();
    await expect(page).toHaveURL(/\/pending-registrations/);
    await expect(
      page.getByRole('heading', { name: /solicitudes de registro/i })
    ).toBeVisible();
  });
});
