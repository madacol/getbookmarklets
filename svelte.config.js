import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
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
