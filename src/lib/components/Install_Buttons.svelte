<script>
    import { getScriptMetadata } from "$lib";
    import LinkButton from "$lib/components/LinkButton.svelte";
    import { untrack } from "svelte";

    /**
     * @type {{ source: string, source_url: string }}
     */
    let { source, source_url } = $props();

    let isUserscript = $derived(source.startsWith('// ==UserScript=='));

    let isDataURL = $derived(source_url.startsWith('data:'));

    let { name, description } = $derived(getScriptMetadata(source, untrack(()=>source_url)))
    let shareCopied = $state(false);
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let shareCopiedResetTimer;

    let bookmarklet = $derived.by(() => {
        try {
            const source_no_comments = source.replaceAll(/(^|\n)\s*(\/\/.*?)?(?=\n)/g,'').replace(/ +/, ' ').trim();
            return `javascript:(()=>{${encodeURIComponent(source_no_comments)}})()`
        } catch (error) {
            console.error(error);
            return ''
        }
    })

    /**
     * @param event {{currentTarget: HTMLAnchorElement}}
     */
    async function handleUserscriptInstall(event) {

        navigator.sendBeacon(`/signal/userscript/${encodeURIComponent(source_url)}`);

        let userscript_source;
        if (isUserscript) {
            if (!isDataURL) {
                if (!source_url.endsWith('.user.js')) {
                    event.currentTarget.href += '#.user.js';
                }
                return
            }
            userscript_source = source;
        } else {
            userscript_source = addUserscriptHeaders(name, description, source_url, source)
        }

        // send file to the server in the url
        const href = `/userscript/${encodeURIComponent(userscript_source)}#${name||"userscript"}.user.js`;
        event.currentTarget.href = href;
    }

    /**
     * @param name {string}
     * @param description {string}
     * @param uploader {string}
     * @param source_url {string}
     * @param source {string}
     */
    function addUserscriptHeaders(name, description, source_url, source) {
        /**
         * @type {{[key: string]: string}}
         */
        const headers = {
            name: name || 'Unnamed',
            match: '*://*/*',
            grant: 'none',
        }
        if (description) headers.description = description;
        if (!isDataURL) headers.downloadURL = source_url

        const headers_str = Object.entries(headers).map(([key, value]) => `// @${key}  ${value}`).join('\n')
        return `// ==UserScript==\n${headers_str}\n// ==/UserScript==\n\n${source}`;
    }

    const installMessage =
`To install, do one of the following:

    - Drag button to the bookmark's bar

    - Right-click and select "Bookmark link" (Firefox only)

        - Right-click and select "Copy link address", now
        create a new bookmark and paste in the URL field
`

    /**
     * @param {MouseEvent} event
     */
    function handleBookmarkletClick(event) {
        alert(installMessage);
        event.preventDefault();
    }

    /**
     * @param {DragEvent} startEvent
     */
    function handleBookmarkletDragStart(startEvent) {
        /**
         * @param {DragEvent} event
         */
        const leaveHandler = event => {
            if (event.relatedTarget === null) {
                navigator.sendBeacon(`/signal/drag/${encodeURIComponent(source_url)}`);
            }
        };
        window.addEventListener('dragleave', leaveHandler);

        if (startEvent.currentTarget instanceof HTMLElement) {
            startEvent.currentTarget.addEventListener('dragend', () => window.removeEventListener('dragleave', leaveHandler));
        }
    }

    /**
     * @param {MouseEvent} event
     */
    function handleShareClick(event) {
        event.preventDefault();
        const shareUrl = `/scripts#${source_url}`;
        const shareableUrl = new URL(shareUrl, window.location.origin).href;

        if (navigator.share) {
            navigator.share({
                title: name || 'Bookmarklet',
                text: description,
                url: shareableUrl
            })
            .then(() => {
                navigator.sendBeacon(`/signal/share/${encodeURIComponent(source_url)}`);
            })
            .catch(err => console.error('Share failed:', err));
        } else {
            navigator.clipboard.writeText(shareableUrl)
            .then(() => {
                shareCopied = true;
                clearTimeout(shareCopiedResetTimer);

                shareCopiedResetTimer = setTimeout(() => {
                    shareCopied = false;
                }, 2000);

                navigator.sendBeacon(`/signal/share_copy/${encodeURIComponent(source_url)}`);
            })
            .catch(err => {
                console.error('Copy failed:', err);
                alert('Failed to copy link. Please copy the URL manually.');
            });
        }
    }
