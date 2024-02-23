import { sql } from "$lib/server/db";

export async function load({ params }) {

    const {rows: [script]} = await sql`
        SELECT
            name,
            username as author,
            source_url,
            description,
            scripts.created_at
        FROM scripts
        JOIN users USING (user_id)
        WHERE script_id = ${params.script_id}
        ORDER BY name
        ;
    `

    return { script }
}
