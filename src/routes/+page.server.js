import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({locals}) {
    if (locals.user) {
        throw redirect(303, '/bookmarklets');
    }
}
