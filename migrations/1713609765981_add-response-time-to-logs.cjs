
exports.up = pgm => {
    pgm.sql`
        ALTER TABLE logs
        ADD COLUMN response_time INTEGER;
    `
};

exports.down = pgm => {
    pgm.sql`
        ALTER TABLE logs
        DROP COLUMN response_time;
    `;
}