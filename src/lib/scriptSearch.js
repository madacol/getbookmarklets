/**
 * @param {string} value
 */
export function safeDecodeURIComponent(value) {
	try {
		return decodeURIComponent(value);
	} catch {
		return value;
	}
}

/**
 * @param {string} value
 */
export function normalizeSearchText(value) {
	return value.toLowerCase().trim();
}

/**
 * @param {{ source_url: string, source?: string, name?: string, description?: string }} script
 */
export function createScriptSearchText(script) {
	return normalizeSearchText([
		script.source_url,
		safeDecodeURIComponent(script.source_url),
		script.name,
		script.description,
		script.source,
	].filter(Boolean).join('\n'));
}
