import { sql } from './lib/server/db';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const request_start_time = Date.now();

    const method = event.request.method;
    const path = event.url.pathname;
    const params = Object.fromEntries(event.url.searchParams);
    const headers = Object.fromEntries(event.request.headers);
    const request_clone = event.request.clone();

    /*********************/

    const response = await resolve(event);

    /*********************/

    // exit if route is not found
    if (response.status === 404) {
        return response;
    }

    let body = null;
    if (response.status >= 500) {
        body = await request_clone.text();
    }

    let response_body = null;
    if (response.status >= 300) {
        response_body = await response.clone().text();
    }

    // get response time in milliseconds
    const response_time = Date.now() - request_start_time;

    await sql`
        INSERT INTO logs (
            path,
            method,
            params,
            headers,
            user_session,
            body,
            response_body,
            response_time,
            response_status
        ) VALUES (
            ${path},
            ${method},
            ${params},
            ${headers},
            ${event.locals.user},
            ${body},
            ${response_body},
            ${response_time},
            ${response.status}
        ) RETURNING log_id
        ;
    `;

    return response;
}
