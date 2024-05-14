import { test, expect } from "@playwright/test";

test.describe.configure({ mode: 'parallel' });

test.beforeEach(async ({ page }) => {
    await page.goto('/scripts/add', {waitUntil: "networkidle"}); // Navigate to the login page
});

import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sql } from "../db";
test('add an HTTP script', async ({ page }) => {

    // Serve the testing script located in `./.assets/Highlight text bookmarklet.js`
    const fileBuffer = await readFile(join(dirname(fileURLToPath(import.meta.url)), '.assets/Highlight text bookmarklet.js'));
    const server = createServer(async (_, res) => {
        // set content type and allow cross-origin requests
        res.setHeader('Content-Type', 'application/javascript');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(fileBuffer, 'utf-8');
    }).listen(3000);


    const test_url = `http://localhost:3000/Highlight%20text%20bookmarklet.js`
    await sql`DELETE FROM scripts WHERE source_url = ${test_url}`
    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill(test_url);

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the url is correct
    await page.waitForURL('/scripts/' + encodeURIComponent(test_url));

    // verify source code is correct
    await expect(page.locator('pre')).toHaveText(fileBuffer.toString());

    // Close the server
    server.close();

});

test.describe('add dataURL', () => {

    test.describe.configure({ mode: 'serial' });
    const testDataURL = 'data:text/javascript,alert("hello"); alert("world");';

    test('add', async ({ page }) => {
        await sql`DELETE FROM scripts WHERE source_url = ${testDataURL}`
        // Fill the input field with a URL
        await page.locator('[name=source_url]').fill(testDataURL);

        // Submit the form by clicking the submission button
        await page.locator('[type=submit]').click();

        // Verify the url is correct
        await page.waitForURL('/scripts/' + encodeURIComponent(testDataURL));

    });

    test('duplicate script', async ({ page }) => {

        // Enter a script URL that already exists for that user
        await page.locator('textarea[name="source_url"]').fill(testDataURL);

        // Submit the form
        await page.getByRole('button', { name: 'Add Script' }).click();

        // Verify error message is shown that URL already exists
        await expect(page.locator('.server.error')).toContainText('URL already exists in database');
    });
});

test('invalid URL', async ({ page }) => {

    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill('invalid');

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText('URL must be HTTP or DataURL');

});

test('invalid URL response', async ({ page }) => {

    // get current page URL domain
    const { origin } = new URL(page.url());
    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill(origin + '/invalid');

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText("URL's server did not respond with 200 OK");

});

test('invalid domain', async ({ page }) => {

    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill('http://invalid');

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText("failed to fetch URL");

});

test('invalid URL cross-origin', async ({ page }) => {

    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill('http://example.com');

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText("URL's server does not allow cross-origin requests");

});

test('invalid URL size', async ({ page }) => {

    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill('data:text/javascript,' + 'a'.repeat(11000));

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText("URL is too large");

});

test('invalid URL type', async ({ page }) => {

    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill('ftp://example.com');

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText("URL must be HTTP or DataURL");

});

test('invalid JavaScript', async ({ page }) => {

    // Fill the input field with a URL
    await page.locator('[name=source_url]').fill('data:text/javascript,const');

    // Submit the form by clicking the submission button
    await page.locator('[type=submit]').click();

    // Verify the error message is displayed
    await expect(page.locator('.server.error')).toContainText('DataURL is not valid JavaScript');

});

test('URL encoding/decoding', async ({ page }) => {
    // Add a new script with URL containing special characters
    const specialCharsUrl = 'data:text/javascript,alert("Hello World!?/=+");'
    await sql`DELETE FROM scripts WHERE source_url = ${specialCharsUrl}`
    await page.locator('textarea[name="source_url"]').fill(specialCharsUrl);

    // Verify the URL is encoded and decoded correctly by the textarea after refresh
    await page.reload();
    await expect(page.locator('textarea[name="source_url"]')).toHaveValue(specialCharsUrl);

    await page.locator('[type=submit]').click();

    // Replace `(` with `\(` and `)` with `\)` to escape them in regex
    const regexEscapedUrl = encodeURIComponent(specialCharsUrl).replace(/[()]/g,'\\$&')

    // Verify the URL is encoded in the path
    await expect(page).toHaveURL(new RegExp('/scripts/' + regexEscapedUrl));

    // Check the exact same URL is reconstructed in the href
    await expect(page.locator('.source_url > a')).toHaveAttribute('href', specialCharsUrl)
});
