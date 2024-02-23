import argon2 from "argon2";
import { sql } from "$lib/server/db";
import { cookies_options } from "$lib/server/config";
import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
        const data = await request.formData();
        const name = data.get("name");
        const source_url = data.get("source_url");
        const description = data.get("description");
        const user_id = locals.user.user_id;

        const {rows: [script]} = await sql`
            INSERT INTO scripts (name, source_url, user_id, description)
            VALUES (${name}, ${source_url}, ${user_id}, ${description})
            RETURNING script_id
            ;
        `;

        throw redirect(303, `/scripts/${script.script_id}`);
    },
}
