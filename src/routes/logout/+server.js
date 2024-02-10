import { cookies_options } from '$lib/server/config.js';
import { sql } from '$lib/server/db.js';
import { redirect } from '@sveltejs/kit';

export async function GET({ cookies, url }) {
    const session_id = cookies.get("session");

    // Remove session from DB
    await sql`
        DELETE FROM sessions
        WHERE session_id=${session_id}
        ;
    `;

    cookies.delete("session", cookies_options);

    throw redirect(303, url.searchParams.get('redirectTo') ?? '/');
}