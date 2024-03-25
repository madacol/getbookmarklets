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

        if (!user_id) return fail(401, {error: "You must be logged in to add a script"});

        const failed = await isURLInvalid(source_url);
        if (failed) return failed;

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

        /**
         * @param {string} url 
         */
        async function isURLInvalid(url) {

            if (!url) return fail(400, {error: "You must provide a URL"})

            if (url.length > 10000) {
                return fail(400, {error: "URL is too large"});
            }

            // Validate URL is http or dataURL
            if (url.startsWith("data:")) {
                // Validate if it is javascript and parses correctly
                try {
                    const response = await fetch(url);
                    const text = await response.text();
                    new Function(text);
                } catch (e) {
                    return fail(400, {error: "DataURL is not valid JavaScript"});
                }

            } else if (url.match(/^https?:\/\//)) {

            // Validate if server response is valid
                try {
                    const response = await fetch(url)
                    if (!response.ok) {
                        return fail(400, {error: "URL's server did not respond with 200 OK"});
                    }

                    // Validate allow origin header
                    const allowOrigin = response.headers.get("access-control-allow-origin");
                    if (allowOrigin !== "*") {
                        return fail(400, {error: "URL's server does not allow cross-origin requests"});
                    }
                } catch (e) {
                    return fail(400, {error: "failed to fetch URL"});
                }

                // validate if it parses correctly
                try {
                    const response = await fetch(url);
                    const text = await response.text();
                    new Function(text);
                } catch (e) {
                    return fail(400, {error: "URL is not valid JavaScript"});
                }
            } else {
                return fail(400, {error: "URL must be HTTP or DataURL"})
            }

            return false;
        }
    },
}