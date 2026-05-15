import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createScriptContentHash } from '$lib/server/scriptHash';

const mockKitModule = () => ({
    /**
     * @param {number} status
     * @param {Record<string, unknown>} data
     */
    fail: (status, data) => ({ status, ...data }),
    /**
     * @param {number} status
     * @param {string} location
     */
    redirect: (status, location) => {
        const error = /** @type {Error & { status: number, location: string }} */ (new Error('redirect'));
        error.status = status;
        error.location = location;
        throw error;
    }
});

/**
 * @param {string} source_url
 */
const createRequest = (source_url) => ({
    headers: new Headers({'x-real-ip': '127.0.0.1'}),
    formData: async () => ({
        /** @param {string} key */
        get: (key) => key === 'source_url' ? source_url : null
    })
});

describe('add script action', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('stores new scripts as needing review with a content hash', async () => {
        const source_url = 'data:text/javascript,alert(1)';
        const source = 'alert(1);';
        const content_hash = createScriptContentHash(source);
        const sql = vi.fn().mockResolvedValue({
            rows: [{source_url, status: 'needs_review', content_hash}]
        });
        const getScriptSource = vi.fn().mockResolvedValue(source);

        vi.doMock('@sveltejs/kit', mockKitModule);
        vi.doMock('$lib/server/db', () => ({ sql }));
        vi.doMock('$lib/server', () => ({ rateLimit: vi.fn().mockResolvedValue(false) }));
        vi.doMock('$lib', () => ({
            isURLInvalid: vi.fn().mockResolvedValue(false),
            getScriptSource
        }));

        const { actions } = await import('./+page.server.js');

        await expect(
            actions.default(/** @type {any} */ ({
                request: createRequest(source_url),
                fetch: vi.fn(),
                url: new URL('https://example.test/scripts/add')
            }))
        ).rejects.toMatchObject({ status: 303, location: `/scripts#${source_url}` });

        expect(getScriptSource).toHaveBeenCalledWith(source_url, expect.any(Function));
        expect(sql).toHaveBeenCalledTimes(1);
        expect(sql.mock.calls[0]).toEqual([
            expect.any(Array),
            source_url,
            'needs_review',
            content_hash
        ]);
    });
});
