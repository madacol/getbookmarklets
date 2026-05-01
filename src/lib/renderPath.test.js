import { describe, it, expect } from 'vitest';
import { extractJs, renderPath } from './renderPath.js';

// ---------------------------------------------------------------------------
// Real source_url values as stored in the production DB (getbookmarklets.com).
// Fetched from https://getbookmarklets.com/__data.json
// They are already percent-encoded (e.g. %2F%2F for //, %20 for space).
// When used in signal paths via encodeURIComponent(source_url), they become
// double-encoded, requiring two rounds of decoding.
// ---------------------------------------------------------------------------

const UNFUCK_YOUTUBE_SOURCE_URL =
  'data:text/javascript,%2F%2F%20%40name%20Unfuck%20Youtube%0A%2F%2F%20%40description%20fixes%20error%20153%20for%20embeded%20videos%0A%0AArray.from(document.getElementsByTagName(%22iframe%22)).forEach((element)%20%3D%3E%20%7B%0A%20%20if%20(element.src.includes(%22youtube.com%22))%20%7B%0A%20%20%20%20console.log(element)%3B%0A%20%20%20%20original%20%3D%20element.src.split(%22%2F%22)%3B%0A%20%20%20%20target%20%3D%20%5B%5D%3B%0A%20%20%20%20original.forEach((token)%20%3D%3E%20%7B%0A%20%20%20%20%20%20target.push(%0A%20%20%20%20%20%20%20%20token.includes(%22youtube.com%22)%20%3F%20%22www.youtube-nocookie.com%22%20%3A%20token%2C%0A%20%20%20%20%20%20)%3B%0A%20%20%20%20%7D)%3B%0A%20%20%20%20element.referrerPolicy%20%3D%20%22strict-origin-when-cross-origin%22%3B%0A%20%20%20%20element.src%20%3D%20target.join(%22%2F%22)%3B%0A%20%20%20%20console.log(element)%3B%0A%20%20%7D%0A%7D)%3B%0A';

const LOCALSTORAGE_SOURCE_URL =
  'data:text/javascript,%2F%2F%20%40name%20Localstorage%20Editor%0A%2F%2F%20%40description%20Import%2C%20Export%20or%20Edit%20values%20in%20LocalStorage%0A%0Aconst%20saved_keys%20%3D%20Object.keys(localStorage)%3B%0Aconst%20key%20%3D%20prompt(\'Enter%20localStorage%20key%3A%5Cn%5CnAvailable%20keys%3A%5Cn\'%20%2B%20saved_keys.join(\'%5Cn\')%2C%20\'\')%3B%0Aif(key)%20%7B%0A%20%20%20%20const%20value%20%3D%20localStorage.getItem(key)%3B%0A%20%20%20%20const%20newValue%20%3D%20prompt(\'Current%20value%20(copy%20it%20or%20paste%20a%20new%20one)%3A\'%2C%20value)%3B%0A%20%20%20%20if(newValue%20%26%26%20newValue%20!%3D%3D%20value)%20%7B%0A%20%20%20%20%20%20%20%20localStorage.setItem(key%2C%20newValue)%3B%0A%20%20%20%20%20%20%20%20alert(\'Saved!\')%3B%0A%20%20%20%20%7D%0A%7D%0A';

const FULLSCREEN_SOURCE_URL =
  'data:text/javascript,%2F%2F%20%40name%20Fullscreen%0A%2F%2F%20%40description%20Makes%20the%20screen%20fullscreen%0A%0Adocument.body.requestFullscreen()';

// Simulate the path as stored in DB:
// navigator.sendBeacon(`/signal/<event>/${encodeURIComponent(source_url)}`)
// => double-encoded because source_url is already percent-encoded
const UNFUCK_YOUTUBE_PATH = `/signal/drag/${encodeURIComponent(UNFUCK_YOUTUBE_SOURCE_URL)}`;
const LOCALSTORAGE_PATH   = `/signal/rightclick/${encodeURIComponent(LOCALSTORAGE_SOURCE_URL)}`;
const FULLSCREEN_PATH     = `/signal/drag/${encodeURIComponent(FULLSCREEN_SOURCE_URL)}`;

// Real path captured from production logs (partially decoded by browser before sending)
const PROD_LOG_PATH =
  '/signal/rightclick/data:text/javascript,' +
  'const%20results%20%3D%20%5B%5D%3B%0A' +
  'const%20wait%20%3D%20(ms)%20%3D%3E%20new%20Promise(res%20%3D%3E%20setTimeout(res%2C%20ms))%3B%0A' +
  "const%20progress%20%3D%20document.createElement('div')%3B";

// ---------------------------------------------------------------------------
// extractJs
// ---------------------------------------------------------------------------
describe('extractJs', () => {
  it('finds data:text/javascript, prefix after full decode', () => {
    // After fullyDecode (two rounds), the prefix should be literal
    let decoded = UNFUCK_YOUTUBE_PATH;
    let prev;
    do { prev = decoded; try { decoded = decodeURIComponent(decoded); } catch { break; } } while (decoded !== prev);

    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('/signal/drag/data:text/javascript,');
    expect(result?.code).toContain('Unfuck Youtube');
    expect(result?.code).toContain('youtube-nocookie.com');
    expect(result?.code).not.toMatch(/%[0-9A-Fa-f]{2}/);
  });

  it('returns null for plain app routes', () => {
    expect(extractJs('/scripts/add')).toBeNull();
    expect(extractJs('/logs')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// renderPath — uses fullyDecode internally, tested end-to-end
// ---------------------------------------------------------------------------
describe('renderPath', () => {
  it('Unfuck Youtube: no percent sequences, JS highlighted', () => {
    const html = renderPath(UNFUCK_YOUTUBE_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('data:text/javascript,');
    expect(html).toContain('hljs-');
    expect(html).toContain('youtube-nocookie');
    expect(html).toContain('getElementsByTagName');
  });

  it('Localstorage Editor: no percent sequences, JS highlighted', () => {
    const html = renderPath(LOCALSTORAGE_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('hljs-');
    expect(html).toContain('localStorage');
    expect(html).toContain('prompt');
  });

  it('Fullscreen: no percent sequences, JS highlighted', () => {
    const html = renderPath(FULLSCREEN_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('hljs-');
    expect(html).toContain('requestFullscreen');
  });

  it('Real prod log path (partially decoded): no percent sequences, JS highlighted', () => {
    const html = renderPath(PROD_LOG_PATH);
    expect(html).not.toMatch(/%[0-9A-Fa-f]{2}/);
    expect(html).toContain('data:text/javascript,');
    expect(html).toContain('hljs-');
    expect(html).toContain('results');
    expect(html).toContain('progress');
  });

  it('escapes HTML in plain paths', () => {
    const html = renderPath('/path/<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('returns empty string for empty input', () => {
    expect(renderPath('')).toBe('');
  });
});
