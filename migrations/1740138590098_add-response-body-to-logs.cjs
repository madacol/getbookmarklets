exports.up = pgm => {
    pgm.sql`
        ALTER TABLE logs
        ADD COLUMN response_body TEXT;
    `
};

exports.down = pgm => {
    pgm.sql`
        ALTER TABLE logs
        DROP COLUMN response_body;
    `;
}