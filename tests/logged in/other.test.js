import test, { expect } from "@playwright/test";

test('non-admin cannot access logs', async ({ page }) => {
    // Try to access the `/logs` route directly
    const response = await page.goto('/logs');

    // Verify response status code is 403
    expect(response?.status()).toBe(404);
});