import argon2 from "argon2";
import { sql } from "../../lib/server/db";
import { argon_options, cookies_options } from "$lib/server/config";
import { redirect } from "@sveltejs/kit";
import { fail } from "@sveltejs/kit";
import { PASSWORD_MINLENGTH } from "$lib/config";
import { sendMail } from "$lib/server/sendMail";

/** @type {import('./$types').Actions} */
export const actions = {
	default: async ({ cookies, request, url }) => {
        const data = await request.formData();
        const email = data.get("email");
        const password = data.get("password");
        const name = data.get("name");
        const lastname = data.get("lastname");
        const birthday = data.get("birthday");
        const gender = data.get("gender");

        // validate email
        if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return fail(422, {error: "Invalid email address"})
        }


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
            WHERE email = ${email}
            ;
        `

        if (user) {
            return fail(409, {error: `User "${email}" already exists`})
        }

        const {rows: [session]} = await sql`
            WITH new_user AS (
                INSERT INTO users (
                    email
                    , password_hash
                    , name
                    , lastname
                    , birthday
                    , gender
                )
                VALUES (
                    ${email}
                    , ${password_hash}
                    , ${name}
                    , ${lastname}
                    , ${birthday}
                    , ${gender}
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

        /**
         * Subject: Welcome to Friendpals!
         * 
         * Dear User,
         * 
         * A heartfelt thank you for registering! I am excited to welcome you at Friendpals, where we'll create unforgettable friendships together. To foster even more meaningful connections, I invite you to add some details and a friendly photo to your profile. This simple gesture can help us understand each other better and spark wonderful conversations. I can't wait to see you there!
         * 
         * Warm regards,
         * 
         * Ricardo Calleja
         * Friendpals Team
         */
        sendMail(
            email.toString(),
            "Welcome to Friendpals!",
            `Dear ${name}\n\n`
                + "A heartfelt thank you for registering! I am excited to welcome you at Friendpals, where we'll create unforgettable friendships together.\n\n"
                + `To foster even more meaningful connections, I invite you to add some details and a friendly photo to your profile by going into this link: ${url.href + "profile"}. This simple gesture can help us understand each other better and spark wonderful conversations. I can't wait to see you there!\n\n`
                + "Warm regards,\n\n"
                + "Ricardo Calleja\n"
                + "Friendpals Team"
        );

        throw redirect(303, url.searchParams.get('redirectTo') ?? '/');
    },
}
