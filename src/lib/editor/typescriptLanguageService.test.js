import { describe, expect, it } from 'vitest';
import {
	completionType,
	createBookmarkletTypeScriptService,
	diagnosticSeverity,
	normalizeFileName
} from './typescriptLanguageService.js';

describe('bookmarklet TypeScript language service', () => {
	it('completes browser DOM member APIs from TypeScript DOM types', () => {
		const source = "document.querySelector('button').ad";
		const service = createBookmarkletTypeScriptService({ initialSource: source });
		const completions = service.getCompletions(source.length, {
			from: source.lastIndexOf('ad'),
			to: source.length
		});

		const addEventListener = completions?.options.find((option) => option.label === 'addEventListener');

		expect(addEventListener).toMatchObject({
			label: 'addEventListener',
			type: 'method',
			detail: 'method'
		});
	});

	it('completes browser globals used by bookmarklets', () => {
		const source = 'fet';
		const service = createBookmarkletTypeScriptService({ initialSource: source });
		const completions = service.getCompletions(source.length, {
			from: 0,
			to: source.length
		});

		expect(completions?.options.map((option) => option.label)).toContain('fetch');
	});

	it('returns hover information from inferred browser API types', () => {
		const source = "document.body.append('saved');";
		const service = createBookmarkletTypeScriptService({ initialSource: source });
		const hover = service.getHover(source.indexOf('append') + 1);

		expect(hover?.display).toContain('append');
		expect(hover?.display).toContain('nodes');
	});

	it('returns TypeScript diagnostics for invalid browser API usage', () => {
		const source = 'document.body.notARealBrowserApi();';
		const service = createBookmarkletTypeScriptService({ initialSource: source });

		expect(service.getDiagnostics()).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					message: expect.stringContaining("Property 'notARealBrowserApi' does not exist"),
					severity: 'error'
				})
			])
		);
	});

	it('normalizes TypeScript lib files requested through absolute paths', () => {
		expect(normalizeFileName('/node_modules/typescript/lib/lib.dom.d.ts')).toBe('lib.dom.d.ts');
	});

	it('maps TypeScript completion and diagnostic kinds to CodeMirror concepts', () => {
		expect(completionType('method')).toBe('method');
		expect(completionType('local var')).toBe('variable');
		expect(diagnosticSeverity(0)).toBe('warning');
	});
});
