import { error, redirect } from '@sveltejs/kit';
import { sql } from './db';

/**
 * Validate if `userPermissions` contains all `permissionsRequired`
 *
 * @param {string[]} permissionsRequired - List of `permissions` to be validated
 * @param {string[]} userPermissions - List of `permissions` the user has
 *
 * @return {boolean}
 */
export function checkPermissions (permissionsRequired, userPermissions) {

    return permissionsRequired.every(permission => {
        // All *permissions* must pass this validation
        if (userPermissions.includes(permission)) return true;

        return false;
    })
}

/**
 * @param {string|string[]} permissionsRequired
 * @param {(request: import('@sveltejs/kit').RequestEvent) => Promise<any>} handler
 * @returns {(request: import('@sveltejs/kit').RequestEvent) => Promise<any>}
 */
export function checkPermissions_MW (permissionsRequired, handler) {
    const permissionsRequired_arr = (typeof permissionsRequired === 'string')
        ? [permissionsRequired]
        : permissionsRequired

    return async (event) => {

        /**
         * Validate if user is logged in
         */

        const session_id = event.cookies.get('session');

        let user;
        if (!session_id) {
            return error(404, `Not Found`);
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
        if (!user) {
            return error(404, `Not Found`);
        }

        if (user.expired) {
            // Session expired
            await sql`
                DELETE FROM sessions
                WHERE session_id=${session_id}
                ;
            `;
            event.cookies.delete('session', { path: '/' });

            return redirect(303, `/login?redirectTo=${event.url.pathname}`);
        }

        // User is logged in
        event.locals.user = user;
        if (event.url.pathname === '/login' || event.url.pathname === '/signup') {
            return redirect(303, '/');
        }

        /**
         * Validate if user has required permissions
         */

        const userPermissions = event.locals.user.permissions;

        const isAuthorized = checkPermissions(permissionsRequired_arr, userPermissions);
        if (isAuthorized) return await handler(event);

        console.warn(`Unauthorized to perform this action.\nNeed following permissions: ${permissionsRequired.toString()}`);
        error(403, "Unauthorized to perform this action")
    }
}