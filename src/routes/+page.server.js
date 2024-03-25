import { sql } from "$lib/server/db";

export async function load() {

    const {rows: scripts} = await sql`
        SELECT
            username AS uploader,
            source_url
        FROM scripts
        JOIN users USING (user_id)
        ORDER BY scripts.created_at DESC;
    `
    return {
        scripts
    }
}
