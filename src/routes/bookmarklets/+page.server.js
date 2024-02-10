import { sql } from "$lib/server/db";
import { redirect } from "@sveltejs/kit";

export async function load() {

    const {rows: scripts} = await sql`
        SELECT
            script_id,
            name,
            user_id,
            source,
            created_at
        FROM scripts
        ORDER BY name
        ;
    `
    return {
        scripts
    }
}
