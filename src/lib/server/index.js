import { sql } from "./db";

/**
 * Create a cache with a given name. Uses a Postgres SQL database to store the cache.
 * @param {string} name
 * @returns {{get: (key: string) => Promise<any>, set: (key: string, value: any) => Promise<void>}}
 */
export function createCache(name) {
    return ({
        get: async (key) => {
            const { rows: [row] } = await sql`
                SELECT value FROM cache WHERE name = ${name} AND key = ${key};
            `;
            return row?.value;
        },
        set: async (key, value) => {
            const object = {value};
            await sql`
                INSERT INTO cache (name, key, value)
                VALUES (${name}, ${key}, ${object})
                ON CONFLICT (name, key) DO UPDATE SET value = ${object};
            `;
        }
    })
}

const cache = createCache('rate-limit');

/**
 * Rate limit requests by key
 * The way it works is by storing timestamps of requests in a cache
 * If the number of timestamps in the window interval is greater than the limit, it returns true
 * Otherwise, it adds the current timestamp to the cache and returns false
 * 
 * @param {string} key - key to rate limit by
 * @param {number} limit - number of requests allowed in the window interval
 * @param {number} windowInterval - window interval in seconds
 * @returns {Promise<boolean>}
 */
export async function rateLimit(key, limit=1, windowInterval = 3600*16) {
    const object = await cache.get(key);
    /** @type {number[]} */
    const timestamps = object?.value;
    if (!timestamps) {
        await cache.set(key, [Date.now()]);
        return false;
    }

    const now = Date.now();
    const windowStart = now - windowInterval * 1000;

    // timestamps are stored in ascending order, find the first valid, and slice
    const firstValid = timestamps.findIndex(timestamp => timestamp > windowStart);
    const validTimestamps = (firstValid === -1) ? [] : timestamps.slice(firstValid);

    if (validTimestamps.length >= limit) {
        return true;
    }

    validTimestamps.push(now);
    await cache.set(key, validTimestamps);
    return false;
}