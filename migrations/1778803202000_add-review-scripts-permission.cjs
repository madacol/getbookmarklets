exports.up = ({sql}) => {
    sql`
        WITH inserted_permission AS (
            INSERT INTO permissions (name)
            VALUES ('review_scripts')
            ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
            RETURNING permission_id
        )
        INSERT INTO join_roles_permissions (role_id, permission_id)
        SELECT roles.role_id, inserted_permission.permission_id
        FROM roles
        CROSS JOIN inserted_permission
        WHERE roles.name = 'master'
        ON CONFLICT DO NOTHING;
    `;
};

exports.down = ({sql}) => {
    sql`
        DELETE FROM join_roles_permissions
        USING permissions
        WHERE join_roles_permissions.permission_id = permissions.permission_id
            AND permissions.name = 'review_scripts';

        DELETE FROM permissions
        WHERE name = 'review_scripts';
    `;
};
