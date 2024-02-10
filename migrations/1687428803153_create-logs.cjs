exports.up = pgm => {
    pgm.sql`
        CREATE TABLE logs (
            log_id SERIAL PRIMARY KEY,
            method VARCHAR(16),
            path VARCHAR(1024),
            body TEXT,
            user_session JSONB,
            params JSONB,
            headers JSONB,
            response_status INTEGER,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `
};

exports.down = pgm => {
    pgm.sql`DROP TABLE logs`;
}