exports.up = pgm => {
    pgm.sql`
        CREATE TABLE join_users_roles (
            user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
            role_id UUID NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT join_users_roles_pk PRIMARY KEY (user_id, role_id)
        );
    `
};

exports.down = pgm => {
    pgm.sql`DROP TABLE join_users_roles`;
}