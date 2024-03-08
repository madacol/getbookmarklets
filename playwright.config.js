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
			name: 'after login',
			testDir: 'tests/after login',
			dependencies: ['login'],
			use: {
				storageState: 'tests/.auth/user.json',
			}
		},
	]
};

export default config;
