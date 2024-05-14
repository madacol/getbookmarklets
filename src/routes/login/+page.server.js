import argon2 from "argon2";
import { sql } from "$lib/server/db";
import { cookies_options } from "$lib/server/config";
import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ cookies, request, url }) => {
        const data = await request.formData();
        const username = data.get("username");
        const password = data.get("password");

        if (typeof password !== "string") {
            return fail(422, {error: "Password is invalid"})
        }

        const {rows: [user]} = await sql`
            SELECT
                user_id,
                password_hash
            FROM users
            WHERE username=${username}
            ;
        `

        if (!user) {
            return fail(422, {error: `User "${username}" does not exist`})
        }

        {
            const isPasswordValid = await argon2.verify(user.password_hash, password);
            if (!isPasswordValid)
                return fail(422, {error: "Wrong password"})
        }

        // Insert session in DB and get session_id (uuid)
        const {rows: [session]} = await sql`
            INSERT INTO sessions (user_id, expires_at)
                VALUES (${user.user_id}, NOW() + INTERVAL '30 days')
                RETURNING session_id;
        `;

        cookies.set("session", session.session_id, cookies_options);

        redirect(303, url.searchParams.get('redirectTo') ?? '/');
    },
}
