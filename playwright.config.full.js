import dev_config, { usePgliteForPlaywright } from './playwright.config.js';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	...dev_config,
	webServer: {
		command: usePgliteForPlaywright ? 'node ./scripts/serve-local-production.js' : 'pnpm preview',
		port: 4173,
		reuseExistingServer: !process.env.CI && !usePgliteForPlaywright,
	},
	timeout: 10000,
};

export default config;
