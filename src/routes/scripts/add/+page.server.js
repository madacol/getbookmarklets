import { sql } from "$lib/server/db";
import { rateLimit } from "$lib/server";
import { fail, redirect } from "@sveltejs/kit";
import { getScriptSource, isURLInvalid } from "$lib";
import { createScriptContentHash } from "$lib/server/scriptHash";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, fetch, url }) => {

        const data = await request.formData();
        const source_url = data.get("source_url");

        if (typeof source_url !== "string") {
            return fail(422, {error: "URL must be a string"});
        }

        const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for');

        const error = await isURLInvalid(source_url, fetch);
        if (error) return fail(400, {error});
        const source = await getScriptSource(source_url, fetch);
        const content_hash = createScriptContentHash(source);

        {
            if (ip) {
                const key = ip + url.pathname;
                const isRateLimited = await rateLimit(key, 2);
                if (isRateLimited) {
                    return fail(429, {error: "Daily limit reached. Try again tomorrow"});
                }
            } else {
                console.error('IP address not found in request headers');
            }
        }

        try {
            await sql`
                INSERT INTO scripts (source_url, status, content_hash)
                VALUES (${source_url}, ${'needs_review'}, ${content_hash})
                RETURNING source_url, status, content_hash
                ;
            `;
        } catch (error) {
            if (typeof error === 'object' && error !== null && 'code' in error && error.code === "23505") {
                return fail(400, {error: "URL already exists in database"});
            }
            throw error;
        }

        redirect(303, `/scripts#${source_url}`);
    },
}
