#!/usr/bin/env node
import { runMigrationCli } from '../src/lib/server/migrations.js';

runMigrationCli(process.argv.slice(2)).catch(error => {
    console.error(error);
    process.exit(1);
});
