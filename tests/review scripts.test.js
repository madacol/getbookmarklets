import { expect, test } from '@playwright/test';
import { createHash, randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { sql } from './db.js';

test.describe.configure({ mode: 'serial' });

/**
 * @param {import('@playwright/test').BrowserContext} context
 */
async function loginAsMaster(context) {
    const {rows: [user]} = await sql`
        SELECT user_id
        FROM users
        WHERE username = 'master'
    `;
    const session_id = randomUUID();
    await sql`
        INSERT INTO sessions (session_id, user_id, expires_at)
        VALUES (${session_id}, ${user.user_id}, TIMESTAMP 'infinity')
    `;
    await context.addCookies([{
        name: 'session',
        value: session_id,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax',
    }]);
    return session_id;
}

/**
 * @param {string} source
 */
function dataUrlFromSource(source) {
    return `data:text/javascript,${encodeURIComponent(source)}`;
}

/**
 * @param {import('@playwright/test').Locator} locator
 */
async function requiredBox(locator) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    return /** @type {NonNullable<typeof box>} */ (box);
}

/**
 * @param {{ x: number, y: number, width: number, height: number }} first
 * @param {{ x: number, y: number, width: number, height: number }} second
 */
function overlapArea(first, second) {
    const width = Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x));
    const height = Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
    return width * height;
}

/**
 * @param {import('node:http').Server} server
 * @returns {Promise<void>}
 */
function listen(server) {
    return new Promise((resolve) => {
        server.listen(0, '127.0.0.1', () => resolve());
    });
}

/**
 * @param {import('node:http').Server} server
 * @returns {Promise<void>}
 */
function close(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
}

test('reviewer can accept a script needing review', async ({ page, context }) => {
    await loginAsMaster(context);
    const name = `Review Accept ${randomUUID()}`;
    const source = `// @name ${name}\nalert("accepted");`;
    const source_url = dataUrlFromSource(source);
    await sql`
        INSERT INTO scripts (source_url, status, content_hash)
        VALUES (${source_url}, ${'needs_review'}, ${'0'.repeat(64)})
    `;

    await page.goto('/admin', {waitUntil: 'networkidle'});
    await expect(page.getByRole('heading', {name: 'Review Scripts'})).toBeVisible();
    const reviewItem = page.locator('main > section.queue > article').filter({
        has: page.getByRole('heading', {name})
    });
    await expect(reviewItem).toBeVisible();
    await expect(reviewItem.getByText('Saved hash')).toBeVisible();

    await reviewItem.getByRole('button', {name: 'Accept original version'}).click();

    const {rows: [script]} = await sql`
        SELECT status, content_hash
        FROM scripts
        WHERE source_url = ${source_url}
    `;
    expect(script.status).toBe('accepted');
    expect(script.content_hash).toBe(
        createHash('sha256').update(source).digest('hex')
    );
});

test('reviewer can edit a script needing review before accepting it', async ({ page, context }) => {
    await loginAsMaster(context);
    const id = randomUUID();
    const originalName = `Review Original ${id}`;
    const editedName = `Review Edited ${id}`;
    const originalSource = `// @name ${originalName}\nalert("original");`;
    const editedSource = `// @name ${editedName}\nalert("edited");`;
    const originalUrl = dataUrlFromSource(originalSource);

    await sql`
        INSERT INTO scripts (source_url, status, content_hash)
        VALUES (${originalUrl}, ${'needs_review'}, ${createHash('sha256').update(originalSource).digest('hex')})
    `;

    await page.goto('/admin', {waitUntil: 'networkidle'});
    const reviewItem = page.locator('main > section.queue > article').filter({
        has: page.getByRole('heading', {name: originalName})
    });
    await expect(reviewItem).toBeVisible();

    await reviewItem.getByRole('button', {name: /Edit/}).click();
    await reviewItem.locator('.cm-content').click();
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await page.keyboard.insertText(editedSource);
    const editedReviewItem = page.locator('main > section.queue > article').filter({
        has: page.getByRole('heading', {name: editedName})
    });
    await expect(editedReviewItem).toBeVisible();
    await expect(editedReviewItem.getByText('Unsaved edits')).toBeVisible();
    await expect(editedReviewItem.getByText('Edited hash preview')).toBeVisible();
    await expect(editedReviewItem.getByText(
        createHash('sha256').update(editedSource).digest('hex')
    )).toBeVisible();

    await editedReviewItem.getByRole('button', {name: 'Accept edited version'}).click();

    const editedUrl = dataUrlFromSource(editedSource);
    const {rows: [script]} = await sql`
        SELECT status, source_url, content_hash
        FROM scripts
        WHERE source_url = ${editedUrl}
    `;
    expect(script.status).toBe('accepted');
    expect(script.source_url).toBe(editedUrl);
    expect(script.content_hash).toBe(createHash('sha256').update(editedSource).digest('hex'));

    const {rows: [oldScript]} = await sql`
        SELECT COUNT(*)::int AS count
        FROM scripts
        WHERE source_url = ${originalUrl}
    `;
    expect(oldScript.count).toBe(0);
});

