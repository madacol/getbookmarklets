
exports.up = pgm => {
    pgm.sql`
        CREATE TABLE scripts (
            script_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            source_url TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `
};

exports.down = pgm => {
    pgm.sql`DROP TABLE scripts`;
}