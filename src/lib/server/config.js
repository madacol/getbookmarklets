import { env } from "$env/dynamic/private";

const PERSISTENT_COOKIE_MAX_AGE = 2147483647; // ~68 years, effectively non-expiring
const DATABASE_URL = env.DATABASE_URL ?? "";

export const database = {
  common: {
    connectionString: DATABASE_URL,
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

export const cookies_options = {
  maxAge: PERSISTENT_COOKIE_MAX_AGE,
  httpOnly: true,
  sameSite: true,
  secure: env.NODE_ENV === 'production',
  domain: env.DOMAIN,
  path: '/',
}

// Password hashing algorithm config
export const argon_options = {
  timeCost: 10
}
