let migration_name, upSqlQuery, downSqlQuery;
{
    const permissions_raw = process.argv.slice(2);
    if (permissions_raw.length === 0){
        console.error('Error: expected as argument the name of the permission');
        process.exit();
    }
    migration_name = "data_permissions_" + permissions_raw.join('_');
    const permissions_normalized = permissions_raw.map(permission=>`'${permission.toLowerCase()}'`);
    const sqlFormatValues = permissions_normalized.map(permission=>`(${permission})`).join(',');
    upSqlQuery = `
    WITH new_permissions as(
        INSERT INTO permissions (name) VALUES ${sqlFormatValues}
        RETURNING permission_id
    )
    INSERT INTO join_roles_permissions (role_id, permission_id)
        SELECT role_id, permission_id
        FROM roles, new_permissions
        WHERE roles.name = 'master'
    ;`;
    downSqlQuery = `DELETE FROM permissions WHERE name IN (${permissions_normalized.join(',')})`;
}

const filepath = `./migrations/${Date.now()}_${migration_name}.cjs`
const file_content =
`exports.up = pgm => pgm.sql\`${upSqlQuery}\`;
exports.down = pgm => pgm.sql\`${downSqlQuery}\`;`

import fs from 'fs';
fs.writeFile(filepath, file_content, (err) => {
    process.exit();
});