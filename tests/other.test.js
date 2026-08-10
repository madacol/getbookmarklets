import { expect, test } from '@playwright/test';

test.describe.configure({ mode: 'parallel' });

test('CodeMirror highlights JavaScript after mounting', async ({ page }) => {
    await page.goto('/scripts/data:text/javascript,alert(1)', {waitUntil: "networkidle"});

    await page.getByRole('button', { name: /Edit/ }).click();

    await expect.poll(async () => page.locator('.cm-content span').count()).toBeGreaterThan(0);
});

test('CodeMirror suggests browser DOM APIs from TypeScript intelligence', async ({ page }) => {
    test.setTimeout(40000);

    await page.goto('/scripts/add', {waitUntil: "networkidle"});

    await page.locator('label.tab-label').filter({ hasText: 'From Code' }).click();
    await expect(page.locator('input[name="tab"][value="code"]')).toBeChecked();
    await expect(page.locator('.cm-content')).toBeVisible();
    await page.locator('.cm-content').click();
    await page.keyboard.insertText("document.querySelector('button').ad");
    await page.keyboard.press('Control+Space');

    await expect(page.locator('.cm-tooltip-autocomplete')).toContainText('addEventListener', { timeout: 30000 });
});

test('edit script with CodeMirror editor', async ({ page }) => {
    // Navigate to a script page
    await page.goto('/scripts/data:text/javascript,alert(1)', {waitUntil: "networkidle"});

    // Click the edit button
    await page.getByRole('button', { name: /Edit/ }).click();

    // Modify the script code in the editor by pasting or typing
    await page.locator('.cm-content').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('Backspace');
    await page.keyboard.insertText(`alert('Hello, world!');\nalert('\\/\`"{[&%20%0A%0D%09');`);

    // Click "Close editor" and check the code is updated
    await page.locator('text=Close editor').click();
    await expect(page.locator('pre')).toHaveText(`alert('Hello, world!');\nalert('\\/\`"{[&%20%0A%0D%09');`);
});

test('install as userscript', async ({ page }) => {
    // Navigate to a script page
    await page.goto('/scripts/add', {waitUntil: "networkidle"});

    const sourceWithSpecialChars = /*js*/ `alert('Hello, world!');
    alert('\\/\`"{[&%20%0A%0D%09');`;

    await page.getByText('From Code').click();

    // Fill in the CodeMirror editor with the source code
    await page.locator('.cm-content').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.insertText(sourceWithSpecialChars);

    // Open the install menu and click the "Install as Userscript" option
    await page.getByLabel('Install options').click();
    await page.locator('text=Install as Userscript').click();

    // Verify it navigates to the `/userscript/...` URL
    await expect(page).toHaveURL(/\/userscript\/.+/);

    // Get the content of the userscript
    const scriptContent = await page.textContent('body');

    // Validate the userscript headers are added correctly
    expect(scriptContent).toContain('// ==UserScript==');
    expect(scriptContent).toContain('// ==/UserScript==');
    expect(scriptContent).toContain(sourceWithSpecialChars);
});

test('non-users cannot access logs', async ({ page }) => {
    // Try to access the `/logs` route directly
    await page.goto('/logs');

    // Verify it says 404 Not Found
    await expect(page.locator('#content')).toHaveText('404 Not Found');
});
