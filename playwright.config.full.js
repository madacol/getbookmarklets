import dev_config from './playwright.config.js';

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	...dev_config,
	webServer: {
		command: 'npm run preview',
		port: 4173,
	},
	timeout: 10000,
};

export default config;
