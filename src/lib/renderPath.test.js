import { describe, it, expect } from 'vitest';
import { extractJs, renderPath } from './renderPath.js';

// ---------------------------------------------------------------------------
// Real data:text/javascript source_urls from getbookmarklets.com
// Signal flow: navigator.sendBeacon(`/signal/<event>/${encodeURIComponent(source_url)}`)
// Node.js stores event.url.pathname which preserves percent-encoding.
// ---------------------------------------------------------------------------

// 1. Real production path from logs (rightclick signal).
//    Browser partially decoded %3A→: and %2C→, before sending,
//    so the data: prefix is literal but the JS content stays percent-encoded.
const PROD_RIGHTCLICK_PATH =
  '/signal/rightclick/data:text/javascript,' +
  'const%20results%20%3D%20%5B%5D%3B%0A' +
  'const%20wait%20%3D%20(ms)%20%3D%3E%20new%20Promise(res%20%3D%3E%20setTimeout(res%2C%20ms))%3B%0A' +
  "const%20progress%20%3D%20document.createElement('div')%3B";

// 2. "Unfuck Youtube" — real script from getbookmarklets.com (fully encoded path)
const UNFUCK_YOUTUBE_SOURCE = `data:text/javascript,// @name Unfuck Youtube
// @description fixes error 153 for embeded videos
Array.from(document.getElementsByTagName("iframe")).forEach((element) => {
    if (element.src.includes("youtube.com")) {
        original = element.src.split("/");
        target = [];
        original.forEach((token) => {
            target.push(token.includes("youtube.com") ? "www.youtube-nocookie.com" : token);
        });
        element.referrerPolicy = "strict-origin-when-cross-origin";
        element.src = target.join("/");
    }
});`;
const UNFUCK_YOUTUBE_PATH = `/signal/drag/${encodeURIComponent(UNFUCK_YOUTUBE_SOURCE)}`;

// 3. "Localstorage Editor" — real script from getbookmarklets.com
const LOCALSTORAGE_SOURCE = `data:text/javascript,// @name Localstorage Editor
// @description Import, Export or Edit values in LocalStorage
const saved_keys = Object.keys(localStorage);
const key = prompt('Enter localStorage key:\\n\\nAvailable keys:\\n' + saved_keys.join('\\n'), '');
if(key) {
    const value = localStorage.getItem(key);
    const newValue = prompt('Current value (copy it or paste a new one):', value);
    if(newValue && newValue !== value) {
        localStorage.setItem(key, newValue);
        alert('Saved!');
    }
}`;
const LOCALSTORAGE_PATH = `/signal/rightclick/${encodeURIComponent(LOCALSTORAGE_SOURCE)}`;

// 4. "Fullscreen" — minimal script
const FULLSCREEN_SOURCE = `data:text/javascript,// @name Fullscreen
// @description Makes the screen fullscreen
document.body.requestFullscreen()`;
const FULLSCREEN_PATH = `/signal/drag/${encodeURIComponent(FULLSCREEN_SOURCE)}`;

// ---------------------------------------------------------------------------
// extractJs
// ---------------------------------------------------------------------------
describe('extractJs', () => {
  it('extracts JS from real production path (partially decoded prefix)', () => {
    const decoded = decodeURIComponent(PROD_RIGHTCLICK_PATH);
    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('/signal/rightclick/data:text/javascript,');
    expect(result?.code).toContain('const results');
    expect(result?.code).toContain('const wait');
    expect(result?.code).toContain("document.createElement('div')");
    expect(result?.code).not.toMatch(/%[0-9A-Fa-f]{2}/);
  });

  it('extracts JS from Unfuck Youtube path (fully encoded)', () => {
    const decoded = decodeURIComponent(UNFUCK_YOUTUBE_PATH);
    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('/signal/drag/data:text/javascript,');
    expect(result?.code).toContain('getElementsByTagName');
    expect(result?.code).toContain('youtube-nocookie.com');
    expect(result?.code).not.toMatch(/%[0-9A-Fa-f]{2}/);
  });

  it('extracts JS from Localstorage Editor path', () => {
    const decoded = decodeURIComponent(LOCALSTORAGE_PATH);
    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.code).toContain('localStorage');
    expect(result?.code).toContain('prompt');
    expect(result?.code).not.toMatch(/%[0-9A-Fa-f]{2}/);
  });

  it('extracts JS from Fullscreen (minimal) path', () => {
    const decoded = decodeURIComponent(FULLSCREEN_PATH);
    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.code).toContain('requestFullscreen');
    expect(result?.code).not.toMatch(/%[0-9A-Fa-f]{2}/);
  });

  it('returns null for plain app routes', () => {
    expect(extractJs('/scripts/add')).toBeNull();
    expect(extractJs('/logs')).toBeNull();
    expect(extractJs('/')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// renderPath
// ---------------------------------------------------------------------------
describe('renderPath', () => {
  it('produces highlighted HTML for real prod path — no percent sequences', () => {
    const html = renderPath(PROD_RIGHTCLICK_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('data:text/javascript,');
    expect(html).toContain('hljs-');
    expect(html).toContain('results');
    expect(html).toContain('progress');
  });

  it('highlights Unfuck Youtube correctly', () => {
    const html = renderPath(UNFUCK_YOUTUBE_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('hljs-');
    expect(html).toContain('youtube-nocookie');
  });

  it('highlights Localstorage Editor correctly', () => {
    const html = renderPath(LOCALSTORAGE_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('hljs-');
    expect(html).toContain('localStorage');
  });

  it('escapes HTML special chars in plain paths', () => {
    const html = renderPath('/path/<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('returns empty string for empty input', () => {
    expect(renderPath('')).toBe('');
  });
});
