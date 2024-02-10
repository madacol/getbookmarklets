import { sql } from '$lib/server/db.js';

export async function load({ locals }) {
    return {
        user: locals.user
    }
}