test('reviewer can reject a script needing review', async ({ page, context }) => {
    await loginAsMaster(context);
    const name = `Review Reject ${randomUUID()}`;
    const source = `// @name ${name}\nalert("rejected");`;
    const source_url = dataUrlFromSource(source);
    await sql`
        INSERT INTO scripts (source_url, status, content_hash)
        VALUES (${source_url}, ${'needs_review'}, ${'0'.repeat(64)})
    `;

    await page.goto('/admin', {waitUntil: 'networkidle'});
    const reviewItem = page.locator('main > section.queue > article').filter({
        has: page.getByRole('heading', {name})
    });
    await expect(reviewItem).toBeVisible();

    await reviewItem.getByRole('button', {name: 'Reject'}).click();

    const {rows: [script]} = await sql`
        SELECT status
        FROM scripts
        WHERE source_url = ${source_url}
    `;
    expect(script.status).toBe('rejected');
});

test('content changed signal marks an accepted script as needing review', async ({ page }) => {
    const source_url = dataUrlFromSource(`alert("changed ${randomUUID()}");`);
    await sql`
        INSERT INTO scripts (source_url, status, content_hash)
        VALUES (${source_url}, ${'accepted'}, ${'0'.repeat(64)})
    `;

    const response = await page.request.post(`/signal/content-changed/${encodeURIComponent(source_url)}`);
    expect(response.status()).toBe(200);

    const {rows: [script]} = await sql`
        SELECT status
        FROM scripts
        WHERE source_url = ${source_url}
    `;
    expect(script.status).toBe('needs_review');
});

test('homepage only shows accepted scripts', async ({ page }) => {
    const id = randomUUID();
    const acceptedName = `Accepted Public ${id}`;
    const reviewName = `Needs Review Private ${id}`;
    const acceptedUrl = dataUrlFromSource(`// @name ${acceptedName}\nalert("accepted");`);
    const reviewUrl = dataUrlFromSource(`// @name ${reviewName}\nalert("review");`);

    await sql`
        INSERT INTO scripts (source_url, status, content_hash)
        VALUES
            (${acceptedUrl}, ${'accepted'}, ${createHash('sha256').update(`// @name ${acceptedName}\nalert("accepted");`).digest('hex')}),
            (${reviewUrl}, ${'needs_review'}, ${createHash('sha256').update(`// @name ${reviewName}\nalert("review");`).digest('hex')})
    `;

    await page.goto('/', {waitUntil: 'networkidle'});

    await expect(page.getByRole('heading', {name: acceptedName})).toBeVisible();
    await expect(page.getByRole('heading', {name: reviewName})).toHaveCount(0);
});

test('admin lists other scripts newest first and can edit or delete them', async ({ page, context }) => {
    await loginAsMaster(context);
    const id = randomUUID();
    const oldName = `Managed Old ${id}`;
    const newName = `Managed New ${id}`;
    const editedName = `Managed Edited ${id}`;
    const oldSource = `// @name ${oldName}\nalert("old");`;
    const newSource = `// @name ${newName}\nalert("new");`;
    const editedSource = `// @name ${editedName}\nalert("edited");`;
    const oldUrl = dataUrlFromSource(oldSource);
    const newUrl = dataUrlFromSource(newSource);
    const editedUrl = dataUrlFromSource(editedSource);

    await sql`
        INSERT INTO scripts (source_url, status, content_hash, created_at)
        VALUES
            (${oldUrl}, ${'accepted'}, ${createHash('sha256').update(oldSource).digest('hex')}, NOW() - INTERVAL '1 day'),
            (${newUrl}, ${'rejected'}, ${createHash('sha256').update(newSource).digest('hex')}, NOW())
    `;

    await page.goto('/admin', {waitUntil: 'networkidle'});

    const managed = page.locator('section.managed');
    const matchingItems = managed.locator('article.managed-script').filter({hasText: id});

    await expect(matchingItems).toHaveCount(2);
    await expect(matchingItems.nth(0).getByRole('heading', {name: newName})).toBeVisible();
    await expect(matchingItems.nth(1).getByRole('heading', {name: oldName})).toBeVisible();

    await matchingItems.nth(1).locator('textarea[name="source_url"]').fill(editedUrl);
    await matchingItems.nth(1).locator('select[name="status"]').selectOption('accepted');
    await matchingItems.nth(1).getByRole('button', {name: 'Save'}).click();

    await expect(managed.getByRole('heading', {name: editedName})).toBeVisible();
    const {rows: [updatedScript]} = await sql`
        SELECT status, content_hash
        FROM scripts
        WHERE source_url = ${editedUrl}
    `;
    expect(updatedScript.status).toBe('accepted');
    expect(updatedScript.content_hash).toBe(createHash('sha256').update(editedSource).digest('hex'));

    page.once('dialog', dialog => dialog.accept());
    await managed.locator('article.managed-script')
        .filter({has: page.getByRole('heading', {name: editedName})})
        .getByRole('button', {name: 'Delete'})
        .click();

    await expect(managed.getByRole('heading', {name: editedName})).toHaveCount(0);
    const {rows: [deletedScript]} = await sql`
        SELECT COUNT(*)::int AS count
        FROM scripts
        WHERE source_url = ${editedUrl}
    `;
    expect(deletedScript.count).toBe(0);
});

