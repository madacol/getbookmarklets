export function load({ setHeaders }) {
    setHeaders({'Cache-Control': 'public, immutable, max-age=31536000'});
}

export const prerender = true;
