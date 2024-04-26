
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
 * It saves the timeout ID in the context of the returned function as `this.timeoutId`.
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
