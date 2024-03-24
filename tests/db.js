import dbBuilder from "../src/lib/server/dbBuilder";
import dotenv from 'dotenv';
dotenv.config();

const config = {
    common: {
        connectionString: process.env.DATABASE_URL,
        query_timeout: 30000,
        connectionTimeoutMillis: 20000,
    },
    get pool(){return {
        ...this.common,
        max: 3,
        idleTimeoutMillis: 30000,
    }},
    get client(){return this.common},
}

export const { sql } = dbBuilder(config);