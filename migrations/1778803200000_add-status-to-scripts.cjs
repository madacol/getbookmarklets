exports.up = ({sql}) => {
    sql`
        ALTER TABLE scripts
        ADD COLUMN status TEXT NOT NULL DEFAULT 'accepted';

        ALTER TABLE scripts
        ADD CONSTRAINT scripts_status_check
        CHECK (status IN ('needs_review', 'accepted', 'rejected'));

        ALTER TABLE scripts
        ALTER COLUMN status SET DEFAULT 'needs_review';
    `;
};

exports.down = ({sql}) => {
    sql`
        ALTER TABLE scripts
        DROP CONSTRAINT scripts_status_check;

        ALTER TABLE scripts
        DROP COLUMN status;
    `;
};
