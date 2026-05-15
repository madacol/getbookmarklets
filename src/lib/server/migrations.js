import { createRequire } from 'node:module';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';

const require = createRequire(import.meta.url);
const { Client } = pg;

/**
 * @typedef {{ name: string, path: string }} MigrationFile
 * @typedef {{ query: (text: string, params?: unknown[]) => Promise<{ rows?: unknown[] }> }} Queryable
 */

/**
 * @param {TemplateStringsArray | string} strings
 * @param {unknown[]} values
 */
export function formatMigrationSql(strings, values = []) {
    if (typeof strings === 'string') return strings;
    if (values.length > 0) {
        throw new Error('Migration SQL interpolation is not supported. Use static SQL in migration files.');
    }
    return strings.join('');
}

export function createMigrationBuilder() {
    /** @type {string[]} */
    const statements = [];
    /**
     * @param {TemplateStringsArray | string} strings
     * @param {...unknown} values
     */
    const sql = (strings, ...values) => {
        statements.push(formatMigrationSql(strings, values));
    };

    return {
        pgm: { sql },
        statements,
    };
}

/**
 * @param {string} migrationsDir
 */
export async function getMigrationFiles(migrationsDir) {
    const entries = await readdir(migrationsDir, { withFileTypes: true });
    return entries
        .filter(entry => entry.isFile() && /^\d+_.+\.cjs$/.test(entry.name))
        .map(entry => ({
            name: entry.name.replace(/\.cjs$/, ''),
            path: path.join(migrationsDir, entry.name),
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * @param {Queryable} client
 */
export async function ensureMigrationsTable(client) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS pgmigrations (
            name TEXT PRIMARY KEY,
            run_on TIMESTAMP NOT NULL DEFAULT NOW()
        );
    `);
}

/**
 * @param {Queryable} client
 */
export async function getAppliedMigrationNames(client) {
    const result = await client.query('SELECT name FROM pgmigrations ORDER BY run_on ASC, name ASC;');
    return new Set((result.rows ?? []).map(row => String(/** @type {{ name: string }} */ (row).name)));
}

/**
 * @param {Queryable} client
 * @param {MigrationFile} migration
 * @param {'up' | 'down'} direction
 */
export async function runSingleMigration(client, migration, direction) {
    const module = require(migration.path);
    const migrate = module[direction];

    if (typeof migrate !== 'function') {
        throw new Error(`Migration ${migration.name} does not export ${direction}()`);
    }

    const { pgm, statements } = createMigrationBuilder();
    await migrate(pgm);

    await client.query('BEGIN');
    try {
        for (const statement of statements) {
            await client.query(statement);
        }

        if (direction === 'up') {
            await client.query('INSERT INTO pgmigrations (name, run_on) VALUES ($1, NOW());', [migration.name]);
        } else {
            await client.query('DELETE FROM pgmigrations WHERE name = $1;', [migration.name]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
}

/**
 * @param {object} options
 * @param {Queryable} options.client
 * @param {string} options.migrationsDir
 * @param {'up' | 'down' | 'redo'} options.command
 * @param {number} [options.count]
 */
export async function runMigrations({ client, migrationsDir, command, count = 1 }) {
    await ensureMigrationsTable(client);

    const migrations = await getMigrationFiles(migrationsDir);
    const appliedNames = await getAppliedMigrationNames(client);
    const appliedMigrations = migrations.filter(migration => appliedNames.has(migration.name));

    if (command === 'up') {
        for (const migration of migrations) {
            if (!appliedNames.has(migration.name)) {
                await runSingleMigration(client, migration, 'up');
            }
        }
        return;
    }

    if (command === 'down' || command === 'redo') {
        const migrationsToRevert = appliedMigrations.slice(-count).reverse();
        for (const migration of migrationsToRevert) {
            await runSingleMigration(client, migration, 'down');
        }
    }

    if (command === 'redo') {
        await runMigrations({ client, migrationsDir, command: 'up' });
        return;
    }

    if (command !== 'down') {
        throw new Error(`Unknown migration command: ${command}`);
    }
}

/**
 * @param {string[]} args
 */
export function parseMigrationArgs(args) {
    /** @type {'up' | 'down' | 'redo'} */
    let command = 'up';
    let count = 1;
    let envPath;

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];

        if (arg === 'up' || arg === 'down' || arg === 'redo') {
            command = arg;
            const next = args[index + 1];
            if (next && /^\d+$/.test(next)) {
                count = Number(next);
                index += 1;
            }
            continue;
        }

        if (arg === '--envPath') {
            envPath = args[index + 1];
            index += 1;
            continue;
        }

        if (arg === '--template-file-name') {
            index += 1;
            continue;
        }

        throw new Error(`Unknown migration argument: ${arg}`);
    }

    return { command, count, envPath };
}

/**
 * @param {string[]} args
 * @param {object} [options]
 * @param {string} [options.cwd]
 */
export async function runMigrationCli(args, { cwd = process.cwd() } = {}) {
    const { command, count, envPath } = parseMigrationArgs(args);
    dotenv.config(envPath ? { path: path.resolve(cwd, envPath) } : undefined);

    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is required to run migrations');
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        await runMigrations({
            client,
            migrationsDir: path.join(cwd, 'migrations'),
            command,
            count,
        });
    } finally {
        await client.end();
    }
}
