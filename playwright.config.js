/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	webServer: {
		command: 'npm run dev',
		port: 5173,
		reuseExistingServer: !process.env.CI,
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
			dependencies: ['login'],
			use: {
				storageState: 'tests/.auth/user.json',
			}
		},
		{ name: 'logged off', testDir: 'tests/logged off' },
	]
};

export default config;
