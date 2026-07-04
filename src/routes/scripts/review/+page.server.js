import { fail } from "@sveltejs/kit";
import { checkPermissions_MW } from "$lib/server/checkPermissions_MW";
import { sql } from "$lib/server/db";
import { getScriptSource } from "$lib";
import { createScriptContentHash } from "$lib/server/scriptHash";

const SCRIPT_STATUSES = new Set(['needs_review', 'accepted', 'rejected']);

export const load = checkPermissions_MW(
    'review_scripts',
    async () => {
        const {rows: scripts} = await sql`
            SELECT
                script_id,
                source_url,
                content_hash,
                status,
                created_at
            FROM scripts
            WHERE status = 'needs_review'
            ORDER BY created_at ASC
            LIMIT 100;
        `;
        const {rows: otherScripts} = await sql`
            SELECT
                script_id,
                source_url,
                content_hash,
                status,
                created_at
            FROM scripts
            WHERE status <> 'needs_review'
            ORDER BY created_at DESC
            LIMIT 100;
        `;

        return { scripts, otherScripts };
    }
);

/** @type {import('./$types').Actions} */
export const actions = {
    accept: checkPermissions_MW(
        'review_scripts',
        async ({ request, fetch }) => {
            const data = await request.formData();
            const script_id = data.get('script_id');
            const source_url = data.get('source_url');

            if (typeof script_id !== 'string' || typeof source_url !== 'string') {
                return fail(422, {error: 'Script review request is invalid'});
            }

            let content_hash;
            try {
                const source = await getScriptSource(source_url, fetch);
                content_hash = createScriptContentHash(source);
            } catch (error) {
                return fail(400, {error: 'Could not fetch script content for review'});
            }

            await sql`
                UPDATE scripts
                SET
                    status = 'accepted',
                    content_hash = ${content_hash}
                WHERE script_id = ${script_id}
                    AND source_url = ${source_url}
            `;

            return {accepted: script_id};
        }
    ),
    reject: checkPermissions_MW(
        'review_scripts',
        async ({ request }) => {
            const data = await request.formData();
            const script_id = data.get('script_id');

            if (typeof script_id !== 'string') {
                return fail(422, {error: 'Script review request is invalid'});
            }

            await sql`
                UPDATE scripts
                SET status = 'rejected'
                WHERE script_id = ${script_id}
            `;

            return {rejected: script_id};
        }
    ),
    update: checkPermissions_MW(
        'review_scripts',
        async ({ request, fetch }) => {
            const data = await request.formData();
            const script_id = data.get('script_id');
            const source_url = data.get('source_url');
            const status = data.get('status');

            if (
                typeof script_id !== 'string' ||
                typeof source_url !== 'string' ||
                typeof status !== 'string' ||
                !SCRIPT_STATUSES.has(status)
            ) {
                return fail(422, {error: 'Script update request is invalid'});
            }

            let content_hash;
            try {
                const source = await getScriptSource(source_url, fetch);
                content_hash = createScriptContentHash(source);
            } catch (error) {
                return fail(400, {error: 'Could not fetch script content for update'});
            }

            try {
                await sql`
                    UPDATE scripts
                    SET
                        source_url = ${source_url},
                        status = ${status},
                        content_hash = ${content_hash}
                    WHERE script_id = ${script_id}
                `;
            } catch (error) {
                if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
                    return fail(400, {error: 'URL already exists in database'});
                }
                throw error;
            }

            return {updated: script_id};
        }
    ),
    delete: checkPermissions_MW(
        'review_scripts',
        async ({ request }) => {
            const data = await request.formData();
            const script_id = data.get('script_id');

            if (typeof script_id !== 'string') {
                return fail(422, {error: 'Script delete request is invalid'});
            }

            await sql`
                DELETE FROM scripts
                WHERE script_id = ${script_id}
            `;

            return {deleted: script_id};
        }
    ),
};
