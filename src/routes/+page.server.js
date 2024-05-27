import { sql } from "$lib/server/db";

export async function load({setHeaders}) {

    const {rows: scripts} = await sql`
        SELECT
            source_url
        FROM scripts
        ORDER BY random()
        LIMIT 100;
    `

    setHeaders({ "Cache-Control": "public, max-age=10, stale-while-revalidate=5" });

    return {
        scripts
    }
}