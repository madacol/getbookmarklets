import { getScriptSource } from './index.js';

/**
 * @param {string} source
 */
export async function createBrowserScriptContentHash(source) {
	const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
	return Array.from(new Uint8Array(buffer))
		.map(byte => byte.toString(16).padStart(2, '0'))
		.join('');
}

/**
 * @param {{ sourceUrl: string, contentHash?: string | null, fetcher?: typeof fetch }} options
 */
export async function loadScriptSource({ sourceUrl, contentHash = null, fetcher = fetch }) {
	const source = await getScriptSource(sourceUrl, fetcher);
	const contentChanged = Boolean(contentHash && await createBrowserScriptContentHash(source) !== contentHash);

	return { source, contentChanged };
}
