import { sql } from "$lib/server/db";

export async function load({ params }) {

    const { source_url } = params;

    return { source_url }
}
