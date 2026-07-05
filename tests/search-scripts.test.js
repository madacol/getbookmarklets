import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import { sql } from './db.js';

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

test('search filters scripts on the homepage', async ({ page }) => {
    const id = randomUUID();
    const alphaName = `Search Alpha ${id}`;
    const betaName = `Search Beta ${id}`;
    const alphaSource = `// @name ${alphaName}\n// @description first searchable script\nconst searchToken = "only-alpha-${id}";`;
    const betaSource = `// @name ${betaName}\n// @description second searchable script\nconst searchToken = "only-beta-${id}";`;
    /** @type {() => void} */
    let releaseAlpha = () => {};
    /** @type {Promise<void>} */
    const alphaReleased = new Promise((resolve) => {
        releaseAlpha = resolve;
    });
    const server = createServer((request, response) => {
        response.setHeader('access-control-allow-origin', '*');
        response.setHeader('content-type', 'text/javascript');
        if (request.url === '/alpha.js') {
            alphaReleased.then(() => response.end(alphaSource));
        } else if (request.url === '/beta.js') {
            response.end(betaSource);
        } else {
            response.statusCode = 404;
            response.end('Not found');
        }
    });

    await listen(server);

    try {
        const address = server.address();
        if (!address || typeof address === 'string') throw new Error('Expected local HTTP server address');
        const { port } = address;
        const alphaUrl = `http://127.0.0.1:${port}/alpha.js`;
        const betaUrl = `http://127.0.0.1:${port}/beta.js`;

        await sql`DELETE FROM scripts`;
        await sql`
            INSERT INTO scripts (source_url, status, content_hash)
            VALUES
                (${alphaUrl}, ${'accepted'}, ${createHash('sha256').update(alphaSource).digest('hex')}),
                (${betaUrl}, ${'accepted'}, ${createHash('sha256').update(betaSource).digest('hex')})
        `;

        await page.goto('/', {waitUntil: 'domcontentloaded'});
        const alphaCard = page.getByTestId('script-card').filter({hasText: alphaUrl});
        const betaCard = page.getByTestId('script-card').filter({hasText: betaUrl});
        await expect(alphaCard).toBeVisible();
        await expect(betaCard).toBeVisible();
        await expect(page.getByRole('heading', {name: betaName})).toBeVisible();

        const searchInput = page.getByLabel('Search scripts');
        await searchInput.fill(`only-alpha-${id}`);
        releaseAlpha();

        await expect(alphaCard).toBeVisible();
        await expect(betaCard).toBeHidden();
        await expect(page.getByText('1 of 2 scripts')).toBeVisible();

        await searchInput.fill(`missing-${id}`);
        await expect(page.getByText('No scripts match')).toBeVisible();
        await expect(page.getByText(`"missing-${id}"`)).toBeVisible();
    } finally {
        releaseAlpha();
        await close(server);
    }
});
