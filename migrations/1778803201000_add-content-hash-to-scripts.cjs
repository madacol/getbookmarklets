exports.up = ({sql}) => {
    sql`
        ALTER TABLE scripts
        ADD COLUMN content_hash TEXT;

        ALTER TABLE scripts
        ADD CONSTRAINT scripts_content_hash_check
        CHECK (content_hash IS NULL OR content_hash ~ '^[0-9a-f]{64}$');
    `;
};

exports.down = ({sql}) => {
    sql`
        ALTER TABLE scripts
        DROP CONSTRAINT scripts_content_hash_check;

        ALTER TABLE scripts
        DROP COLUMN content_hash;
    `;
};
