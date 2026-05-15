import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

const host = process.env.PGLITE_HOST || '127.0.0.1';
const port = Number(process.env.PGLITE_PORT || 55432);
const db = process.env.PGLITE_DB || 'memory://';
const databaseUrl = process.env.DATABASE_URL || `postgresql://postgres:postgres@${host}:${port}/postgres`;
const stateDir = path.join(os.tmpdir(), `getbookmarklets-pglite-${host.replaceAll(':', '_')}-${port}`);
const stateFile = path.join(stateDir, 'leases.json');
const stateLockDir = path.join(stateDir, 'state.lock');
const startLockDir = path.join(stateDir, 'start.lock');
const leaseId = `${process.pid}-${randomUUID()}`;
const leaseStaleMs = Number(process.env.PGLITE_LEASE_STALE_MS || 30000);

const args = process.argv.slice(2);
const separatorIndex = args.indexOf('--');
const command = separatorIndex === -1 ? args : args.slice(separatorIndex + 1);

if (command.length === 0) {
    console.error('Usage: pnpm with:pglite -- <command> [args...]');
    process.exit(1);
}

async function sleep(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

function canConnect() {
    return new Promise((resolve) => {
        const socket = net.createConnection({ host, port });
        socket.once('connect', () => {
            socket.end();
            resolve(true);
        });
        socket.once('error', () => resolve(false));
        socket.setTimeout(500, () => {
            socket.destroy();
            resolve(false);
        });
    });
}

async function acquireDirLock(lockDir, timeoutMs = 15000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        try {
            await fs.mkdir(lockDir, { recursive: false });
            return async () => {
                await fs.rm(lockDir, { recursive: true, force: true });
            };
        } catch (error) {
            if (error?.code !== 'EEXIST') throw error;
            await sleep(100);
        }
    }
    throw new Error(`Timed out waiting for lock ${lockDir}`);
}

async function readState() {
    try {
        return JSON.parse(await fs.readFile(stateFile, 'utf8'));
    } catch (error) {
        if (error?.code === 'ENOENT') return { leases: {} };
        throw error;
    }
}

async function writeState(state) {
    await fs.mkdir(stateDir, { recursive: true });
    await fs.writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`);
}

function pruneState(state) {
    const now = Date.now();
    const leases = Object.fromEntries(
        Object.entries(state.leases ?? {})
            .filter(([, lease]) => {
                const updatedAt = Date.parse(lease.updatedAt || lease.startedAt || '');
                return Number.isFinite(updatedAt) && now - updatedAt <= leaseStaleMs;
            })
    );
    return { ...state, leases };
}

async function updateState(updater) {
    await fs.mkdir(stateDir, { recursive: true });
    const release = await acquireDirLock(stateLockDir);
    try {
        const state = pruneState(await readState());
        const updated = await updater(state);
        await writeState(pruneState(updated));
        return updated;
    } finally {
        await release();
    }
}

async function addLease() {
    await updateState((state) => {
        state.leases ??= {};
        state.leases[leaseId] = {
            pid: process.pid,
            command: command.join(' '),
            startedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        return state;
    });
}

async function touchLease() {
    await updateState((state) => {
        if (state.leases?.[leaseId]) {
            state.leases[leaseId].updatedAt = new Date().toISOString();
        }
        return state;
    });
}

async function removeLease() {
    await updateState((state) => {
        delete state.leases?.[leaseId];
        return state;
    });
}

async function activeLeaseCount() {
    return updateState(state => state).then(state => Object.keys(state.leases ?? {}).length);
}

async function waitForOtherLeasesToFinish() {
    while (await activeLeaseCount() > 0) {
        await sleep(250);
    }
}

async function waitForServer(timeoutMs = 10000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeoutMs) {
        if (await canConnect()) return;
        await sleep(100);
    }
    throw new Error(`PGlite did not start on ${host}:${port}`);
}

function run(command, env) {
    return new Promise((resolve) => {
        const child = spawn(command[0], command.slice(1), {
            env,
            stdio: 'inherit',
        });
        child.on('exit', (code, signal) => resolve({ code, signal }));
    });
}

let server;
let startedServer = false;
let leaseRemoved = false;
let heartbeat;

async function shutdown() {
    if (heartbeat) clearInterval(heartbeat);

    if (!leaseRemoved) {
        leaseRemoved = true;
        await removeLease();
    }

    if (!server || !startedServer || server.killed) return;

    await waitForOtherLeasesToFinish();
    server.kill('SIGTERM');
    await new Promise((resolve) => {
        const force = setTimeout(() => {
            if (!server.killed) server.kill('SIGKILL');
            resolve();
        }, 5000);
        server.once('exit', () => {
            clearTimeout(force);
            resolve();
        });
    });
}

async function main() {
    await addLease();
    heartbeat = setInterval(() => {
        touchLease().catch(error => console.error('Failed to refresh PGlite lease', error));
    }, Math.max(1000, Math.floor(leaseStaleMs / 3)));

    const childEnv = {
        ...process.env,
        DATABASE_URL: databaseUrl,
        DOMAIN: process.env.DOMAIN ?? '',
    };

    if (!(await canConnect())) {
        const releaseStartLock = await acquireDirLock(startLockDir);
        try {
            if (await canConnect()) {
                console.log(`Reusing PGlite-compatible server at ${databaseUrl}`);
            } else {
                console.log(`Starting PGlite server at ${databaseUrl}`);
                startedServer = true;
                server = spawn('pglite-server', [
                    `--db=${db}`,
                    `--host=${host}`,
                    `--port=${port}`,
                    '--extensions=pgcrypto',
                    '--max-connections=10',
                ], {
                    env: process.env,
                    stdio: ['ignore', 'inherit', 'inherit'],
                });

                await waitForServer();
            }
        } finally {
            await releaseStartLock();
        }
    } else {
        console.log(`Reusing PGlite-compatible server at ${databaseUrl}`);
    }

    const { code, signal } = await run(command, childEnv);
    await shutdown();

    if (signal) {
        process.kill(process.pid, signal);
    }
    process.exit(code ?? 1);
}

process.once('SIGINT', async () => {
    await shutdown();
    process.exit(130);
});

process.once('SIGTERM', async () => {
    await shutdown();
    process.exit(143);
});

main().catch(async (error) => {
    console.error(error);
    await shutdown();
    process.exit(1);
});
