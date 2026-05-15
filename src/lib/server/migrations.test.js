import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { parseMigrationArgs, runMigrations } from './migrations.js';

class FakeClient {
    /** @type {Set<string>} */
    applied = new Set();
    /** @type {string[]} */
    statements = [];

    /**
     * @param {string} text
     * @param {unknown[]} [params]
     */
    async query(text, params = []) {
        const normalized = text.trim().replace(/\s+/g, ' ');

        if (normalized.startsWith('CREATE TABLE IF NOT EXISTS pgmigrations')) {
            return { rows: [] };
        }

        if (normalized.startsWith('SELECT name FROM pgmigrations')) {
            return {
                rows: [...this.applied].map(name => ({ name })),
            };
        }

        if (normalized.startsWith('INSERT INTO pgmigrations')) {
            this.applied.add(String(params[0]));
            return { rows: [] };
        }

        if (normalized.startsWith('DELETE FROM pgmigrations')) {
            this.applied.delete(String(params[0]));
            return { rows: [] };
        }

        if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(normalized)) {
            this.statements.push(normalized);
            return { rows: [] };
        }

        this.statements.push(normalized);
        return { rows: [] };
    }
}

/** @type {string | undefined} */
let tempDir;

afterEach(async () => {
    if (tempDir) {
        await rm(tempDir, { recursive: true, force: true });
        tempDir = undefined;
    }
});

async function createMigrationDir() {
    tempDir = await mkdtemp(path.join(os.tmpdir(), 'getbookmarklets-migrations-'));
    await writeFile(path.join(tempDir, '1000_create-one.cjs'), `
        exports.up = ({ sql }) => sql\`CREATE TABLE one (id integer);\`;
        exports.down = ({ sql }) => sql\`DROP TABLE one;\`;
    `);
    await writeFile(path.join(tempDir, '2000_create-two.cjs'), `
        exports.up = pgm => pgm.sql('CREATE TABLE two (id integer);');
        exports.down = pgm => pgm.sql('DROP TABLE two;');
    `);
    return tempDir;
}

describe('parseMigrationArgs', () => {
    it('parses the commands used by package scripts', () => {
        expect(parseMigrationArgs(['up', '--envPath', './.env.test'])).toEqual({
            command: 'up',
            count: 1,
            envPath: './.env.test',
        });
        expect(parseMigrationArgs(['redo', '9999', '--envPath', './.env.test'])).toEqual({
            command: 'redo',
            count: 9999,
            envPath: './.env.test',
        });
    });
});

describe('runMigrations', () => {
    it('runs pending migrations once and records them', async () => {
        const migrationsDir = await createMigrationDir();
        const client = new FakeClient();

        await runMigrations({ client, migrationsDir, command: 'up' });
        await runMigrations({ client, migrationsDir, command: 'up' });

        expect([...client.applied]).toEqual(['1000_create-one', '2000_create-two']);
        expect(client.statements.filter(statement => statement.startsWith('CREATE TABLE'))).toEqual([
            'CREATE TABLE one (id integer);',
            'CREATE TABLE two (id integer);',
        ]);
    });

    it('reverts applied migrations in reverse order before running them again', async () => {
        const migrationsDir = await createMigrationDir();
        const client = new FakeClient();

        await runMigrations({ client, migrationsDir, command: 'up' });
        client.statements = [];

        await runMigrations({ client, migrationsDir, command: 'redo', count: 9999 });

        expect(client.statements.filter(statement => statement.includes('TABLE'))).toEqual([
            'DROP TABLE two;',
            'DROP TABLE one;',
            'CREATE TABLE one (id integer);',
            'CREATE TABLE two (id integer);',
        ]);
        expect([...client.applied]).toEqual(['1000_create-one', '2000_create-two']);
    });
});