</script>

<div class="install">
    <div class="install-combo">
        <LinkButton
            class="bookmarklet-install"
            href={bookmarklet}
            onclick={handleBookmarkletClick}
            disabled={!bookmarklet}
            ondragstart={handleBookmarkletDragStart}
            oncontextmenu={()=>navigator.sendBeacon(`/signal/rightclick/${encodeURIComponent(source_url)}`)}
        >
            <span class="label"><!-- Install bookmarklet / Drag to bookmarks --></span>
            <span class="name">{name}</span>
        </LinkButton>
        <details class="install-menu">
            <summary aria-label="Install options" title="Install options">
                <span aria-hidden="true">▾</span>
            </summary>
            <div class="install-menu-panel">
                <a href={source_url} onclick={handleUserscriptInstall}>
                    Install as Userscript
                </a>
            </div>
        </details>
    </div>
    <LinkButton
        class="share-button"
        onclick={handleShareClick}
        aria-label="Share"
        title="Share"
    >
        <svg viewBox="0 0 24 24" aria-hidden="true">
            {#if shareCopied}
                <path d="m5 13 4 4L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
            {:else}
                <path d="M8 11 16 7M8 13l8 4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <circle cx="5" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="19" cy="5" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
                <circle cx="19" cy="19" r="3" fill="none" stroke="currentColor" stroke-width="2"/>
            {/if}
        </svg>
    </LinkButton>
</div>

<style>
    .install {
        display: flex;
        gap: 0.65rem;
        flex-wrap: wrap;
        align-items: stretch;
        max-width: 100%;
    }
    .install-combo {
        display: flex;
        position: relative;
        flex: 0 1 10.75rem;
        min-width: min(100%, 10.75rem);
        max-width: 100%;
    }
    :global(.bookmarklet-install) {
        flex: 1 1 auto;
        min-width: 0;
    }
    :global(.bookmarklet-install > div) {
        border-radius: var(--radius-md, 0.75rem) 0 0 var(--radius-md, 0.75rem);
        box-sizing: border-box;
        min-height: 3.25rem;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.95rem 1rem;
    }
    .install-menu {
        flex: 0 0 3.25rem;
        min-width: 3.25rem;
    }
    .install-menu summary {
        height: 100%;
        min-height: 3.25rem;
        box-sizing: border-box;
        list-style: none;
        background: var(--primary-color);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.15rem;
        font-weight: 700;
        border-radius: 0 var(--radius-md, 0.75rem) var(--radius-md, 0.75rem) 0;
        box-shadow: var(--shadow-md, 0 0.3rem 0.9rem rgba(6, 81, 126, 0.18));
        user-select: none;
    }
    .install-menu summary::-webkit-details-marker {
        display: none;
    }
    .install-menu[open] summary,
    .install-menu summary:hover {
        background: var(--primary-hover-color);
    }
    .install-menu-panel {
        position: absolute;
        z-index: 20;
        top: calc(100% + 0.35rem);
        left: 0;
        min-width: 100%;
        background: white;
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: var(--radius-md, 0.75rem);
        box-shadow: var(--shadow-lg, 0 0.5rem 1.5rem rgba(6, 81, 126, 0.18));
        overflow: hidden;
    }
    .install-menu-panel a {
        display: block;
        padding: 0.85rem 1rem;
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 700;
        white-space: nowrap;
    }
    .install-menu-panel a:hover {
        background: var(--secondary-color);
    }
    span.label::after {
        content: "Install";
        display: inline-block;
        color: white;
        min-width: 4.5rem;
    }
    :global(a:hover) span.label::after {
        content: "Drag to bookmarks";
    }
    span.name {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
    :global(.share-button) {
        flex: 0 0 3.25rem;
    }
    :global(.share-button > div) {
        width: 3.25rem;
        height: 100%;
        min-height: 3.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        border-radius: var(--radius-md, 0.75rem);
    }
    :global(.share-button svg) {
        width: 1.35rem;
        height: 1.35rem;
    }
</style>
