import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	preview: {
		allowedHosts: ['getbookmarklets.babyjarvis.com', 'getbookmarklets.ts.babyjarvis.com']
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
