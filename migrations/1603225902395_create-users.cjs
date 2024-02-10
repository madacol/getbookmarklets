exports.up = pgm => {
    pgm.sql`
        CREATE TABLE users (
            user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            username VARCHAR(30) NOT NULL UNIQUE,
            password_hash VARCHAR(200) NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL UNIQUE,
            lastname VARCHAR(100) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE INDEX idx_users_username ON users (username);
    `
};

exports.down = pgm => {
    pgm.sql`DROP TABLE users`;
}