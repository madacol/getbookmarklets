import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockKitModule = () => ({
    /**
     * @param {number} status
     * @param {Record<string, unknown>} data
     */
    fail: (status, data) => ({ status, ...data })
});

/**
 * @param {Record<string, string>} entries
 */
const createRequest = (entries) => ({
    formData: async () => ({
        /** @param {string} key */
        get: (key) => entries[key] ?? null
    })
});

describe('review scripts route', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('loads scripts needing review', async () => {
        const scripts = [{
            script_id: 'script-1',
            source_url: 'data:text/javascript,alert(1)',
            content_hash: '0'.repeat(64),
            status: 'needs_review',
            created_at: '2026-05-15T00:00:00.000Z'
        }];
        const sql = vi.fn().mockResolvedValue({ rows: scripts });

        vi.doMock('@sveltejs/kit', mockKitModule);
        vi.doMock('$lib/server/checkPermissions_MW', () => ({
            /**
             * @param {string} _permission
             * @param {Function} handler
             */
            checkPermissions_MW: (_permission, handler) => handler
        }));
        vi.doMock('$lib/server/db', () => ({ sql }));

        const { load } = await import('./+page.server.js');

        await expect(load(/** @type {any} */ ({}))).resolves.toEqual({ scripts });
        expect(sql).toHaveBeenCalledTimes(1);
    });

    it('accepts a script by storing a fresh hash for reviewed content', async () => {
        const sql = vi.fn().mockResolvedValue({ rows: [] });
        const source_url = 'data:text/javascript,alert(1)';
        const getScriptSource = vi.fn().mockResolvedValue('alert(1);');
        const createScriptContentHash = vi.fn().mockReturnValue('a'.repeat(64));

        vi.doMock('@sveltejs/kit', mockKitModule);
        vi.doMock('$lib/server/checkPermissions_MW', () => ({
            /**
             * @param {string} _permission
             * @param {Function} handler
             */
            checkPermissions_MW: (_permission, handler) => handler
        }));
        vi.doMock('$lib/server/db', () => ({ sql }));
        vi.doMock('$lib', () => ({ getScriptSource }));
        vi.doMock('$lib/server/scriptHash', () => ({ createScriptContentHash }));

        const { actions } = await import('./+page.server.js');
        const result = await actions.accept(/** @type {any} */ ({
            request: createRequest({
                script_id: 'script-1',
                source_url
            }),
            fetch: vi.fn()
        }));

        expect(result).toEqual({ accepted: 'script-1' });
        expect(getScriptSource).toHaveBeenCalledWith(source_url, expect.any(Function));
        expect(createScriptContentHash).toHaveBeenCalledWith('alert(1);');
        expect(sql.mock.calls[0]).toEqual([
            expect.any(Array),
            'a'.repeat(64),
            'script-1',
            source_url
        ]);
    });

    it('rejects a script', async () => {
        const sql = vi.fn().mockResolvedValue({ rows: [] });

        vi.doMock('@sveltejs/kit', mockKitModule);
        vi.doMock('$lib/server/checkPermissions_MW', () => ({
            /**
             * @param {string} _permission
             * @param {Function} handler
             */
            checkPermissions_MW: (_permission, handler) => handler
        }));
        vi.doMock('$lib/server/db', () => ({ sql }));

        const { actions } = await import('./+page.server.js');
        const result = await actions.reject(/** @type {any} */ ({
            request: createRequest({ script_id: 'script-1' })
        }));

        expect(result).toEqual({ rejected: 'script-1' });
        expect(sql.mock.calls[0]).toEqual([
            expect.any(Array),
            'script-1'
        ]);
    });
});
