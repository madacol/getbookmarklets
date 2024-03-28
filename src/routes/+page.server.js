import { sql } from "$lib/server/db";

export async function load() {

    const {rows: scripts} = await sql`
        SELECT
            username AS uploader,
            source_url
        FROM scripts
        JOIN users USING (user_id)
        ORDER BY random();
    `
    return {
        scripts
    }
}
