
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
 */
export function urlToName(url) {
    const pathList = decodeURIComponent(url).split('/');
    const original_filename = pathList?.pop()?.split('.').shift() || '';

    const filename = (original_filename === "index")
                        ? pathList.pop() || ''
                        : original_filename;

    return filename
        ? toTitleCase(filename)
        : '';
}

/**
 * @param {string} source
 * @returns {{name: string, description: string}}
 */
export function getScriptMetadata(source) {
    const nameMatch = source.match(/\/\/\s*@name\s*(.*)/);
    const name = nameMatch
        ? nameMatch[1].trim()
        : '';

    const descriptionMatch = source.match(/\/\/\s*@description\s*(.*)/);
    const description = descriptionMatch
        ? descriptionMatch[1].trim()
        : '';

    return {name, description};
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
        function(...args) {
            clearTimeout(timeoutId.value);
            timeoutId.value = setTimeout(() => fn(...args), delay);
        },
        timeoutId
    ]
}
