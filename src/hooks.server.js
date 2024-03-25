import { sql } from './lib/server/db';

/**
 * Custom redirect function
 * @param {string} location - The location to redirect to
 * @param {string} [body] - The response body
 * @returns {Response} The redirect response
 */
function redirect(location, body) {
    return new Response(body, {
        status: 303,
        headers: { location }
    });
}

const privateRoutes = [
];


/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
    const session_id = event.cookies.get('session');
    const isPathProtected = privateRoutes.some(regex => regex.test(event.url.pathname));

    let user;
    if (!session_id) {
        if (isPathProtected) {
            return redirect(`/login?redirectTo=${event.url.pathname}`, 'Not authenticated user.');
        }
    } else {

        ({rows: [user]} = await sql`
            SELECT
                users.user_id,
                users.username,
                sessions.expires_at < NOW() AS expired,
                ARRAY_REMOVE(ARRAY_AGG(role_id), NULL) AS roles,
                array_merge_agg(permissions) AS permissions
                -- ARRAY_AGG(DISTINCT unnest(permissions)) permissions
            FROM sessions
            JOIN users USING (user_id)
            LEFT JOIN join_users_roles USING (user_id)
            LEFT JOIN (
                SELECT
                    role_id,
                    roles.name,
                    ARRAY_AGG(permissions.name) permissions
                FROM roles
                JOIN join_roles_permissions USING (role_id)
                JOIN permissions USING (permission_id)
                GROUP BY role_id
            ) roles USING (role_id)
            WHERE session_id = ${session_id}
            GROUP BY
                users.user_id,
                users.username,
                sessions.expires_at
                ;
        `);
    }

    // Invalid session
    if (user?.expired) {
        await sql`
            DELETE FROM sessions
            WHERE session_id=${session_id}
            ;
        `;
        event.cookies.delete('session', { path: '/' });

        if (isPathProtected) {
            return redirect(`/login?redirectTo=${event.url.pathname}`, 'Invalid session.');
        }
    }

    // Session expired
    if (!user && isPathProtected) {
        return redirect(`/login?redirectTo=${event.url.pathname}`, 'Session expired');
    }

    // User is logged in
    if (user && !user.expired) {
        event.locals.user = user;
        if (event.url.pathname === '/login' || event.url.pathname === '/signup') {
            return redirect('/', 'Already logged in.');
        }
    }

    const method = event.request.method;
    const path = event.url.pathname;
    const params = Object.fromEntries(event.url.searchParams);
    const headers = Object.fromEntries(event.request.headers);

    const logPromise = sql`
        INSERT INTO logs (
            path,
            method,
            params,
            headers,
            user_session
        ) VALUES (
            ${path},
            ${method},
            ${params},
            ${headers},
            ${user}
        ) RETURNING log_id
        ;
    `

    const request_clone = event.request.clone();

    /*********************/

    const response = await resolve(event);

    /*********************/

    const {rows: [{log_id}]} = await logPromise;

    if (response.status >= 500) {
        const body = await request_clone.text();
        sql`
            UPDATE logs
                SET response_status = ${response.status}
                    , body = ${body}
                WHERE log_id = ${log_id}
            ;
        `
    } else {
        sql`
            UPDATE logs
                SET response_status = ${response.status}
                WHERE log_id = ${log_id}
            ;
        `
    }

    return response;
}
