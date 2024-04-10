import { checkPermissions_MW } from "$lib/server/checkPermissions_MW";
import { sql } from "$lib/server/db";

export const load = checkPermissions_MW(
    'read_users',
    async () => {

        const {rows: logs} =await sql`
            SELECT
                path,
                user_session->'username' as username,
                created_at,
                method,
                response_status as status,
                headers->'referer' as referer,
                headers->'x-vercel-ip-city' as city,
                headers->'x-vercel-ip-timezone' as timezone,
                headers->'x-vercel-ip-country' as country,
                headers->'x-real-ip' as ip,
                headers->'user-agent' as user_agent,
                headers,
                user_session,
                params,
                body
            FROM logs
            ORDER BY created_at DESC
            LIMIT 500;
        `
        return {
            logs
        }
    }
)
