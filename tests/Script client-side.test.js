import { test, expect } from '@playwright/test';

test('paste url', async ({ page }) => {

    await page.goto('/scripts/add', {waitUntil: "networkidle"});

    const scriptURL = "data:text/javascript,%2F%2F%20%40name%20test%20name%0A%2F%2F%20%40description%20asdadsad";

    // Fill the input field with a URL
    const source_url_locator = await page.getByPlaceholder('Source url')
    await source_url_locator.click();

    // This is just a hack to put the URL in the clipboard
    await source_url_locator.fill(scriptURL);
    await source_url_locator.press('Control+a');
    await source_url_locator.press('Control+c');
    await source_url_locator.fill('');

    // Refresh the page to undo the hack
    await page.reload();

    // Validate the input field is focused
    await expect(source_url_locator).toBeFocused();

    // Paste the URL from the clipboard
    await source_url_locator.press('Control+v');

    // Validate Script loaded correctly
    await expect(page.getByRole('heading', { name: 'test name', exact: true })).toBeVisible();

});