import { env } from "$env/dynamic/private";

const NON_EXPIRING_COOKIE_EXPIRES_AT = new Date('9999-12-31T23:59:59.999Z');
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
  expires: NON_EXPIRING_COOKIE_EXPIRES_AT,
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
