exports.up = pgm => {
    // If fails, replace all "anyarray" with "anycompatiblearray" or check what type is expected from array_cat
    pgm.sql`
        CREATE FUNCTION array_sort_unique (anyarray) RETURNS anyarray
        LANGUAGE SQL
        AS $body$
          SELECT ARRAY(
            SELECT DISTINCT $1[s.i]
            FROM generate_series(array_lower($1,1), array_upper($1,1)) AS s(i)
            ORDER BY 1
          );
        $body$;

        CREATE AGGREGATE array_merge_agg (anyarray)
        (
            sfunc = array_cat,
            FINALFUNC = array_sort_unique,
            stype = anyarray,
            initcond = '{}'
        );
    `
};

exports.down = pgm => {
    pgm.sql`
        DROP AGGREGATE array_merge_agg (anyarray);
        DROP FUNCTION array_sort_unique (anyarray);
    `
};
