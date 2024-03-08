import { test, expect } from "@playwright/test";
import sourceCode from "./.assets/Highlight text bookmarklet.js";

test('add script', async ({ page }) => {

    const randomString = Math.random().toString(36).substring(7);

    await page.route(`*/**/${randomString}`, async route => {
        await route.fulfill({
            status: 200,
            contentType: 'application/javascript',
            body: sourceCode
        });
    })

    await page.goto('/scripts/add', {waitUntil: "networkidle"}); // Navigate to the page with the form

    // Fill the input field with a URL
    await page.fill('[name=source_url]', randomString);

    // Submit the form by clicking the submission button
    await page.click('[type=submit]');

    // Verify the url is correct
    await expect(page.locator('.source')).toHaveText(sourceCode)

});