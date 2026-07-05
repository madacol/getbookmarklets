import dev_config, { usePgliteForPlaywright } from './playwright.config.js';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	...dev_config,
	webServer: {
		command: usePgliteForPlaywright
			? 'SVELTE_KIT_OUT_DIR=.svelte-kit-test node ./scripts/serve-local-production.js'
			: 'SVELTE_KIT_OUT_DIR=.svelte-kit-test pnpm preview',
		port: 4173,
		reuseExistingServer: !process.env.CI && !usePgliteForPlaywright,
	},
	timeout: 10000,
};

export default config;
