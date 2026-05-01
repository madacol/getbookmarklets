<script>
  /**
   * @typedef {{
   *   path: string,
   *   username: string | null,
   *   created_at: string,
   *   method: string,
   *   status: number,
   *   referer: string | null,
   *   city: string | null,
   *   timezone: string | null,
   *   country: string | null,
   *   ip: string | null,
   *   user_agent: string | null,
   *   headers: Record<string, string> | null,
   *   user_session: Record<string, unknown> | null,
   *   params: Record<string, string> | null,
   *   response_time: number | null,
   *   body: string | null,
   *   response_body: string | null,
   * }} LogEntry
   */

  const { data } = $props();
  /** @type {LogEntry[]} */
  const logs = data.logs;

  // --- Filters ---
  let searchPath = $state('');
  let searchUsername = $state('');
  let filterMethod = $state('');
  let filterStatus = $state('');

  /** @type {number | null} */
  let expandedRow = $state(null);

  const filteredLogs = $derived(
    logs.filter((/** @type {LogEntry} */ log) => {
      if (searchPath && !log.path?.toLowerCase().includes(searchPath.toLowerCase())) return false;
      if (searchUsername && !log.username?.toLowerCase().includes(searchUsername.toLowerCase())) return false;
      if (filterMethod && log.method !== filterMethod) return false;
      if (filterStatus) {
        const s = String(log.status);
        if (!s.startsWith(filterStatus)) return false;
      }
      return true;
    })
  );

  // --- Stats ---
  const stats = $derived(() => {
    const total = filteredLogs.length;
    const errors = filteredLogs.filter((/** @type {LogEntry} */ l) => l.status >= 400).length;
    const serverErrors = filteredLogs.filter((/** @type {LogEntry} */ l) => l.status >= 500).length;
    const times = /** @type {number[]} */ (filteredLogs.map((/** @type {LogEntry} */ l) => l.response_time).filter((/** @type {number | null} */ t) => t != null));
    const avgTime = times.length ? Math.round(times.reduce((/** @type {number} */ a, /** @type {number} */ b) => a + b, 0) / times.length) : 0;
    const maxTime = times.length ? Math.max(...times) : 0;
    const uniqueIPs = new Set(filteredLogs.map((/** @type {LogEntry} */ l) => l.ip).filter(Boolean)).size;
    const uniqueUsers = new Set(filteredLogs.map((/** @type {LogEntry} */ l) => l.username).filter(Boolean)).size;
    return { total, errors, serverErrors, avgTime, maxTime, uniqueIPs, uniqueUsers };
  });

  // --- Unique values for filter dropdowns ---
  const methods = $derived([...new Set(logs.map((/** @type {LogEntry} */ l) => l.method).filter(Boolean))].sort());

  // --- Helpers ---
  /** @param {string} dateStr */
  function timeAgo(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  }

  /** @param {string} dateStr */
  function fullDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString();
  }

  /** @param {number} status */
  function statusClass(status) {
    if (status >= 500) return 'status-5xx';
    if (status >= 400) return 'status-4xx';
    if (status >= 300) return 'status-3xx';
    if (status >= 200) return 'status-2xx';
    return '';
  }

  /** @param {string} method */
  function methodClass(method) {
    return `method-${(method || '').toLowerCase()}`;
  }

  /** @param {number | null} ms */
  function responseTimeClass(ms) {
    if (ms == null) return '';
    if (ms < 100) return 'rt-fast';
    if (ms < 500) return 'rt-mid';
    return 'rt-slow';
  }

  import jsBeautify from 'js-beautify';

  /** @param {unknown} obj */
  function formatJson(obj) {
    if (obj == null) return null;
    try {
      return typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2);
    } catch { return String(obj); }
  }

  /** @param {string} rawUrl */
  function formatSourceUrl(rawUrl) {
    if (!rawUrl) return '';
    let decoded = rawUrl;
    try { decoded = decodeURIComponent(rawUrl); } catch { /* keep raw */ }
    try { return jsBeautify.js(decoded, { indent_size: 2, wrap_line_length: 120, end_with_newline: true }); } catch { /* keep decoded */ }
    return decoded;
  }

  /** @param {Record<string, string> | null} params */
  function paramsWithoutSourceUrl(params) {
    if (!params) return null;
    const rest = Object.fromEntries(Object.entries(params).filter(([k]) => k !== 'source_url'));
    return Object.keys(rest).length ? rest : null;
  }

  /** @param {number} index */
  function toggleRow(index) {
    expandedRow = expandedRow === index ? null : index;
  }

  /** @param {LogEntry} log */
  function hasDetail(log) {
    return log.headers || log.user_session || log.params || log.body || log.response_body;
  }

  /** @param {LogEntry} log */
  function locationStr(log) {
    const parts = [log.city, log.country].filter(Boolean);
    return parts.join(', ');
  }
