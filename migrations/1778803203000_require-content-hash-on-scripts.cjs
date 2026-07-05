const { createHash } = require('node:crypto');
const { Client } = require('pg');

/**
 * @typedef {{ script_id: string, source_url: string }} ScriptWithoutHash
 * @typedef {{ query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>, connect: () => Promise<void>, end: () => Promise<void> }} BackfillClient
 * @typedef {{ sql: (strings: TemplateStringsArray | string) => void }} MigrationBuilder
 */

/**
 * @param {string} source
 * @returns {string}
 */
function normalizeScriptSource(source) {
    return source.trim().replace(/^javascript:/, '');
}

/**
 * @param {string} source
 * @returns {string}
 */
function createScriptContentHash(source) {
    return createHash('sha256').update(source).digest('hex');
}

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function getScriptSource(url) {
    const response = await fetch(url, url.startsWith('data:') ? undefined : { redirect: 'manual' });
    if (!response.ok) {
        throw new Error(`Script URL did not respond with 200 OK: ${url}`);
    }
    if (!response.body) {
        throw new Error(`Script URL response body is empty: ${url}`);
    }
    return normalizeScriptSource(await response.text());
}

/**
 * @param {BackfillClient} client
 */
async function backfillMissingContentHashes(client) {
    const result = await client.query(`
        SELECT script_id, source_url
        FROM scripts
        WHERE content_hash IS NULL
        ORDER BY created_at ASC;
    `);
    const scripts = /** @type {ScriptWithoutHash[]} */ (result.rows);

    for (const script of scripts) {
        const source = await getScriptSource(script.source_url);
        const content_hash = createScriptContentHash(source);
        await client.query(
            `
                UPDATE scripts
                SET content_hash = $1
                WHERE script_id = $2
                    AND content_hash IS NULL;
            `,
            [content_hash, script.script_id]
        );
    }
}

/**
 * @param {MigrationBuilder} builder
 */
exports.up = async ({sql}) => {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        await backfillMissingContentHashes(client);
    } finally {
        await client.end();
    }

    sql`
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM scripts WHERE content_hash IS NULL) THEN
                RAISE EXCEPTION 'scripts.content_hash still has NULL values';
            END IF;
        END $$;

        ALTER TABLE scripts
        ALTER COLUMN content_hash SET NOT NULL;

        ALTER TABLE scripts
        DROP CONSTRAINT scripts_content_hash_check;

        ALTER TABLE scripts
        ADD CONSTRAINT scripts_content_hash_check
        CHECK (content_hash ~ '^[0-9a-f]{64}$');
    `;
};

/**
 * @param {MigrationBuilder} builder
 */
exports.down = ({sql}) => {
    sql`
        ALTER TABLE scripts
        ALTER COLUMN content_hash DROP NOT NULL;

        ALTER TABLE scripts
        DROP CONSTRAINT scripts_content_hash_check;

        ALTER TABLE scripts
        ADD CONSTRAINT scripts_content_hash_check
        CHECK (content_hash IS NULL OR content_hash ~ '^[0-9a-f]{64}$');
    `;
};
