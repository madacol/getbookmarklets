import { error } from '@sveltejs/kit';

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
        if (event.locals.user !== null) {
            const userPermissions = event.locals.user.permissions;

            const isAuthorized = checkPermissions(permissionsRequired_arr, userPermissions);
            if (isAuthorized) return await handler(event);

            console.warn(`Unauthorized to perform this action.\nNeed following permissions: ${permissionsRequired.toString()}`);
            throw error(403, "Unauthorized to perform this action")
        }

        throw error(403, "Requires authentication")
    }
}