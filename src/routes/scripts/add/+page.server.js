import { sql } from "$lib/server/db";
import { fail, redirect } from "@sveltejs/kit";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals, fetch }) => {
        const data = await request.formData();
        /** @type {string} */
        // @ts-ignore
        const source_url = data.get("source_url");
        const user_id = locals.user?.user_id;

        if (!source_url) return fail(400, {error: "You must provide a URL"})
        if (!user_id) return fail(401, {error: "You must be logged in to add a script"});

        // Validate URL is http or dataURL
        if (source_url.startsWith("data:")) {
            // Validate if it is javascript and parses correctly
            try {
                const response = await fetch(source_url);
                const text = await response.text();
                if (text.length > 10000) {
                    return fail(400, {error: "DataURL is too large"});
                }
                new Function(text);
            } catch (e) {
                return fail(400, {error: "DataURL is not valid JavaScript"});
            }

        } else if (source_url.match(/^https?:\/\//)) {

            // Validate if server response is valid
            try {
                const response = await fetch(source_url)
                if (!response.ok) {
                    return fail(400, {error: "URL's server did not respond with 200 OK"});
                }

                // Validate allow origin header
                const allowOrigin = response.headers.get("access-control-allow-origin");
                if (!allowOrigin || allowOrigin !== "*") {
                    return fail(400, {error: "URL's server does not allow cross-origin requests"});
                }
            } catch (e) {
                return fail(400, {error: "failed to fetch URL"});
            }

            // validate if it parses correctly
            try {
                const response = await fetch(source_url);
                const text = await response.text();
                new Function(text);
            } catch (e) {
                return fail(400, {error: "URL is not valid JavaScript"});
            }
        } else {
            return fail(400, {error: "URL must be HTTP or DataURL"})
        }

        try {
            const {rows: [new_script]} = await sql`
                INSERT INTO scripts (source_url, user_id)
                VALUES (${source_url}, ${user_id})
                RETURNING source_url
                ;
            `;

            redirect(303, `/scripts/${encodeURIComponent(new_script.source_url)}`);
        } catch (error) {
            if (error?.code === "23505") {
                return fail(400, {error: "URL already exists in database"});
            }
            throw error;
        }
    },
}
