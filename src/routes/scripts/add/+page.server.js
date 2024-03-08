import { sql } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
        const data = await request.formData();
        const source_url = data.get("source_url");
        const user_id = locals.user.user_id;

        const {rows: [new_script]} = await sql`
            INSERT INTO scripts (source_url, user_id)
            VALUES (${source_url}, ${user_id})
            RETURNING source_url
            ;
        `;

        redirect(303, `/scripts/${encodeURIComponent(new_script.source_url)}`);
    },
}
