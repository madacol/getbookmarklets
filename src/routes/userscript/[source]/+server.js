/** @type {import('./$types').RequestHandler} */

export async function GET({ params }) {
    // Decode the userscript source from the URL
    const userscriptSource = (params.source);

    // Set the Content-Type header to indicate a JavaScript file
    const headers = {
        'Content-Type': 'application/javascript',
    };

    // Return the userscript source in the response body with the appropriate header
    return new Response(userscriptSource, { headers });
}
