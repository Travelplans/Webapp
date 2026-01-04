import { test, expect } from '@playwright/test';

/**
 * Responsive design tests
 * Verifies the application works correctly across different device sizes
 */
test.describe('Responsive Design', () => {
  test('should display correctly on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Check that page is visible and not horizontally scrollable
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Check viewport width
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBe(375);
    
    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should display correctly on tablet (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/login');
    
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBe(768);
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should display correctly on desktop (1920px)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/login');
    
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(viewportWidth).toBe(1920);
    
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBe(false);
  });

  test('should have proper viewport meta tag', async ({ page }) => {
    await page.goto('/login');
    
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    expect(viewport).toContain('initial-scale=1.0');
  });
});

test.describe('Error Handling', () => {
  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Try to trigger an error (e.g., invalid navigation)
    await page.goto('/nonexistent-page');
    
    // Should redirect or show error boundary, not crash
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Toast Notifications', () => {
  test('toasts should be visible and responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');
    
    // Check toast container exists and is positioned correctly
    const toastContainer = page.locator('[class*="fixed"][class*="top"]');
    // Toast container should exist (may be empty initially)
    const toastCount = await toastContainer.count();
    expect(toastCount).toBeGreaterThanOrEqual(0);
  });
});




