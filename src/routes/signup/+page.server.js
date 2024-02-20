import argon2 from "argon2";
import { sql } from "../../lib/server/db";
import { argon_options, cookies_options } from "$lib/server/config";
import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { PASSWORD_MINLENGTH } from "$lib/config";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ cookies, request, url }) => {
        const data = await request.formData();
        const username = data.get("username");
        const password = data.get("password");

        if (typeof password !== "string") {
            return fail(422, {error: "Password must be a string"})
        }

        if (password.length < PASSWORD_MINLENGTH) {
            return fail(422, {error: `Password must be at least ${PASSWORD_MINLENGTH} characters long`})
        }

        const password_hash = await argon2.hash(password, argon_options);

        const {rows: [user]} = await sql`
            SELECT 1
            FROM users
            WHERE username = ${username}
            ;
        `

        if (user) {
            return fail(409, {error: `User "${username}" already exists`})
        }

        const {rows: [session]} = await sql`
            WITH new_user AS (
                INSERT INTO users (
                    username
                    , password_hash
                )
                VALUES (
                    ${username}
                    , ${password_hash}
                )
                RETURNING user_id
            )
            INSERT INTO sessions (user_id, expires_at)
            SELECT user_id, NOW() + INTERVAL '1 day'
            FROM new_user
            RETURNING session_id
            ;
        `

        cookies.set("session", session.session_id, cookies_options);

        throw redirect(303, url.searchParams.get('redirectTo') ?? '/');
    },
}
