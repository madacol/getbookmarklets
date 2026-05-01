import jsBeautify from 'js-beautify';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
hljs.registerLanguage('javascript', javascript);

/** @param {string} s */
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Extract the JS code string from a decoded path, if present.
 * Handles both `javascript:<code>` and `data:text/javascript,<code>` schemes.
 * @param {string} decoded
 * @returns {{ prefix: string, code: string } | null}
 */
export function extractJs(decoded) {
  // javascript:<code>
  const jsIdx = decoded.indexOf('javascript:');
  if (jsIdx !== -1) {
    return {
      prefix: decoded.slice(0, jsIdx + 'javascript:'.length),
      code: decoded.slice(jsIdx + 'javascript:'.length),
    };
  }
  // data:text/javascript,<code>
  const dataIdx = decoded.indexOf('data:text/javascript,');
  if (dataIdx !== -1) {
    return {
      prefix: decoded.slice(0, dataIdx + 'data:text/javascript,'.length),
      code: decoded.slice(dataIdx + 'data:text/javascript,'.length),
    };
  }
  return null;
}

/**
 * Repeatedly decode until stable — handles single and double encoding.
 * @param {string} s
 * @returns {string}
 */
function fullyDecode(s) {
  let prev;
  do {
    prev = s;
    try { s = decodeURIComponent(s); } catch { break; }
  } while (s !== prev);
  return s;
}

/**
 * URL-decode a log path, extract + beautify + syntax-highlight any JS.
 * Returns an HTML string safe for Svelte's {@html ...}.
 * @param {string} path
 * @returns {string}
 */
export function renderPath(path) {
  if (!path) return '';

  const decoded = fullyDecode(path);

  const extracted = extractJs(decoded);
  if (extracted) {
    let { prefix, code } = extracted;
    try { code = jsBeautify.js(code, { indent_size: 2, wrap_line_length: 0, end_with_newline: true }); } catch { /* keep as-is */ }
    const highlighted = hljs.highlight(code, { language: 'javascript' }).value;
    return `<span class="path-prefix">${escapeHtml(prefix)}</span>${highlighted}`;
  }

  return escapeHtml(decoded);
}
