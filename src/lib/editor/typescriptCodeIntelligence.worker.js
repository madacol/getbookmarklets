// @ts-check

import { createBookmarkletTypeScriptService } from './typescriptLanguageService.js';

/** @typedef {{ id: number, type: 'completions', source: string, position: number, defaultFrom: number, defaultTo: number }} CompletionRequest */
/** @typedef {{ id: number, type: 'hover', source: string, position: number }} HoverRequest */
/** @typedef {{ id: number, type: 'diagnostics', source: string }} DiagnosticsRequest */
/** @typedef {CompletionRequest | HoverRequest | DiagnosticsRequest} WorkerRequest */

const service = createBookmarkletTypeScriptService();

self.addEventListener('message', (event) => {
	const request = event.data;
	if (!isWorkerRequest(request)) return;

	try {
		service.updateSource(request.source);

		if (request.type === 'completions') {
			postSuccess(
				request.id,
				service.getCompletions(request.position, {
					from: request.defaultFrom,
					to: request.defaultTo
				})
			);
			return;
		}

		if (request.type === 'hover') {
			postSuccess(request.id, service.getHover(request.position));
			return;
		}

		postSuccess(request.id, service.getDiagnostics());
	} catch (error) {
		postFailure(request.id, error);
	}
});

/**
 * @param {number} id
 * @param {unknown} payload
 */
function postSuccess(id, payload) {
	self.postMessage({ id, ok: true, payload });
}

/**
 * @param {number} id
 * @param {unknown} error
 */
function postFailure(id, error) {
	self.postMessage({
		id,
		ok: false,
		error: error instanceof Error ? error.message : String(error)
	});
}

/**
 * @param {unknown} value
 * @returns {value is WorkerRequest}
 */
function isWorkerRequest(value) {
	if (!value || typeof value !== 'object') return false;

	const candidate = /** @type {Partial<WorkerRequest>} */ (value);
	if (!isFiniteNumber(candidate.id) || typeof candidate.source !== 'string') return false;

	if (candidate.type === 'diagnostics') return true;
	if (candidate.type === 'hover') return isFiniteNumber(candidate.position);

	return (
		candidate.type === 'completions' &&
		isFiniteNumber(candidate.position) &&
		isFiniteNumber(candidate.defaultFrom) &&
		isFiniteNumber(candidate.defaultTo)
	);
}

/**
 * @param {unknown} value
 */
function isFiniteNumber(value) {
	return typeof value === 'number' && Number.isFinite(value);
}
