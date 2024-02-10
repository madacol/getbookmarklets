exports.up = pgm => {
    pgm.sql`
        CREATE TABLE "sessions" (
            "session_id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            "user_id" UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            "expires_at" timestamp(6) NOT NULL
        );

        CREATE INDEX "IDX_session_expires_at" ON "sessions" ("expires_at");
    `
};

exports.down = pgm => {
    pgm.sql`DROP TABLE sessions`;
}
