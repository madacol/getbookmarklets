import { sql } from "$lib/server/db";

/** @type {import('./$types').RequestHandler} */
export async function POST({ params }) {
    const marker = 'content-changed/';
    if (params.rest?.startsWith(marker)) {
        const source_url = params.rest.slice(marker.length);
        await sql`
            UPDATE scripts
            SET status = 'needs_review'
            WHERE source_url = ${source_url}
                AND status = 'accepted'
        `;
    }

    return new Response(null, { status: 200 });
}
