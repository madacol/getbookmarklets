import { createHash } from 'node:crypto';

/**
 * @param {string} source
 */
export function createScriptContentHash(source) {
    return createHash('sha256').update(source).digest('hex');
}
