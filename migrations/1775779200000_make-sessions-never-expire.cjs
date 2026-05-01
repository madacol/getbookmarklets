exports.up = (pgm) => {
    pgm.sql`
        UPDATE sessions
        SET expires_at = TIMESTAMP 'infinity'
        WHERE expires_at IS DISTINCT FROM TIMESTAMP 'infinity'
        ;
    `;
};

exports.down = (pgm) => {
    pgm.sql`
        UPDATE sessions
        SET expires_at = NOW() + INTERVAL '30 days'
        WHERE expires_at = TIMESTAMP 'infinity'
        ;
    `;
};
