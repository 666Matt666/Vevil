import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test('muestra el formulario de login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /vevil/i })).toBeVisible();
    await expect(page.getByLabel(/email|correo/i)).toBeVisible();
    await expect(page.getByRole('textbox', { name: /contraseña/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible();
  });

  test('login con credenciales incorrectas muestra error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|correo/i).fill('noexiste@test.com');
    await page.getByRole('textbox', { name: /contraseña/i }).fill('wrong');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page.getByText(/credenciales|incorrecto|inválido|error/i)).toBeVisible({ timeout: 5000 });
  });

  test('login exitoso redirige al dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email|correo/i).fill('admin@vevil.com');
    await page.getByRole('textbox', { name: /contraseña/i }).fill('admin123');
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/(dashboard)?(\?.*)?$/, { timeout: 10000 });
  });

  test('enlace "¿Olvidaste tu contraseña?" lleva a forgot-password', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /olvidaste.*contraseña/i }).click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('enlace a registro lleva a /register', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /registrate|solicitar registro/i }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('al escribir email se muestra opción Iniciar con huella si el navegador la soporta', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email|correo/i)).toBeVisible();
    await page.getByLabel(/email|correo/i).fill('admin@vevil.com');
    // En Chromium/Chrome el botón "Iniciar con huella" aparece cuando hay email y WebAuthn está disponible
    await expect(
      page.getByRole('button', { name: /iniciar con huella|huella/i })
    ).toBeVisible({ timeout: 3000 });
  });
});
