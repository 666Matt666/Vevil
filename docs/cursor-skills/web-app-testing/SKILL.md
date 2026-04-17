# Web Application Testing (Skill Completo)

Fuente: https://skills.sh/anthropics/skills/web-app-testing
Repositorio: https://github.com/anthropics/skills (private, skill description public)

## Overview

Comprehensive guide for testing modern web applications including forms, accessibility (a11y), responsive design, file operations, service workers, performance (Core Web Vitals), error states, and internationalization.

## 1. Form Testing

### What to Test
- Required field validation
- Format validation (email, phone, dates, numbers)
- Min/max lengths
- Submit error handling (server errors, network failures)
- Loading states during submission
- Disabled state prevention (double-submit)

### Example
```typescript
test('Invoice form validates required fields', async ({ page }) => {
  await page.goto('/invoices/new');
  await page.getByRole('button', { name: 'Create' }).click();
  
  // Required field errors
  await expect(page.getByText('Customer is required')).toBeVisible();
  await expect(page.getByText('At least one item is required')).toBeVisible();
  
  // Fill and submit
  await page.getByLabel('Customer').selectOption('1');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page).toHaveURL('/invoices');
});
```

## 2. Accessibility (a11y)

### WCAG 2.1 AA Requirements
- **Contrast ratio**: 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation**: Tab order logical, visible focus indicator
- **ARIA labels**: Buttons with only icons need `aria-label`
- **Headings**: H1 → H2 → H3, no skipping levels
- **Skip links**: "Skip to main content" for keyboard users

### Tools
- Playwright: `await page.accessibility.snapshot()`
- axe-core integration: `@axe-core/playwright`
- Color contrast: WebAIM Contrast Checker

### Common Issues in Vevil
- Icon-only buttons: add `aria-label="Edit customer"`
- Modal focus trap (enforce focus inside modal)
- Form labels properly associated with inputs

## 3. Responsive & Mobile Testing

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Mobile-specific
- Touch targets: minimum 44x44px
- Swipe gestures for carousels/tables
- Pinch-to-zoom not blocked (avoid `user-scalable=no`)
- Viewport meta tag present

### Playwright
```typescript
test('Accounts page is responsive', async ({ page }) => {
  // Mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/accounts');
  await expect(page.getByText('Cuentas Corrientes')).toBeVisible();
  // Menu hamburger visible
  await expect(page.getByLabel('Menú')).toBeVisible();
  
  // Desktop
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator('aside')).toBeVisible(); // sidebar
});
```

## 4. File Operations

### Upload
```typescript
test('Upload product image', async ({ page }) => {
  await page.goto('/products/new');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/product-image.jpg');
  await expect(page.getByText('Preview')).toBeVisible();
});
```
- Validate file type, size
- Progress indicator for large files
- Multiple file upload

### Download
```typescript
test('Download invoice PDF', async ({ page }) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download PDF' }).click()
  ]);
  const path = await download.path();
  expect(await download.suggestedFilename()).toContain('invoice-');
});
```

## 5. Error State Testing

### Network Failures
```typescript
test('Handles API errors gracefully', async ({ page }) => {
  await page.route('/api/invoices', route => {
    route.abort('failed'); // Simulate network error
  });
  await page.goto('/invoices');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('Network error')).toBeVisible();
});
```

### Offline Mode
```typescript
test('App works offline (PWA)', async ({ page }) => {
  await page.goto('/');
  await page.context().setOffline(true);
  await expect(page.getByText('You are offline')).toBeVisible();
});
```

### Error Boundaries
- Simulate component errors (throw in React component)
- Verify fallback UI appears
- Verify error logged to monitoring

## 6. Service Workers & PWA

```typescript
test('PWA install prompt', async ({ page }) => {
  await page.addInitScript(() => {
    // Mock beforeinstallprompt
    Object.defineProperty(window, 'beforeinstallprompt', {
      value: () => ({ prompt: () => Promise.resolve() })
    });
  });
  await page.goto('/');
  // Verify install button appears
});
```

## 7. Performance (Core Web Vitals)

### Metrics to Measure
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **TTFB** (Time to First Byte): < 600ms

