<script>
    import Details from "$lib/components/Details.svelte";
    import Script from "$lib/components/Script.svelte";
    import { createScriptSearchText, normalizeSearchText } from "$lib/scriptSearch.js";

    const { data } = $props();

    let searchQuery = $state('');
    /** @type {Record<string, string>} */
    let scriptSearchTextByUrl = $state({});

    let normalizedSearchQuery = $derived(normalizeSearchText(searchQuery));
    let searchWords = $derived(normalizedSearchQuery.split(/\s+/).filter(Boolean));

    let searchResults = $derived.by(() => {
        /** @type {Record<string, boolean>} */
        const nextVisibleScriptsByUrl = {};
        let nextMatchingScriptCount = 0;
        const query = normalizedSearchQuery;
        const words = searchWords;
        const searchTextByUrl = scriptSearchTextByUrl;

        for (const script of data.scripts) {
            const text = searchTextByUrl[script.source_url] || createScriptSearchText({
                source_url: script.source_url,
            });
            const visible = !query || words.every((word) => text.includes(word));
            nextVisibleScriptsByUrl[script.source_url] = visible;
            if (visible) nextMatchingScriptCount += 1;
        }

        return {
            visibleScriptsByUrl: nextVisibleScriptsByUrl,
            matchingScriptCount: nextMatchingScriptCount,
        };
    });

    /**
     * @param {{ source_url: string, source: string, name: string, description: string }} metadata
     */
    function handleScriptMetadata(metadata) {
        const searchText = createScriptSearchText(metadata);

        if (scriptSearchTextByUrl[metadata.source_url] === searchText) return;

        scriptSearchTextByUrl = {
            ...scriptSearchTextByUrl,
            [metadata.source_url]: searchText,
        };
    }

</script>

<div class="introduction">
    <div>
        <div class="hero">
            <div class="hero-text">
                <h1>Browser scripts you can trust</h1>
                <p class="hero-sub">Browse, share, and install bookmarklets &amp; userscripts — all open source, all reviewable.</p>
                <div class="hero-actions">
                    <a href="/scripts/add" class="btn-primary">+ Submit a Script</a>
                    <a href="#scripts" class="btn-secondary">Browse Scripts ↓</a>
                </div>
            </div>
        </div>

        <hr>

        <h2>How it works</h2>

        <ol class="how-list">
            <li>
                <span class="step-num">1</span>
                <div>
                    <strong>Find a script</strong> you want below, or <a href="/scripts/add">submit your own</a> by pasting a URL to a raw JS file.
                </div>
            </li>
            <li>
                <span class="step-num">2</span>
                <div>
                    <strong>Install it</strong> by dragging the <em>Install bookmarklet</em> button to your bookmarks toolbar.
                </div>
            </li>
            <li>
                <span class="step-num">3</span>
                <div>
                    <strong>Run it</strong> by clicking the bookmark on any page.
                </div>
            </li>
        </ol>

        <p class="metadata-intro">
            You can add optional metadata to your script using userscript-like comments:
        </p>
        <ul class="metadata-tags">
            <li><code>// @name</code> – display name (defaults to the filename)</li>
            <li><code>// @description</code> – short description</li>
            <li><code>// @image</code> – URL to a screenshot or preview image (repeatable)</li>
            <li><code>// @video</code> – URL to a demo video (repeatable)</li>
        </ul>

        <Details>
            <summary><h2>What, How, Why?</h2></summary>

            <h3>What are Bookmarklets?</h3>
            <p>They are small JavaScript programs stored as browser bookmarks.</p>
            <p>When you click the bookmark, the code runs on the current web page, to do things like:</p>
            <ul>
                <li>modify the page</li>
                <li>automate actions</li>
                <li>extract information.</li>
            </ul>

            <h3>How to install a bookmarklet</h3>
            <p>There are multiple ways:</p>
            <ul>
                <li>Drag the <strong>Install</strong> button to your browser's bookmarks toolbar.</li>
                <li>(Firefox only) Right-click the <strong>Install</strong> button and select <strong>"Bookmark link"</strong>.</li>
                <li>Manually add a new bookmark. Right-click the <strong>Install</strong> button and select <strong>"Copy link address"</strong>, then create a new bookmark and paste the URL in the URL field.</li>
            </ul>

            <h3>Why bookmarklets?</h3>

            <p>Bookmarklets and Userscripts should ideally be implemented as Web Extensions, but verifying that extensions <i>only do</i> what they claim is hard. Although permissions aim to address this issue, they are too broad. So often, a better option is to read and verify the code ourselves.</p>

            <p>However, verifying extensions has two challenges: <strong>1.</strong> Learning how extensions work and its APIs <strong>2.</strong> Accessing the source code. Especially relevant for extensions that can be written as a one-line bookmarklet, it's harder to verify them than to write them as a bookmarklet.</p>

            <p>Narrowing permissions' scope would help, but it requires significant coordination and effort, making it feasible only for the most common requested permissions.</p>

            <p>Extension platforms should make it easy to read the code, it's the best way to tell what an extension can do. But until then, bookmarklets and userscripts remain better options for many tasks.</p>
        </Details>

    </div>
</div>

