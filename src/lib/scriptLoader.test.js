import { describe, expect, it } from 'vitest';
import { createBrowserScriptContentHash, loadScriptSource } from './scriptLoader.js';

/**
 * @param {{ ok?: boolean, body?: string | null }} options
 */
function createFetch({ ok = true, body = 'javascript:alert(1)' } = {}) {
	/** @type {typeof fetch} */
	const fetcher = async () => new Response(body ?? '', { status: ok ? 200 : 500 });
	return fetcher;
}

describe('scriptLoader', () => {
	it('loads and normalizes script source when the content hash matches', async () => {
		const source = 'alert(1)';
		const contentHash = await createBrowserScriptContentHash(source);

		await expect(loadScriptSource({
			sourceUrl: 'https://example.test/script.js',
			contentHash,
			fetcher: createFetch({ body: `javascript:${source}` }),
		})).resolves.toEqual({
			source,
			contentChanged: false,
		});
	});

	it('reports changed content when the content hash does not match', async () => {
		const contentHash = await createBrowserScriptContentHash('alert(1)');

		await expect(loadScriptSource({
			sourceUrl: 'https://example.test/script.js',
			contentHash,
			fetcher: createFetch({ body: 'alert(2)' }),
		})).resolves.toEqual({
			source: 'alert(2)',
			contentChanged: true,
		});
	});

	it('propagates fetch failures', async () => {
		await expect(loadScriptSource({
			sourceUrl: 'https://example.test/script.js',
			fetcher: createFetch({ ok: false }),
		})).rejects.toThrow("URL's server did not respond with 200 OK");
	});
});
