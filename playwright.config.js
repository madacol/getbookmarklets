const pgliteHost = process.env.PGLITE_HOST || '127.0.0.1';
const pglitePort = process.env.PGLITE_PORT || '55432';
const pgliteDatabaseUrl = process.env.PLAYWRIGHT_DATABASE_URL || `postgresql://postgres:postgres@${pgliteHost}:${pglitePort}/postgres`;

export const usePgliteForPlaywright = process.env.PLAYWRIGHT_USE_PGLITE !== '0';

if (usePgliteForPlaywright) {
	process.env.DATABASE_URL = pgliteDatabaseUrl;
}

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: usePgliteForPlaywright ? 'pnpm with:pglite -- pnpm dev' : 'pnpm dev',
		port: 5173,
		reuseExistingServer: !process.env.CI && !usePgliteForPlaywright,
	},
	testDir: 'tests',
	testIgnore: 'tests/**/.assets/**',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	timeout: 10000,
	use: {
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
	},
	projects: [
		{ name: 'login', testMatch: 'signup login.test.js' },
		{
			name: 'logged in',
			testDir: 'tests/logged in',
			// dependencies: ['login'],
			use: {
				storageState: 'tests/.auth/user.json',
			}
		},
		{
			name: 'logged off',
			testIgnore: ['tests/logged in/**', 'tests/signup login.test.js'],
		},
	]
};

export default config;
