import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('edit script with Monaco editor', async ({ page }) => {
    // Navigate to a script page
    await page.goto('/scripts/data:text/javascript,alert(1)', {waitUntil: "networkidle"});

    // Click the "Edit with Monaco" button
    await page.locator('text=Edit with Monaco').click();

    // Wait for the Monaco editor to be loaded
    await page.locator('.monaco-editor').waitFor();

    // Modify the script code in the editor by pasting or typing
    await page.locator('.monaco-editor').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.type('alert("Updated Code")');

    // Click "Close editor" and check the code is updated
    await page.locator('text=Close editor').click();
    await expect(page.locator('pre')).toHaveText('alert("Updated Code")');
});

test('install as userscript', async ({ page }) => {
    // Navigate to a script page
    await page.goto('/scripts#data:text/javascript,alert(1)', {waitUntil: "networkidle"});

    // Click the "Install as Userscript" button
    await page.locator('text=Install as Userscript').click();

    // Verify it navigates to the `/userscript/...` URL
    await expect(page).toHaveURL(/\/userscript\/.+/);

    // Get the content of the userscript
    const scriptContent = await page.textContent('body');

    // Validate the userscript headers are added correctly
    expect(scriptContent).toContain('// ==UserScript==');
    expect(scriptContent).toContain('// ==/UserScript==');

});

test('non-users cannot access logs', async ({ page }) => {
    // Try to access the `/logs` route directly
    await page.goto('/logs');

    // Verify it says 404 Not Found
    await expect(page.locator('#content')).toHaveText('404 Not Found');
});
