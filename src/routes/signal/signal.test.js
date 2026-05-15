import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('signal route', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    it('marks accepted scripts as needing review when content changes', async () => {
        const sql = vi.fn().mockResolvedValue({ rows: [] });
        const source_url = 'data:text/javascript,alert(%22changed%22)';

        vi.doMock('$lib/server/db', () => ({ sql }));

        const { POST } = await import('./[...rest]/+server.js');
        const response = await POST(/** @type {any} */ ({
            params: {
                rest: `content-changed/${source_url}`
            }
        }));

        expect(response.status).toBe(200);
        expect(sql).toHaveBeenCalledTimes(1);
        expect(sql.mock.calls[0]).toEqual([
            expect.any(Array),
            source_url
        ]);
    });

    it('keeps legacy signals as no-op success responses', async () => {
        const sql = vi.fn();
        vi.doMock('$lib/server/db', () => ({ sql }));

        const { POST } = await import('./[...rest]/+server.js');
        const response = await POST(/** @type {any} */ ({
            params: {
                rest: 'copy/data:text/javascript,alert(1)'
            }
        }));

        expect(response.status).toBe(200);
        expect(sql).not.toHaveBeenCalled();
    });
});
