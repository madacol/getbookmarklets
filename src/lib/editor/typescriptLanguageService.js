/// <reference types="vite/client" />
// @ts-check

import ts from 'typescript';

const SCRIPT_FILE_NAME = '/bookmarklet.js';
const DEFAULT_LIB_FILE_NAME = 'lib.es2023.full.d.ts';

/**
 * Vite turns these TypeScript declaration files into raw strings and keeps them
 * in the worker chunk. The language service resolves the transitive `lib`
 * references itself, so importing the complete lib set keeps this module stable
 * across TypeScript lib-file dependency changes.
 *
 * @type {Record<string, string>}
 */
const rawTypeScriptLibFiles = import.meta.glob('/node_modules/typescript/lib/lib.*.d.ts', {
	query: '?raw',
	import: 'default',
	eager: true
});

/** @typedef {{ from: number, to: number }} TextRange */
/** @typedef {{ from: number, to: number, message: string, severity: 'error' | 'warning' | 'info' | 'hint', source: string }} EditorDiagnostic */
/** @typedef {{ label: string, apply: string, detail?: string, type?: string, sortText?: string, boost?: number, replacementRange?: TextRange }} EditorCompletion */
/** @typedef {{ from: number, to: number, options: EditorCompletion[], isIncomplete: boolean }} EditorCompletionResult */
/** @typedef {{ from: number, to: number, display: string, documentation: string }} EditorHover */

const compilerOptions = {
	allowJs: true,
	allowNonTsExtensions: true,
	checkJs: true,
	lib: [DEFAULT_LIB_FILE_NAME],
	module: ts.ModuleKind.ESNext,
	noEmit: true,
	noImplicitAny: false,
	skipLibCheck: true,
	strict: false,
	target: ts.ScriptTarget.ESNext,
	types: []
};

const completionOptions = {
	includeAutomaticOptionalChainCompletions: true,
	includeCompletionsForImportStatements: false,
	includeCompletionsForModuleExports: false,
	includeCompletionsWithInsertText: true,
	includeCompletionsWithSnippetText: true
};

/**
 * Creates the TypeScript language-service module used by the CodeMirror worker.
 * The module owns source versions, virtual lib files, and all TypeScript host
 * behavior behind a small editor-oriented interface.
 *
 * @param {{ initialSource?: string }} [options]
 */
export function createBookmarkletTypeScriptService(options = {}) {
	let source = options.initialSource ?? '';
	let version = 0;
	const libraryFiles = createLibraryFileMap();

	/** @param {string} fileName */
	function readFile(fileName) {
		const normalizedFileName = normalizeFileName(fileName);

		if (normalizedFileName === SCRIPT_FILE_NAME) return source;
		return libraryFiles.get(normalizedFileName);
	}

	const host = {
		getCompilationSettings: () => compilerOptions,
		getCurrentDirectory: () => '/',
		getDefaultLibFileName: () => DEFAULT_LIB_FILE_NAME,
		getDefaultLibLocation: () => '/',
		getDirectories: () => [],
		getNewLine: () => '\n',
		getScriptFileNames: () => [SCRIPT_FILE_NAME],
		/** @param {string} fileName */
		getScriptSnapshot: (fileName) => {
			const contents = readFile(fileName);
			return contents === undefined ? undefined : ts.ScriptSnapshot.fromString(contents);
		},
		/** @param {string} fileName */
		getScriptVersion: (fileName) => (normalizeFileName(fileName) === SCRIPT_FILE_NAME ? String(version) : '1'),
		/** @param {string} directoryName */
		directoryExists: (directoryName) => directoryName === '/' || directoryName.endsWith('/typescript/lib'),
		/** @param {string} fileName */
		fileExists: (fileName) => readFile(fileName) !== undefined,
		/** @param {string} fileName */
		readFile,
		readDirectory: () => [],
		useCaseSensitiveFileNames: () => true
	};

	const languageService = ts.createLanguageService(host, ts.createDocumentRegistry(true, '/'));

	return {
		/** @param {string} nextSource */
		updateSource(nextSource) {
			if (source === nextSource) return;

			source = nextSource;
			version += 1;
		},

		/**
		 * @param {number} position
		 * @param {TextRange} defaultRange
		 * @returns {EditorCompletionResult | null}
		 */
		getCompletions(position, defaultRange) {
			const completionInfo = languageService.getCompletionsAtPosition(
				SCRIPT_FILE_NAME,
				clampPosition(position, source),
				completionOptions
			);

			if (!completionInfo) return null;

			const replacementRange = completionInfo.optionalReplacementSpan
				? textSpanToRange(completionInfo.optionalReplacementSpan)
				: defaultRange;

			return {
				from: clampPosition(replacementRange.from, source),
				to: clampPosition(replacementRange.to, source),
				options: completionInfo.entries.map(mapCompletionEntry),
				isIncomplete: completionInfo.isIncomplete === true
			};
		},

		/**
		 * @param {number} position
		 * @returns {EditorHover | null}
		 */
		getHover(position) {
			const quickInfo = languageService.getQuickInfoAtPosition(SCRIPT_FILE_NAME, clampPosition(position, source));
			if (!quickInfo) return null;

			return {
				...textSpanToRange(quickInfo.textSpan),
				display: ts.displayPartsToString(quickInfo.displayParts),
				documentation: [
					ts.displayPartsToString(quickInfo.documentation ?? []),
					formatTags(quickInfo.tags ?? [])
				]
					.filter(Boolean)
					.join('\n\n')
			};
		},

		/** @returns {EditorDiagnostic[]} */
		getDiagnostics() {
			return [
				...languageService.getSyntacticDiagnostics(SCRIPT_FILE_NAME),
				...languageService.getSemanticDiagnostics(SCRIPT_FILE_NAME),
				...languageService.getSuggestionDiagnostics(SCRIPT_FILE_NAME)
			]
				.filter((diagnostic) => !diagnostic.file || normalizeFileName(diagnostic.file.fileName) === SCRIPT_FILE_NAME)
				.map((diagnostic) => mapDiagnostic(diagnostic, source));
		}
	};
}

