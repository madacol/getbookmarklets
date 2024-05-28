export function load({ setHeaders }) {
    setHeaders({'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=60'});
}
