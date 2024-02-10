import argon2 from "argon2";
import { sql } from "../../lib/server/db";
import { argon_options } from "$lib/server/config";
import { fail } from "@sveltejs/kit";
import { PASSWORD_MINLENGTH } from "$lib/config";
import { sendMail } from "$lib/server/sendMail";

/** @type {import('./$types').Actions} */
export const actions = {
	password_change: async ({ locals, request, url }) => {
        const data = await request.formData();
        const password = data.get("password");

        if (typeof password !== "string") {
            return fail(422, {error: "Password must be a string"})
        }

        if (password.length < PASSWORD_MINLENGTH) {
            return fail(422, {error: `Password must be at least ${PASSWORD_MINLENGTH} characters long`})
        }

        const password_hash = await argon2.hash(password, argon_options);

        const {rows: [user]} = await sql`
            UPDATE users
            SET password_hash = ${password_hash}
            WHERE user_id = ${locals.user.user_id}
            RETURNING email, name
        `

        /**
         * Subject: Password changed!
         * 
         * Dear ${user.name}
         * Your password has been changed.
         * 
         * If you did not request this change, please contact us immediately, by replying to this email.
         * 
         * Best regards,
         * The Friendpals Team
         */
        sendMail(
            user.email.toString(),
            "Password changed!",
            `Dear ${user.name}\n`
                + "Your password has been changed.\n\n"
                + "If you did not request this change, please contact us immediately, by replying to this email.\n\n"
                + "Best regards,\n"
                + "The Friendpals Team"
        );

        return {
            success: true,
            message: "Password changed successfully"
        }
    },
}
