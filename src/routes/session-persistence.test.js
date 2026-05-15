import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * @param {Record<string, string>} entries
 */
const createRequest = (entries) => ({
	formData: async () => ({
		/** @param {string} key */
		get: (key) => entries[key]
	})
});

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

describe('session persistence', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
	});

	it('uses a persistent cookie max age', async () => {
		vi.doMock('$env/dynamic/private', () => ({
			env: {
				DATABASE_URL: 'postgres://example.test/db',
				NODE_ENV: 'test',
				DOMAIN: 'example.test'
			}
		}));

		const { cookies_options } = await import('../lib/server/config.js');

		expect(cookies_options.maxAge).toBe(2147483647);
	});

	it('creates a non-expiring session during login', async () => {
		const sql = vi
			.fn()
			.mockResolvedValueOnce({
				rows: [{ user_id: 'user-1', password_hash: 'password-hash' }]
			})
			.mockResolvedValueOnce({
				rows: [{ session_id: 'session-1' }]
			});
		const cookies_options = { path: '/', maxAge: 2147483647 };

		vi.doMock('argon2', () => ({
			default: {
				verify: vi.fn().mockResolvedValue(true)
			}
		}));
		vi.doMock('$lib/server/db', () => ({ sql }));
		vi.doMock('../lib/server/db.js', () => ({ sql }));
		vi.doMock('$lib/server/config', () => ({ cookies_options }));
		vi.doMock('../lib/server/config.js', () => ({ cookies_options }));
		vi.doMock('@sveltejs/kit', mockKitModule);

		const { actions } = await import('./login/+page.server.js');
		const cookies = { set: vi.fn() };

		await expect(
			actions.default(/** @type {any} */ ({
				cookies,
				request: createRequest({ username: 'marco', password: 'secret' }),
				url: new URL('https://example.test/login')
			}))
		).rejects.toMatchObject({ status: 303, location: '/' });

		expect(sql).toHaveBeenCalledTimes(2);
		expect(sql.mock.calls[1][0].join('')).toContain("TIMESTAMP 'infinity'");
		expect(cookies.set).toHaveBeenCalledWith('session', 'session-1', cookies_options);
	});

	it('creates a non-expiring session during signup', async () => {
		const sql = vi
			.fn()
			.mockResolvedValueOnce({ rows: [undefined] })
			.mockResolvedValueOnce({
				rows: [{ session_id: 'session-1' }]
			});
		const cookies_options = { path: '/', maxAge: 2147483647 };

		vi.doMock('argon2', () => ({
			default: {
				hash: vi.fn().mockResolvedValue('password-hash')
			}
		}));
		vi.doMock('../lib/server/db.js', () => ({ sql }));
		vi.doMock('$lib/server/db', () => ({ sql }));
		vi.doMock('$lib/server/config', () => ({ argon_options: {}, cookies_options }));
		vi.doMock('../lib/server/config.js', () => ({ argon_options: {}, cookies_options }));
		vi.doMock('$lib/config', () => ({ PASSWORD_MINLENGTH: 1 }));
		vi.doMock('@sveltejs/kit', mockKitModule);

		const { actions } = await import('./signup/+page.server.js');
		const cookies = { set: vi.fn() };

		await expect(
			actions.default(/** @type {any} */ ({
				cookies,
				request: createRequest({ username: 'marco', password: 'secret' }),
				url: new URL('https://example.test/signup')
			}))
		).rejects.toMatchObject({ status: 303, location: '/' });

		expect(sql).toHaveBeenCalledTimes(2);
		expect(sql.mock.calls[1][0].join('')).toContain("TIMESTAMP 'infinity'");
		expect(cookies.set).toHaveBeenCalledWith('session', 'session-1', cookies_options);
	});
});
