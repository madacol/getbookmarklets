#!/usr/bin/env node
import { spawn } from 'node:child_process';

const port = process.env.PORT || '4173';
const nodeBinDir = '/home/mada/.nvm/versions/node/v24.2.0/bin';
const env = {
    ...process.env,
    PGLITE_DB: process.env.PGLITE_DB || '.pglite/getbookmarklets-local',
    PATH: `${nodeBinDir}:${process.env.PATH || ''}`,
};

const child = spawn('pnpm', [
    'with:pglite',
    '--',
    'sh',
    '-c',
    `pnpm migrate up --envPath ./.env.test && pnpm preview --host 127.0.0.1 --port ${port}`,
], {
    env,
    stdio: 'inherit',
});

for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
        child.kill(signal);
    });
}

child.on('exit', (code, signal) => {
    if (signal) {
        process.kill(process.pid, signal);
        return;
    }
    process.exit(code ?? 1);
});
