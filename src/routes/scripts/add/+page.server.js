import { sql } from "$lib/server/db";
import { rateLimit } from "$lib/server";
import { fail, redirect } from "@sveltejs/kit";
import { isURLInvalid } from "$lib";

/** @type {Map<any, number>} */
const debounceCache = new Map();
const debounceTime = 5000; // 5 seconds

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ request, fetch, url }) => {

        const data = await request.formData();
        const source_url = data.get("source_url");

        const cachedUrlAttempt = debounceCache.get(source_url);
        if (cachedUrlAttempt && ((Date.now() - cachedUrlAttempt) < debounceTime)) {
            return fail(429, {error: "Too many requests for this URL. Please wait."});
        }

        const ip = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for');
        const cachedIpAttempt = debounceCache.get(ip);
        if (cachedIpAttempt && ((Date.now() - cachedIpAttempt) < debounceTime)) {
            return fail(429, {error: "Too many requests from this IP. Please wait."});
        }

        debounceCache.set(source_url, Date.now());
        debounceCache.set(ip, Date.now());

        const error = await isURLInvalid(source_url, fetch);
        if (error) return fail(400, {error});

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
                INSERT INTO scripts (source_url)
                VALUES (${source_url})
                RETURNING source_url
                ;
            `;
        } catch (error) {
            if (error?.code === "23505") {
                return fail(400, {error: "URL already exists in database"});
            }
            throw error;
        }

        redirect(303, `/scripts#${source_url}`);
    },
}

