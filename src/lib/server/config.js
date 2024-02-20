import { DATABASE_URL, NODE_ENV, DOMAIN } from "$env/static/private";

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
  maxAge: 2592000, // 30 days
  httpOnly: true,
  sameSite: true,
  secure: NODE_ENV === 'production',
  domain: DOMAIN,
  path: '/',
}

// Password hashing algorithm config
export const argon_options = {
  timeCost: 10
}
