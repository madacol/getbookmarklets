exports.up = ({sql}) => {
    sql`
        ALTER TABLE scripts
        ALTER COLUMN user_id DROP NOT NULL;
    `;
};

exports.down = ({sql}) => {
    sql`
        ALTER TABLE scripts
        ALTER COLUMN user_id SET NOT NULL;
    `;
};