### Playwright Measurement
```typescript
import { metrics } from '@playwright/test';

test('Performance budget', async ({ page }) => {
  await page.goto('/');
  const metrics = await page.evaluate(() => {
    const [lcp, inp, cls] = await Promise.all([
      performance.getEntriesByType('largest-contentful-paint')[0],
      performance.getEntriesByType('first-input')[0],
      performance.getEntriesByType('layout-shift')
    ]);
    return {
      lcp: lcp?.startTime,
      inp: inp?.processingStart - inp?.startTime,
      cls: cls.reduce((sum, entry) => sum + entry.value, 0)
    };
  });
  
  expect(metrics.lcp).toBeLessThan(2500);
  expect(metrics.inp).toBeLessThan(200);
  expect(metrics.cls).toBeLessThan(0.1);
});
```

## 8. Internationalization (i18n)

```typescript
test('Spanish locale', async ({ page }) => {
  await page.goto('/?lang=es');
  await expect(page.getByText('Cuentas Corrientes')).toBeVisible();
});

test('RTL language (Arabic)', async ({ page }) => {
  await page.goto('/?lang=ar');
  const sidebar = page.locator('aside');
  const box = await sidebar.boundingBox();
  expect(box.x).toBeGreaterThan(window.innerWidth / 2); // Right-aligned
});
```

## 9. Security Testing

### XSS Prevention
```typescript
test('XSS in customer name is escaped', async ({ page }) => {
  const xss = '<script>alert("xss")</script>';
  await page.goto(`/customers?name=${encodeURIComponent(xss)}`);
  // Should NOT execute script
  await expect(page.locator('script')).toHaveCount(0);
});
```

### CSRF
- Verify CSRF tokens present on forms
- Test with invalid token → reject

### Authentication Bypass
- Try accessing admin routes as regular user → 403
- Test JWT expiration

## 10. Common Pitfalls to Avoid

❌ **Don't**:
- Use `waitForTimeout(5000)` arbitrary waits
- Test internal state (implementation details)
- Mix E2E and unit tests
- Hardcode credentials in test files
- Use `page.locator('css: nth-child(3)')` - brittle

✅ **Do**:
- Use environment variables for secrets
- Run tests in headless mode in CI, headed locally
- `test.describe.configure({ mode: 'serial' })` when order matters
- Take screenshots on failure: `{ screenshot: 'only-on-failure' }`
- Use `test.fail()` para tests temporarily skipped

## Vevil Test Plan

### Priority 1 (P0 - Core Flows)
1. **Login/Logout** - auth flow
2. **Create Invoice** - main business logic
3. **Register Payment** - cash flow
4. **Toggle Backup** - admin critical feature
5. **Low Stock Alert** - notifications work

### Priority 2 (P1 - Important)
6. **Export CSV/PDF** - data export
7. **Customer Management** - CRUD
8. **Product CRUD** - inventory
9. **Responsive: Mobile** - accounts page
10. **A11y**: keyboard navigation modals

### Priority 3 (P2 - Nice to Have)
11. Visual regression (dashboard)
12. Performance: LCP/INP budgets
13. i18n (Spanish/English toggle)
14. Offline PWA behavior

## Implementation Status

- [x] Playwright installed
- [ ] E2E tests directory created (`frontend-vevil/e2e/`)
- [ ] `playwright.config.ts` setup
- [ ] Auth fixtures implemented
- [ ] Page objects: `LoginPage`, `InvoicePage`, `AccountsPage`
- [ ] CI integration (GitHub Actions workflow)
- [ ] Test coverage: Target 60% user journeys

## References

Full skill documentation: `.cursor/rules/web-app-testing.mdc`  
Online: https://skills.sh/anthropics/skills/web-app-testing

Related skills:
- `playwright-best-practices` - testing framework specifics
- `vercel-react-best-practices` - performance testing guidance
- `accessibility` (future skill to add)

---

**Category**: Testing  
**Impact**: HIGH (critical user flows)  
**Effort**: MEDIUM (requires test infrastructure)  
**Priority**: P0 (core flows first)
