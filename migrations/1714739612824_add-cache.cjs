exports.up = ({sql}) => {
    sql`
        CREATE TABLE cache (
            name varchar(255) NOT NULL,
            key varchar(255) NOT NULL,
            value JSONB NOT NULL,
            PRIMARY KEY (name, key)
        );
    `;
};

exports.down = ({sql}) => {
    sql`
        DROP TABLE cache;
    `;
};