test('admin mobile install controls do not overlap', async ({ page, context }) => {
    await page.setViewportSize({width: 432, height: 900});
    await loginAsMaster(context);
    const id = randomUUID();
    const name = `Mobile Managed ${id}`;
    const source = `// @name ${name}\nalert("mobile");`;
    const sourceUrl = dataUrlFromSource(source);

    await sql`
        INSERT INTO scripts (source_url, status, content_hash)
        VALUES (${sourceUrl}, ${'accepted'}, ${createHash('sha256').update(source).digest('hex')})
    `;

    await page.goto('/admin', {waitUntil: 'networkidle'});
    const managedItem = page.locator('article.managed-script').filter({
        has: page.getByRole('heading', {name})
    });
    await expect(managedItem).toBeVisible();

    const installControls = await managedItem.locator('.install').evaluate((row) => {
        const combo = row.firstElementChild;
        const share = row.children.item(1);
        const installButton = combo?.querySelector('a div');
        const installMenu = combo?.querySelector('button[aria-label="Install options"]');
        const shareButton = share?.querySelector('div');
        if (!installButton || !installMenu || !shareButton) {
            return null;
        }

        /**
         * @param {Element} element
         */
        function box(element) {
            const rect = element.getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        }

        return {
            installButton: box(installButton),
            installMenu: box(installMenu),
            shareButton: box(shareButton)
        };
    });
    expect(installControls).not.toBeNull();
    const {installButton, installMenu, shareButton} = /** @type {NonNullable<typeof installControls>} */ (installControls);

    expect(overlapArea(installButton, installMenu)).toBe(0);
    expect(overlapArea(installButton, shareButton)).toBe(0);
    expect(overlapArea(installMenu, shareButton)).toBe(0);
    expect(Math.abs(installButton.y - installMenu.y)).toBeLessThan(1);
    expect(Math.abs(installButton.y - shareButton.y)).toBeLessThan(1);
    expect(Math.abs(installButton.height - installMenu.height)).toBeLessThan(1);
    expect(Math.abs(installButton.height - shareButton.height)).toBeLessThan(1);
    expect(installMenu.x).toBeGreaterThan(installButton.x + installButton.width - 1);
    expect(shareButton.x).toBeGreaterThan(installMenu.x + installMenu.width);

    await managedItem.getByRole('button', {name: 'Install options'}).click();
    const userscriptOption = managedItem.getByRole('menuitem', {name: 'Install as Userscript'});
    await expect(userscriptOption).toBeVisible();
    await expect.poll(async () => {
        return userscriptOption.evaluate((element) => {
            const rect = element.getBoundingClientRect();
            const target = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
            return target ? element.contains(target) : false;
        });
    }).toBe(true);
});

test('homepage hides scripts whose fetched content no longer matches the reviewed hash', async ({ page }) => {
    const id = randomUUID();
    const reviewedSource = `// @name Reviewed ${id}\nalert("reviewed");`;
    const changedSource = `// @name Changed ${id}\nalert("changed");`;

    const server = createServer((_, response) => {
        response.setHeader('access-control-allow-origin', '*');
        response.setHeader('content-type', 'text/javascript');
        response.end(changedSource);
    });

    await listen(server);

    try {
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected local HTTP server address');
        const source_url = `http://127.0.0.1:${address.port}/reviewed.js`;

        await sql`
            INSERT INTO scripts (source_url, status, content_hash)
            VALUES (${source_url}, ${'accepted'}, ${createHash('sha256').update(reviewedSource).digest('hex')})
        `;

        await page.goto('/', {waitUntil: 'networkidle'});

        await expect(page.getByRole('heading', {name: `Changed ${id}`})).toHaveCount(0);
        await expect.poll(async () => {
            const {rows: [script]} = await sql`
                SELECT status
                FROM scripts
                WHERE source_url = ${source_url}
            `;
            return script.status;
        }).toBe('needs_review');
    } finally {
        await close(server);
    }
});
