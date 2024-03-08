import { expect, test } from '@playwright/test';

test('signup', async ({ page }) => {
    // Go to the signup page
    await page.goto('/', {waitUntil: "networkidle"});

    // Click the signin link
    await page.getByRole('link', {name: 'Sign in'}).click();
    await expect(page.locator('#profile')).not.toBeVisible();

    // Click the signup link
    await page.getByRole('link', {name: 'Sign up'}).click();

    await page.waitForURL('/signup/');

    // get a random string
    const username_and_password = Math.random().toString(36).substring(3);

    // Fill the username field
    await page.locator('[name=username]').fill(username_and_password);

    // Fill all password fields
    const passwordFields = await page.locator('[type=password]').all();
    expect.soft(passwordFields.length).toBe(2);
    await passwordFields[0].fill(username_and_password);
    await passwordFields[1].fill(username_and_password);

    await expect(page.locator('.error')).toBeEmpty()

    // Submit the form
    await page.click('[type=submit]');

    // wait for navigation
    await page.waitForURL('/')

    // check it is logged in
    await expect(page.locator('#profile')).toBeVisible();
    await expect(page.getByRole('link', {name: 'Sign in'})).not.toBeVisible();

    await page.context().storageState({ path: 'tests/.auth/user.json' });
});
