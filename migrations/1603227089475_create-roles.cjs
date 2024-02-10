exports.up = pgm => {
    pgm.sql`
        CREATE TABLE roles (
            role_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL UNIQUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `
};

exports.down = pgm => {
    pgm.sql`DROP TABLE roles`;
}