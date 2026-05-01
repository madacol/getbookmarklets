import { describe, it, expect } from 'vitest';
import { extractJs, renderPath } from './renderPath.js';

const REAL_PATH = '/signal/rightclick/data:text/javascript,const%20results%20%3D%20%5B%5D%3B%0Aconst%20wait%20%3D%20(ms)%20%3D%3E%20new%20Promise(res%20%3D%3E%20setTimeout(res%2C%20ms))%3B%0A%0Aconst%20progress%20%3D%20document.createElement(\'div\')%3B';

describe('extractJs', () => {
  it('detects data:text/javascript, scheme', () => {
    const decoded = decodeURIComponent(REAL_PATH);
    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('/signal/rightclick/data:text/javascript,');
    expect(result?.code).toContain('const results');
  });

  it('detects javascript: scheme', () => {
    const decoded = '/signal/drag/javascript:void(function(){alert(1)})()';
    const result = extractJs(decoded);
    expect(result).not.toBeNull();
    expect(result?.prefix).toBe('/signal/drag/javascript:');
    expect(result?.code).toContain('void');
  });

  it('returns null for plain paths', () => {
    expect(extractJs('/scripts/add')).toBeNull();
    expect(extractJs('/logs')).toBeNull();
  });
});

describe('renderPath', () => {
  it('URL-decodes and extracts JS from a data:text/javascript, path', () => {
    const html = renderPath(REAL_PATH);
    // Should contain beautified JS tokens — not raw percent-encoded chars
    expect(html).not.toContain('%20');
    expect(html).not.toContain('%3D');
    // Should contain the prefix
    expect(html).toContain('data:text/javascript,');
    // Should contain highlighted code (hljs wraps tokens in <span class="hljs-...">)
    expect(html).toContain('hljs-');
    // Key identifiers from the real code should be present
    expect(html).toContain('results');
    expect(html).toContain('progress');
  });

  it('URL-decodes and highlights a javascript: path', () => {
    const html = renderPath('/signal/drag/javascript:void(function()%7Balert(1)%7D)()');
    expect(html).not.toContain('%7B');
    expect(html).toContain('javascript:');
    expect(html).toContain('hljs-');
  });

  it('escapes HTML in plain paths', () => {
    const html = renderPath('/path/<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('returns empty string for empty input', () => {
    expect(renderPath('')).toBe('');
  });
});
