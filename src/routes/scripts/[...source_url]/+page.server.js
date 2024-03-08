import { sql } from "$lib/server/db";

export async function load({ params }) {

    const source_url = decodeURIComponent(params.source_url);

    let {rows: [script]} = await sql`
        SELECT
            username as author,
            source_url,
            scripts.created_at
        FROM scripts
        JOIN users USING (user_id)
        WHERE source_url = ${source_url}
        ORDER BY scripts.created_at
        ;
    `

    script = script || {source_url}

    return { script }
}