/**
 * @param {string} fileName
 */
export function normalizeFileName(fileName) {
	const normalizedPath = fileName.replaceAll('\\', '/');
	if (normalizedPath === SCRIPT_FILE_NAME || normalizedPath.endsWith(SCRIPT_FILE_NAME)) return SCRIPT_FILE_NAME;

	const libFileName = normalizedPath.match(/(?:^|\/)(lib\..+\.d\.ts)$/)?.[1];
	return libFileName ?? normalizedPath;
}

/**
 * @param {number} position
 * @param {string} source
 */
export function clampPosition(position, source) {
	if (!Number.isFinite(position)) return 0;
	return Math.max(0, Math.min(source.length, Math.trunc(position)));
}

/**
 * @param {ts.TextSpan} textSpan
 * @returns {TextRange}
 */
function textSpanToRange(textSpan) {
	return {
		from: textSpan.start,
		to: textSpan.start + textSpan.length
	};
}

/**
 * @param {ts.CompletionEntry} entry
 * @returns {EditorCompletion}
 */
function mapCompletionEntry(entry) {
	return {
		label: entry.name,
		apply: entry.insertText ?? entry.name,
		detail: completionDetail(entry),
		type: completionType(entry.kind),
		sortText: `${entry.sortText}:${entry.name}`,
		boost: entry.isRecommended ? 50 : undefined,
		replacementRange: entry.replacementSpan ? textSpanToRange(entry.replacementSpan) : undefined
	};
}

/**
 * @param {ts.CompletionEntry} entry
 */
function completionDetail(entry) {
	const labelDetails = [entry.labelDetails?.detail, entry.labelDetails?.description].filter(Boolean).join(' ');
	return labelDetails || entry.kind || undefined;
}

/**
 * @param {string} typescriptKind
 */
export function completionType(typescriptKind) {
	switch (typescriptKind) {
		case ts.ScriptElementKind.classElement:
		case ts.ScriptElementKind.localClassElement:
			return 'class';
		case ts.ScriptElementKind.constElement:
			return 'constant';
		case ts.ScriptElementKind.enumElement:
			return 'enum';
		case ts.ScriptElementKind.enumMemberElement:
			return 'constant';
		case ts.ScriptElementKind.functionElement:
		case ts.ScriptElementKind.localFunctionElement:
			return 'function';
		case ts.ScriptElementKind.interfaceElement:
			return 'interface';
		case ts.ScriptElementKind.keyword:
			return 'keyword';
		case ts.ScriptElementKind.memberFunctionElement:
			return 'method';
		case ts.ScriptElementKind.memberVariableElement:
		case ts.ScriptElementKind.memberAccessorVariableElement:
		case ts.ScriptElementKind.memberGetAccessorElement:
		case ts.ScriptElementKind.memberSetAccessorElement:
			return 'property';
		case ts.ScriptElementKind.moduleElement:
		case ts.ScriptElementKind.scriptElement:
		case ts.ScriptElementKind.externalModuleName:
			return 'namespace';
		case ts.ScriptElementKind.primitiveType:
		case ts.ScriptElementKind.typeElement:
			return 'type';
		case ts.ScriptElementKind.letElement:
		case ts.ScriptElementKind.localVariableElement:
		case ts.ScriptElementKind.variableElement:
			return 'variable';
		default:
			return undefined;
	}
}

/**
 * @param {ts.Diagnostic} diagnostic
 * @param {string} source
 * @returns {EditorDiagnostic}
 */
function mapDiagnostic(diagnostic, source) {
	const start = clampPosition(diagnostic.start ?? 0, source);
	const length = Math.max(1, diagnostic.length ?? 1);

	return {
		from: start,
		to: clampPosition(start + length, source),
		message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
		severity: diagnosticSeverity(diagnostic.category),
		source: `ts(${diagnostic.code})`
	};
}

/**
 * @param {ts.DiagnosticCategory} category
 * @returns {'error' | 'warning' | 'info' | 'hint'}
 */
export function diagnosticSeverity(category) {
	if (category === ts.DiagnosticCategory.Error) return 'error';
	if (category === ts.DiagnosticCategory.Warning) return 'warning';
	if (category === ts.DiagnosticCategory.Suggestion) return 'info';
	return 'hint';
}

/**
 * @param {readonly ts.JSDocTagInfo[]} tags
 */
function formatTags(tags) {
	return tags
		.map((tag) => {
			const text = ts.displayPartsToString(tag.text ?? []);
			return text ? `@${tag.name} ${text}` : `@${tag.name}`;
		})
		.join('\n');
}

function createLibraryFileMap() {
	return new Map(
		Object.entries(rawTypeScriptLibFiles).map(([filePath, contents]) => {
			const fileName = normalizeFileName(filePath);
			return [fileName, contents];
		})
	);
}
