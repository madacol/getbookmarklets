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

    await reviewItem.getByRole('button', {name: 'Accept'}).click();

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
