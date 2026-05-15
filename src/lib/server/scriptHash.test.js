import { describe, expect, it } from 'vitest';
import { createScriptContentHash } from './scriptHash.js';

describe('createScriptContentHash', () => {
    it('creates a stable SHA-256 hex hash', () => {
        expect(createScriptContentHash('alert(1);')).toBe(
            'e63170ac02b4515e3ba056d583f8820816f10fc5f5c3e42fa0e51ea6ee02d980'
        );
    });
});