</script>

<main>
  <!-- Stats Bar -->
  <div class="stats-bar">
    <div class="stat-card">
      <span class="stat-value">{stats().total}</span>
      <span class="stat-label">Requests</span>
    </div>
    <div class="stat-card">
      <span class="stat-value stat-warn">{stats().errors}</span>
      <span class="stat-label">4xx/5xx Errors</span>
    </div>
    <div class="stat-card">
      <span class="stat-value stat-danger">{stats().serverErrors}</span>
      <span class="stat-label">5xx Errors</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats().avgTime}<small>ms</small></span>
      <span class="stat-label">Avg Response</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats().maxTime}<small>ms</small></span>
      <span class="stat-label">Max Response</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats().uniqueUsers}</span>
      <span class="stat-label">Users</span>
    </div>
    <div class="stat-card">
      <span class="stat-value">{stats().uniqueIPs}</span>
      <span class="stat-label">Unique IPs</span>
    </div>
  </div>

  <!-- Filters -->
  <div class="filters box">
    <input
      type="search"
      placeholder="Filter by path..."
      bind:value={searchPath}
      class="filter-input"
    />
    <input
      type="search"
      placeholder="Filter by user..."
      bind:value={searchUsername}
      class="filter-input"
    />
    <select bind:value={filterMethod} class="filter-select">
      <option value="">All Methods</option>
      {#each methods as m}
        <option value={m}>{m}</option>
      {/each}
    </select>
    <select bind:value={filterStatus} class="filter-select">
      <option value="">All Statuses</option>
      <option value="2">2xx Success</option>
      <option value="3">3xx Redirect</option>
      <option value="4">4xx Client Error</option>
      <option value="5">5xx Server Error</option>
    </select>
    {#if searchPath || searchUsername || filterMethod || filterStatus}
      <button class="clear-btn" onclick={() => { searchPath = ''; searchUsername = ''; filterMethod = ''; filterStatus = ''; }}>
        Clear filters
      </button>
    {/if}
  </div>

  <!-- Log Table -->
  <div class="table-wrap box">
    <table>
      <thead>
        <tr>
          <th class="col-time">Time</th>
          <th class="col-method">Method</th>
          <th class="col-path">Path</th>
          <th class="col-status">Status</th>
          <th class="col-rt">Response</th>
          <th class="col-user">User</th>
          <th class="col-location">Location</th>
          <th class="col-expand"></th>
        </tr>
      </thead>
      <tbody>
        {#each filteredLogs as log, i}
          {@const expanded = expandedRow === i}
          <tr
            class="log-row"
            class:expanded
            class:clickable={hasDetail(log)}
            onclick={() => hasDetail(log) && toggleRow(i)}
          >
            <td class="col-time" title={fullDate(log.created_at)}>
              {timeAgo(log.created_at)}
            </td>
            <td class="col-method">
              <span class="method-badge {methodClass(log.method)}">{log.method}</span>
            </td>
            <td class="col-path" title={log.path}>{log.path}</td>
            <td class="col-status">
              <span class="status-badge {statusClass(log.status)}">{log.status}</span>
            </td>
            <td class="col-rt">
              {#if log.response_time != null}
                <span class="rt-badge {responseTimeClass(log.response_time)}">{log.response_time}ms</span>
              {:else}
                <span class="rt-badge rt-na">-</span>
              {/if}
            </td>
            <td class="col-user" title={log.username}>{log.username ?? ''}</td>
            <td class="col-location" title="{log.city ?? ''}, {log.country ?? ''} ({log.ip ?? ''})">
              {locationStr(log)}
            </td>
            <td class="col-expand">
              {#if hasDetail(log)}
                <span class="expand-icon" class:rotated={expanded}>&#9656;</span>
              {/if}
            </td>
          </tr>
          {#if expanded}
            {@const restParams = paramsWithoutSourceUrl(log.params)}
            <tr class="detail-row">
              <td colspan="8">
                <div class="detail-scroll">
                <div class="detail-grid">
                  {#if log.ip}
                    <div class="detail-item">
                      <span class="detail-label">IP</span>
                      <span class="detail-value">{log.ip}</span>
                    </div>
                  {/if}
                  {#if log.timezone}
                    <div class="detail-item">
                      <span class="detail-label">Timezone</span>
                      <span class="detail-value">{log.timezone}</span>
                    </div>
                  {/if}
                  {#if log.referer}
                    <div class="detail-item">
                      <span class="detail-label">Referer</span>
                      <span class="detail-value">{log.referer}</span>
                    </div>
                  {/if}
                  {#if log.user_agent}
                    <div class="detail-item full-width">
                      <span class="detail-label">User Agent</span>
                      <span class="detail-value ua">{log.user_agent}</span>
                    </div>
                  {/if}
                  {#if log.user_session}
                    <div class="detail-item full-width">
                      <span class="detail-label">Session</span>
                      <pre class="detail-json">{formatJson(log.user_session)}</pre>
                    </div>
                  {/if}
                  {#if log.params?.source_url}
                    <div class="detail-item full-width">
                      <span class="detail-label">Source URL</span>
                      <pre class="detail-json detail-source-url">{formatSourceUrl(log.params.source_url)}</pre>
                    </div>
                  {/if}
                  {#if restParams}
                    <div class="detail-item full-width">
                      <span class="detail-label">Params</span>
                      <pre class="detail-json">{formatJson(restParams)}</pre>
                    </div>
                  {/if}
                  {#if log.body}
                    <div class="detail-item full-width">
                      <span class="detail-label">Request Body</span>
                      <pre class="detail-json">{formatJson(log.body)}</pre>
                    </div>
                  {/if}
                  {#if log.response_body}
                    <div class="detail-item full-width">
                      <span class="detail-label">Response Body</span>
                      <pre class="detail-json">{formatJson(log.response_body)}</pre>
                    </div>
                  {/if}
                  {#if log.headers}
                    <div class="detail-item full-width">
                      <details>
                        <summary class="detail-label">Headers</summary>
                        <pre class="detail-json">{formatJson(log.headers)}</pre>
                      </details>
                    </div>
                  {/if}
                </div>
                </div>
              </td>
            </tr>
          {/if}
        {/each}
      </tbody>
    </table>

    {#if filteredLogs.length === 0}
      <div class="empty-state">
        <p>No logs match your filters</p>
      </div>
    {/if}
  </div>

  <p class="log-count">{filteredLogs.length} of {logs.length} logs shown</p>
</main>

<style>
  main {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
  }

  /* ---- Stats Bar ---- */
  .stats-bar {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .stat-card {
    flex: 1;
    min-width: 7rem;
    background: white;
    border-radius: 1rem;
    padding: 1rem 1.2rem;
    box-shadow: 0 0.3rem 1rem rgba(6, 81, 126, 0.12);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.2rem;
  }
  .stat-value {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--primary-color);
    line-height: 1;
  }
  .stat-value small {
    font-size: 0.7em;
    font-weight: 500;
    opacity: 0.7;
  }
  .stat-value.stat-warn { color: #e67e22; }
  .stat-value.stat-danger { color: #e74c3c; }
  .stat-label {
    font-size: 0.78rem;
    color: #6b7c8a;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    font-weight: 500;
  }

  /* ---- Filters ---- */
  .filters {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    align-items: center;
    padding: 1rem 1.5rem;
  }
  .filter-input, .filter-select {
    font-family: inherit;
    font-size: 0.92rem;
    padding: 0.55rem 1rem;
    border: 1px solid #d8dfe5;
    border-radius: 0.6rem;
    background: #f8fafc;
    color: #2c3e50;
    outline: none;
    transition: border-color 0.15s;
  }
  .filter-input { flex: 1; min-width: 10rem; }
  .filter-select { min-width: 9rem; }
  .filter-input:focus, .filter-select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(23, 97, 167, 0.12);
  }
  .clear-btn {
    font-family: inherit;
    font-size: 0.85rem;
    padding: 0.55rem 1rem;
    border: none;
    border-radius: 0.6rem;
    background: var(--secondary-color);
    color: var(--primary-color);
    cursor: pointer;
    font-weight: 600;
    transition: background 0.15s;
    white-space: nowrap;
  }
  .clear-btn:hover { background: var(--secondary-hover-color); }

  /* ---- Table ---- */
  .table-wrap {
    overflow-x: auto;
    padding: 0;
  }
  .table-wrap.box { padding: 0; }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.92rem;
    table-layout: fixed;
  }
  thead th {
    position: sticky;
    top: 0;
    background: #f1f5f9;
    padding: 0.8rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #475569;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 2px solid #e2e8f0;
    white-space: nowrap;
  }
  thead th:first-child { border-radius: 2rem 0 0 0; }
  thead th:last-child { border-radius: 0 2rem 0 0; }
  tbody td {
    padding: 0.65rem 1rem;
    border-bottom: 1px solid #f0f3f6;
    vertical-align: middle;
  }
  .log-row { transition: background 0.1s; }
  .log-row.clickable { cursor: pointer; }
  .log-row:hover { background: #f8fafd; }
  .log-row.expanded { background: var(--secondary-color); }

  /* Columns */
  .col-time   { width: 6rem;  white-space: nowrap; color: #64748b; font-size: 0.85rem; }
  .col-method { width: 5.5rem; }
  .col-status { width: 5rem; }
  .col-rt     { width: 6rem; }
  .col-user   { width: 8rem; }
  .col-location { width: 10rem; white-space: nowrap; font-size: 0.85rem; color: #64748b; }
  .col-expand { width: 2rem; text-align: center; }
  /* path gets the remaining space */
  .col-path {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: 'DM Mono', 'Fira Code', monospace;
    font-size: 0.88rem;
  }
  /* prevent cell text from overflowing fixed-layout cells */
  tbody td {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ---- Badges ---- */
  .method-badge {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    border-radius: 0.35rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }
  .method-get    { background: #dbeafe; color: #1d4ed8; }
  .method-post   { background: #d1fae5; color: #047857; }
  .method-put    { background: #fef3c7; color: #b45309; }
  .method-patch  { background: #fef3c7; color: #b45309; }
  .method-delete { background: #fee2e2; color: #dc2626; }
  .method-head   { background: #e0e7ff; color: #4338ca; }
  .method-options{ background: #f3e8ff; color: #7c3aed; }

  .status-badge {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    border-radius: 0.35rem;
    font-size: 0.82rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .status-2xx { background: #d1fae5; color: #065f46; }
  .status-3xx { background: #dbeafe; color: #1e40af; }
  .status-4xx { background: #fef3c7; color: #92400e; }
  .status-5xx { background: #fee2e2; color: #991b1b; }

  .rt-badge {
    font-size: 0.82rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .rt-fast { color: #059669; }
  .rt-mid  { color: #d97706; }
  .rt-slow { color: #dc2626; }
  .rt-na   { color: #94a3b8; }

  /* ---- Expand Icon ---- */
  .expand-icon {
    display: inline-block;
    transition: transform 0.15s;
    font-size: 0.9rem;
    color: #94a3b8;
  }
  .expand-icon.rotated { transform: rotate(90deg); }

  /* ---- Detail Row ---- */
  .detail-row td {
    padding: 0;
    background: #f8fafc;
    border-bottom: 2px solid var(--primary-color);
    overflow: hidden;
  }
  .detail-scroll {
    overflow-x: auto;
    width: 100%;
  }
  .detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    gap: 0.6rem 1.5rem;
    padding: 1.2rem 1.5rem;
  }
  .detail-item.full-width {
    grid-column: 1 / -1;
  }
  .detail-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #64748b;
    margin-bottom: 0.2rem;
    cursor: default;
  }
  details .detail-label { cursor: pointer; }
  .detail-value {
    font-size: 0.9rem;
    color: #1e293b;
    word-break: break-all;
  }
  .detail-value.ua {
    font-size: 0.82rem;
    color: #475569;
  }
  .detail-json {
    background: #1e293b;
    color: #e2e8f0;
    padding: 0.8rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.8rem;
    overflow-x: auto;
    max-height: 20rem;
    margin: 0.3rem 0 0;
    line-height: 1.5;
  }
  .detail-source-url {
    max-height: none;
    font-size: 0.85rem;
    white-space: pre;
    overflow-x: auto;
    min-width: 0;
  }

  /* ---- Empty State ---- */
  .empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: #94a3b8;
    font-size: 1.1rem;
  }

  /* ---- Footer Count ---- */
  .log-count {
    text-align: center;
    font-size: 0.82rem;
    color: #94a3b8;
    margin: 0;
  }

  /* ---- Responsive ---- */
  @media (max-width: 768px) {
    .stats-bar { gap: 0.5rem; }
    .stat-card {
      min-width: 5.5rem;
      padding: 0.7rem 0.8rem;
    }
    .stat-value { font-size: 1.2rem; }
    .filters { gap: 0.5rem; }
    .filter-input { min-width: 8rem; }
    .detail-grid { grid-template-columns: 1fr; }
    .col-location { display: none; }
    thead .col-location { display: none; }
  }
</style>
