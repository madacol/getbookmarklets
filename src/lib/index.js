
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