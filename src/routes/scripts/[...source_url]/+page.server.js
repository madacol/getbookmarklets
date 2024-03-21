import { sql } from "$lib/server/db";

export async function load({ params }) {

    const {source_url} = params;

    let {rows: [script]} = await sql`
        SELECT
            username as uploader,
            source_url
        FROM scripts
        JOIN users USING (user_id)
        WHERE source_url = ${source_url}
        ORDER BY scripts.created_at
        ;
    `

    script = script || {source_url}

    return { script }
}
