// @ts-check

import { autocompletion, pickedCompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';
import { lintGutter, linter } from '@codemirror/lint';
import { EditorView, ViewPlugin, hoverTooltip } from '@codemirror/view';

/** @typedef {import('@codemirror/state').Extension} Extension */
/** @typedef {import('@codemirror/autocomplete').Completion} CodeMirrorCompletion */
/** @typedef {import('@codemirror/autocomplete').CompletionContext} CompletionContext */
/** @typedef {import('@codemirror/autocomplete').CompletionResult} CodeMirrorCompletionResult */
/** @typedef {import('@codemirror/lint').Diagnostic} CodeMirrorDiagnostic */
/** @typedef {import('@codemirror/lint').LintSource} LintSource */

/** @typedef {{ from: number, to: number }} TextRange */
/** @typedef {{ label: string, apply: string, detail?: string, type?: string, sortText?: string, boost?: number, replacementRange?: TextRange }} WorkerCompletion */
/** @typedef {{ from: number, to: number, options: WorkerCompletion[], isIncomplete: boolean }} WorkerCompletionResult */
/** @typedef {{ from: number, to: number, message: string, severity: 'error' | 'warning' | 'info' | 'hint', source: string }} WorkerDiagnostic */
/** @typedef {{ from: number, to: number, display: string, documentation: string }} WorkerHover */
/** @typedef {{ id: number, ok: true, payload: unknown } | { id: number, ok: false, error: string }} WorkerResponse */
/** @typedef {{ resolve: (value: unknown) => void, reject: (reason?: unknown) => void }} PendingRequest */

/**
 * CodeMirror extension for Monaco-like browser/bookmarklet IntelliSense. It
 * keeps TypeScript isolated in a worker and exposes completions, hover info, and
 * diagnostics through CodeMirror's normal extension points.
 *
 * @returns {Extension}
 */
export function typescriptCodeIntelligence() {
	const client = createTypeScriptWorkerClient();

	return [
		javascript(),
		autocompletion({
			activateOnTyping: true,
			activateOnTypingDelay: 150,
			maxRenderedOptions: 120,
			override: [createCompletionSource(client)]
		}),
		linter(createLintSource(client), { delay: 750 }),
		lintGutter(),
		createHoverSource(client),
		typeScriptIntelligenceTheme,
		ViewPlugin.define(() => ({
			destroy() {
				client.destroy();
			}
		}))
	];
}

/**
 * @param {ReturnType<typeof createTypeScriptWorkerClient>} client
 */
function createCompletionSource(client) {
	/**
	 * @param {CompletionContext} context
	 * @returns {Promise<CodeMirrorCompletionResult | null>}
	 */
	return async (context) => {
		const range = completionRange(context);
		if (!shouldRequestCompletion(context, range)) return null;

		let aborted = false;
		context.addEventListener(
			'abort',
			() => {
				aborted = true;
			},
			{ onDocChange: true }
		);

		try {
			const result = await client.completions(context.state.doc.toString(), context.pos, range);
			if (!result || aborted || context.aborted) return null;

			return {
				from: result.from,
				to: result.to,
				options: result.options.map(mapCompletion),
				validFor: result.isIncomplete ? undefined : /[\w$]*$/
			};
		} catch (error) {
			console.warn('TypeScript completions failed', error);
			return null;
		}
	};
}

/**
 * @param {ReturnType<typeof createTypeScriptWorkerClient>} client
 */
function createLintSource(client) {
	/**
	 * @param {Parameters<LintSource>[0]} view
	 * @returns {Promise<CodeMirrorDiagnostic[]>}
	 */
	const lintSource = async (view) => {
		try {
			return await client.diagnostics(view.state.doc.toString());
		} catch (error) {
			console.warn('TypeScript diagnostics failed', error);
			return [];
		}
	};

	return /** @type {LintSource} */ (lintSource);
}

/**
 * @param {ReturnType<typeof createTypeScriptWorkerClient>} client
 */
function createHoverSource(client) {
	return hoverTooltip(
		async (view, position) => {
			try {
				const hover = await client.hover(view.state.doc.toString(), position);
				if (!hover || !hover.display) return null;

				return {
					pos: hover.from,
					end: hover.to,
					above: true,
					create() {
						return { dom: renderHover(hover) };
					}
				};
			} catch (error) {
				console.warn('TypeScript hover failed', error);
				return null;
			}
		},
		{ hoverTime: 350 }
	);
}

/**
 * @param {CompletionContext} context
 * @returns {TextRange}
 */
export function completionRange(context) {
	const match = context.matchBefore(/[\w$]*$/);
	return {
		from: match?.from ?? context.pos,
		to: context.pos
	};
}

/**
 * @param {CompletionContext} context
 * @param {TextRange} range
 */
export function shouldRequestCompletion(context, range) {
	if (context.explicit) return true;
	if (range.from < range.to) return true;

	const precedingText = context.state.sliceDoc(Math.max(0, context.pos - 2), context.pos);
	return precedingText.endsWith('.') || precedingText.endsWith('?.');
}

/**
 * @param {WorkerCompletion} completion
 * @returns {CodeMirrorCompletion}
 */
function mapCompletion(completion) {
	return {
		label: completion.label,
		apply: completion.replacementRange ? applyCompletionWithRange(completion) : completion.apply,
		detail: completion.detail,
		info: completion.detail,
		type: completion.type,
		sortText: completion.sortText,
		boost: completion.boost
	};
}

/**
 * @param {WorkerCompletion} completion
 */
function applyCompletionWithRange(completion) {
	/**
	 * @param {EditorView} view
	 * @param {CodeMirrorCompletion} picked
	 * @param {number} from
	 * @param {number} to
	 */
	return (view, picked, from, to) => {
		const replacementRange = completion.replacementRange ?? { from, to };

		view.dispatch({
			changes: {
				from: replacementRange.from,
				to: replacementRange.to,
				insert: completion.apply
			},
			annotations: pickedCompletion.of(picked),
			userEvent: 'input.complete'
		});
	};
}

/**
 * @param {WorkerHover} hover
 */
function renderHover(hover) {
	const container = document.createElement('div');
	container.className = 'cm-ts-hover';

	const signature = document.createElement('pre');
	signature.className = 'cm-ts-hover-code';
	signature.textContent = hover.display;
	container.append(signature);

	if (hover.documentation) {
		const documentation = document.createElement('div');
		documentation.className = 'cm-ts-hover-doc';
		documentation.textContent = hover.documentation;
		container.append(documentation);
	}

	return container;
}

function createTypeScriptWorkerClient() {
	const worker = new Worker(new URL('./typescriptCodeIntelligence.worker.js', import.meta.url), {
		type: 'module'
	});
	let nextRequestId = 1;
	let destroyed = false;

	/** @type {Map<number, PendingRequest>} */
	const pendingRequests = new Map();

	worker.addEventListener('message', (event) => {
		const response = event.data;
		if (!isWorkerResponse(response)) return;

		const pendingRequest = pendingRequests.get(response.id);
		if (!pendingRequest) return;

		pendingRequests.delete(response.id);

		if (response.ok) {
			pendingRequest.resolve(response.payload);
			return;
		}

		pendingRequest.reject(new Error(response.error));
	});

	worker.addEventListener('error', (event) => {
		rejectAllPending(new Error(event.message || 'TypeScript worker failed'));
	});

	return {
		/**
		 * @param {string} source
		 * @param {number} position
		 * @param {TextRange} range
		 * @returns {Promise<WorkerCompletionResult | null>}
		 */
		completions(source, position, range) {
			return /** @type {Promise<WorkerCompletionResult | null>} */ (request({
				type: 'completions',
				source,
				position,
				defaultFrom: range.from,
				defaultTo: range.to
			}));
		},

		/**
		 * @param {string} source
		 * @param {number} position
		 * @returns {Promise<WorkerHover | null>}
		 */
		hover(source, position) {
			return /** @type {Promise<WorkerHover | null>} */ (request({ type: 'hover', source, position }));
		},

		/**
		 * @param {string} source
		 * @returns {Promise<WorkerDiagnostic[]>}
		 */
		diagnostics(source) {
			return /** @type {Promise<WorkerDiagnostic[]>} */ (request({ type: 'diagnostics', source }));
		},

		destroy() {
			if (destroyed) return;

			destroyed = true;
			worker.terminate();
			rejectAllPending(new Error('TypeScript worker was destroyed'));
		}
	};

	/**
	 * @param {Record<string, unknown>} message
	 * @returns {Promise<unknown>}
	 */
	function request(message) {
		if (destroyed) return Promise.reject(new Error('TypeScript worker was destroyed'));

		const id = nextRequestId;
		nextRequestId += 1;

		return new Promise((resolve, reject) => {
			pendingRequests.set(id, { resolve, reject });
			worker.postMessage({ ...message, id });
		});
	}

	/**
	 * @param {Error} error
	 */
	function rejectAllPending(error) {
		for (const pendingRequest of pendingRequests.values()) {
			pendingRequest.reject(error);
		}

		pendingRequests.clear();
	}
}

/**
 * @param {unknown} value
 * @returns {value is WorkerResponse}
 */
function isWorkerResponse(value) {
	if (!value || typeof value !== 'object') return false;

	const response = /** @type {Partial<WorkerResponse>} */ (value);
	if (typeof response.id !== 'number') return false;
	if (response.ok === true) return 'payload' in response;
	return response.ok === false && typeof response.error === 'string';
}

const typeScriptIntelligenceTheme = EditorView.theme({
	'.cm-ts-hover': {
		maxWidth: '42rem',
		padding: '0.65rem 0.75rem'
	},
	'.cm-ts-hover-code': {
		fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace',
		fontSize: '0.85rem',
		margin: '0',
		whiteSpace: 'pre-wrap'
	},
	'.cm-ts-hover-doc': {
		borderTop: '1px solid rgb(255 255 255 / 18%)',
		fontSize: '0.85rem',
		marginTop: '0.5rem',
		paddingTop: '0.5rem',
		whiteSpace: 'pre-wrap'
	}
});
