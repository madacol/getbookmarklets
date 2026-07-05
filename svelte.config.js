import adapter from '@sveltejs/adapter-vercel';

const outDir = process.env.SVELTE_KIT_OUT_DIR || '.svelte-kit';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		outDir,
		adapter: adapter({
			runtime: 'nodejs20.x',
		}),
		csrf: {
			trustedOrigins: [
				'https://getbookmarklets.babyjarvis.com',
				'https://getbookmarklets.ts.babyjarvis.com',
			],
		},
	}
};

export default config;
