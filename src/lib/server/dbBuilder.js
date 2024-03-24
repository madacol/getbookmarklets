import pg from 'pg';
const { Pool, Client } = pg;

/**
 * @param {{ pool: pg.PoolConfig, client: string | pg.ClientConfig }} config
 */
export default function dbBuilder(config) {

    const pool = new Pool(config.pool);
    pool.on('connect', client => {
        client.on('notice', msg => console.warn('\nnotice:', msg.message))
    })
    pool.on('error', (err) => {
        console.error('\npool error:', err)
    })

    /**
     * @param  { [ string, any[]? ] } args
     * check {@link https://node-postgres.com/api/client/#clientquery} for more options
     */
    async function query(...args) {
        { // Try to query with pool if possible
            const isPoolMaxed = (pool.totalCount === config.pool.max);
            const isAnyClientIdle = (pool.idleCount > 0);
            if (!isPoolMaxed || isAnyClientIdle) {
                return await pool.query(...args);
            }
        }
        // Otherwise create a disposable client
        const client = new Client(config.client);
        client.on('notice', msg => console.warn('\nnotice:', msg.message))
        client.on('error', (err) => {
            console.error('\nclient error:', err)
        })
        await client.connect();
        const result = await client.query(...args);
        client.end();
        return result;
    }

    /**
     * Query the db using [tagged template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates).
     * 
     * For example:
     * 
     * Instead of using pg's `query()` like this
     * ```js
     *  query(`INSERT INTO table (name, description) VALUES ($1, $2)`, [name, description])
     * ```
     * 
     * Call `sql()` like this:
     * ```js
     *  sql`INSERT INTO table (name, description) VALUES (${name}, ${description})`
     * ```
     * This *Tagged template* is equivalent to calling the function like this:
     * ```js
     *  sql(
     *      [
     *          'INSERT INTO table (name, description) VALUES (',
     *          ', ',
     *          ')'
     *      ], // This is what would go into `querySegments`
     *      // Following parameters are aggregated as an array into `params`
     *      name,
     *      description
     *  )
     * ```
     * 
     * This allows to have sql syntax highlighting
     * when paired with the extension "sql tagged template literals"
     * 
     * @param {TemplateStringsArray} querySegments
     * @param {any[]} params
     */
    async function sql(querySegments, ...params) {
        let queryString = querySegments[0];

        for (let i = 1; i <= params.length; i++) {

            /**
             * `i` has double purpose / semantic
             * 
             * 1. An index that starts from 1, as required by pg's `query` function to refer to params, e.g `$1` `$2`
             * 2. Index for the next `querySegment` that will be concatenated
             */
            queryString += `$${i}`;
            queryString += querySegments[i];
        }

        try {
            return await query(queryString, params);
        } catch (error) {
            console.log(queryString, params, error?.message);
            throw error;
        }
    }

    return {
        query,
        sql
    }
    
}