<div class="scripts" id="scripts">
    <div>
        <div class="search">
            <div class="search-input-wrap">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input
                    id="script-search"
                    type="search"
                    bind:value={searchQuery}
                    placeholder="Search by title, URL, description, or source…"
                    autocomplete="off"
                    aria-label="Search scripts"
                >
            </div>
            {#if searchQuery}
                <p class="search-count">{searchResults.matchingScriptCount} of {data.scripts.length} scripts match</p>
            {:else}
                <p class="search-count">{data.scripts.length} scripts</p>
            {/if}
        </div>

        {#if searchResults.matchingScriptCount === 0}
            <div class="empty-state">
                <p>No scripts match <strong>"{searchQuery}"</strong></p>
                <button class="clear-search" onclick={() => searchQuery = ''}>Clear search</button>
            </div>
        {/if}

        {#each data.scripts as {source_url, content_hash}}
            <div class="box" data-testid="script-card" hidden={searchResults.visibleScriptsByUrl[source_url] === false}>
                <Script {source_url} {content_hash} collapseCode={true} onmetadata={handleScriptMetadata} />
            </div>
        {/each}
    </div>
</div>

<style>
    :global(#content):has(.introduction) {
        background: white;
        padding: 0;
    }

    /* ---- Introduction / Hero ---- */
    .introduction {
        padding: 2rem 2rem 2.5rem;
        & > div {
            max-width: 1000px;
            margin: auto;
        }
    }

    .hero {
        padding: 2rem 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .hero-text h1 {
        font-size: clamp(1.8rem, 4vw, 2.6rem);
        font-weight: 700;
        color: #0d1f30;
        margin: 0 0 0.5rem;
        line-height: 1.2;
    }

    .hero-sub {
        font-size: 1.1rem;
        color: var(--text-muted);
        margin: 0 0 1.25rem;
        max-width: 46rem;
    }

    .hero-actions {
        display: flex;
        gap: 0.75rem;
        flex-wrap: wrap;
    }

    .btn-primary {
        display: inline-block;
        background: var(--primary-color);
        color: white;
        font-weight: 600;
        text-decoration: none;
        padding: 0.65rem 1.4rem;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        transition: background 0.15s, transform 0.1s;
    }
    .btn-primary:hover {
        background: var(--primary-hover-color);
        transform: translateY(-1px);
    }

    .btn-secondary {
        display: inline-block;
        background: var(--secondary-color);
        color: var(--primary-color);
        font-weight: 600;
        text-decoration: none;
        padding: 0.65rem 1.4rem;
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        transition: background 0.15s;
    }
    .btn-secondary:hover {
        background: var(--secondary-hover-color);
    }

    /* ---- How it works ---- */
    .how-list {
        list-style: none;
        padding: 0;
        margin: 0.5rem 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .how-list li {
        display: flex;
        align-items: flex-start;
        gap: 0.85rem;
    }

    .step-num {
        flex-shrink: 0;
        width: 1.8rem;
        height: 1.8rem;
        border-radius: 50%;
        background: var(--primary-color);
        color: white;
        font-size: 0.85rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 0.1rem;
    }

    .metadata-intro {
        margin-bottom: 0.25rem;
    }

    .metadata-tags {
        list-style: none;
        padding: 0;
        margin: 0 0 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .metadata-tags li {
        display: flex;
        align-items: baseline;
        gap: 0.75rem;
    }

    .metadata-tags code {
        background: #eef2f7;
        color: #1a3a5c;
        padding: 0.15rem 0.5rem;
        border-radius: 0.3rem;
        font-size: 0.9em;
        white-space: nowrap;
    }

    hr {
        border: none;
        border-top: 1px solid var(--border-color);
        margin: 1.5rem 0;
    }

    h2 {
        margin: 1.25rem 0 0.75rem;
        color: #0d1f30;
    }

    summary {
        text-decoration: underline;
    }

    /* ---- Scripts section ---- */
    .scripts {
        background: var(--dark-bg);
        padding: 2rem;

        & > div {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 1000px;
            margin: auto;
        }

        .box {
            display: flex;
            flex-direction: column;
            gap: 1rem;

            &[hidden] {
                display: none;
            }
        }
    }

    /* ---- Search ---- */
    .search {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
    }

    .search-input-wrap {
        position: relative;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 1.1rem;
        height: 1.1rem;
        color: #94a3b8;
        pointer-events: none;
    }

    .search-input-wrap input {
        width: 100%;
        padding: 0.8rem 1rem 0.8rem 2.75rem;
        border: 2px solid transparent;
        border-radius: var(--radius-md);
        font: inherit;
        font-size: 1rem;
        background: rgba(255,255,255,0.96);
        color: #1a2533;
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
    }

    .search-input-wrap input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px rgba(23,97,167,0.15);
    }

    .search-count {
        color: rgba(255,255,255,0.7);
        font-size: 0.85rem;
        margin: 0;
        padding-left: 0.25rem;
    }

    /* ---- Empty state ---- */
    .empty-state {
        background: rgba(255,255,255,0.08);
        border: 1px dashed rgba(255,255,255,0.25);
        border-radius: var(--radius-lg);
        padding: 2rem;
        text-align: center;
        color: rgba(255,255,255,0.85);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
    }

    .empty-state p {
        margin: 0;
        font-size: 1rem;
    }

    .clear-search {
        background: var(--secondary-color);
        color: var(--primary-color);
        border: none;
        border-radius: var(--radius-sm);
        padding: 0.45rem 1rem;
        font: inherit;
        font-weight: 600;
        font-size: 0.9rem;
        cursor: pointer;
        transition: background 0.15s;
    }

    .clear-search:hover {
        background: var(--secondary-hover-color);
    }
</style>
