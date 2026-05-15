import { describe, expect, it } from 'vitest';
import { createScriptSearchText, safeDecodeURIComponent } from './scriptSearch.js';

describe('scriptSearch', () => {
	it('builds normalized searchable text from script metadata', () => {
		expect(createScriptSearchText({
			source_url: 'https://example.com/My%20Script.js',
			name: 'Alpha Tool',
			description: 'Finds Records',
			source: 'const token = "LazyMatch";',
		})).toContain('alpha tool');
		expect(createScriptSearchText({
			source_url: 'https://example.com/My%20Script.js',
			name: 'Alpha Tool',
			description: 'Finds Records',
			source: 'const token = "LazyMatch";',
		})).toContain('my script');
		expect(createScriptSearchText({
			source_url: 'https://example.com/My%20Script.js',
			name: 'Alpha Tool',
			description: 'Finds Records',
			source: 'const token = "LazyMatch";',
		})).toContain('lazymatch');
	});

	it('leaves malformed encoded values unchanged', () => {
		expect(safeDecodeURIComponent('https://example.com/%E0%A4%A')).toBe('https://example.com/%E0%A4%A');
	});
});
