
/**
 * Upper case the first letter of each word in a string.
 * @param {string} str 
 * @returns string
 */
function toTitleCase(str) {
    // Split the string into words using a regular expression that finds spaces, underscores, and hyphens
    return str
        .split(/[-_\s]+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Takes a URL and returns the last part of the path in title case.
 * 
 * @param {string} url
 * @returns {string}
 */
export function urlToName(url) {
    const [filename, foldername] = decodeURIComponent(url).split('/').reverse();

    const filename_no_extensions = filename.split('.')[0];

    const name = (filename_no_extensions === "index") ? foldername : filename_no_extensions;

    return toTitleCase(name);
}

/**
 * Get the userscript-style metadata from a script source.
 * 
 * @param {string} source
 * @param {string} url
 * @returns {{name: string, description: string, medias: {key: string, value: string}[]}}
 */
export function getScriptMetadata(source, url) {
    // Get everything before the first non-comment line
    const metadata = source.trim().split(/\n(?!\/\/)/)[0];

    /**
     * @param {string} key
     * @returns {{key: string, value: string}[]}
     */
    const getAllKeyValues = (key) => {
        // match userscript keys like `// @name[:en] My Script`
        const matches = metadata.matchAll(new RegExp(`\/\/\\ *@(${key})(?::[a-zA-Z]{2}(?:-[a-zA-Z]{2})?)?\ +([^\n]+)`, 'g'));
        return Array.from(matches).map( match => ({
            key: match[1],
            value: match[2].trim(),
        }));
    }

    return {
        name: getAllKeyValues('name')[0]?.value || urlToName(url),
        description: getAllKeyValues('description')[0]?.value || '',
        medias: getAllKeyValues('video|image'),
    };
}

/**
 * Debounce a function. Returns a new function that will only call the original function after a delay.
 * It returns the debounced function and the timeout ID.
 * 
 * @param {Function} fn - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {[Function, {value: number | undefined}]} - The debounced function and the timeout ID.
 */
export function debounce(fn, delay = 1000) {
    /**
     * @type {{value: number | undefined}}
     */
    const timeoutId = { value: undefined };
    return [
        function(/** @type {any} */ ...args) {
            clearTimeout(timeoutId.value);
            timeoutId.value = window.setTimeout(() => fn(...args), delay);
        },
        timeoutId
    ]
}

/**
 * @param {FormDataEntryValue | null} url
 * @param {Function} fetch
 * @param {boolean} isServer - when true, it will validate the URL and that it accepts cross-origin requests
 */
export async function isURLInvalid(url, fetch, isServer = true) {

    if (!url) return "You must provide a URL";

    if (typeof url !== "string") {
        return "URL must be a string";
    }

    if (url.length > 10000) {
        return "URL is too large";
    }

    // Validate URL is http or dataURL
    if (url.startsWith("data:")) {
        // Validate if it is javascript and parses correctly
        try {
            const response = await fetch(url);
            const text = await response.text();
            new Function(text);
        } catch (e) {
            return "DataURL is not valid JavaScript";
        }

    } else if (url.match(/^https?:\/\//)) {

        if (isServer) {
            // Validate if server response is valid
            try {
                const response = await fetch(url, {method: "HEAD", redirect: "manual"});
                if (!response.ok) {
                    return "URL's server did not respond with 200 OK";
                }

                // Validate allow origin header
                const allowOrigin = response.headers.get("access-control-allow-origin");
                if (allowOrigin !== "*") {
                    return "URL's server does not allow cross-origin requests";
                }
            } catch (e) {
                return "failed to fetch URL";
            }
        }

        // validate if it parses correctly
        try {
            const response = await fetch(url, {redirect: "manual"});
            if (!response.ok) {
                return "URL's server did not respond with 200 OK";
            }
            if (!response.body) {
                return "Script'Url's response body is empty";
            }
            const text = await response.text();
            new Function(text);
        } catch (e) {
            return "URL is not valid JavaScript";
        }
    } else {
        return "URL must be HTTP or DataURL";
    }

    return false;
}
