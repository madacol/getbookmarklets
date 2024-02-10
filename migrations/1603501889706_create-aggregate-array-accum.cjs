exports.up = pgm => {
    pgm.sql`
        CREATE FUNCTION array_sort_unique (anycompatiblearray) RETURNS anycompatiblearray
        LANGUAGE SQL
        AS $body$
          SELECT ARRAY(
            SELECT DISTINCT $1[s.i]
            FROM generate_series(array_lower($1,1), array_upper($1,1)) AS s(i)
            ORDER BY 1
          );
        $body$;

        CREATE AGGREGATE array_merge_agg (anycompatiblearray)
        (
            sfunc = array_cat,
            FINALFUNC = array_sort_unique,
            stype = anycompatiblearray,
            initcond = '{}'
        );
    `
};

exports.down = pgm => {
    pgm.sql`
        DROP AGGREGATE array_merge_agg (anycompatiblearray);
        DROP FUNCTION array_sort_unique (anycompatiblearray);
    `
};
