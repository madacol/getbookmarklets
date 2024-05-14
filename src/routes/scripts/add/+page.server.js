import { sql } from "$lib/server/db";
import { rateLimit } from "$lib/server";
import { fail, redirect } from "@sveltejs/kit";
import { isURLInvalid } from "$lib";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals, fetch, url }) => {

        let rateLimitPromise;
        {
            const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for');

            if (ip) {
                const key = ip + url.pathname;
                rateLimitPromise = rateLimit(key, 2);
            } else {
                console.error('IP address not found in request headers');
                rateLimitPromise = Promise.resolve(false);
            }
        }

        const data = await request.formData();
        /** @type {string} */
        // @ts-ignore
        const source_url = data.get("source_url");
        const user_id = locals.user?.user_id;

        if (!user_id) return fail(401, {error: "You must be logged in to add a script"});

        const error = await isURLInvalid(source_url, fetch);
        if (error) return fail(400, {error});

        const isRateLimited = await rateLimitPromise;
        if (isRateLimited) {
            return fail(429, {error: "Daily limit reached. Try again tomorrow"});
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



