<script>
    import Source from './Source.svelte';
    import LinkButton from "$lib/components/LinkButton.svelte";
    import { minify_sync } from "terser";
    import { getScriptMetadata } from "$lib";
    import { untrack } from "svelte";

    /**
     * @type {{ uploader?: string, source_url?: string, collapseCode?: boolean, editMode?: boolean }}
     */
    let { uploader = '', source_url = $bindable(''), collapseCode = false, editMode = $bindable(false) } = $props();

    let source = $state('')

    let isDataURL = $derived(source_url.startsWith('data:'));

    let showCode = $state(!collapseCode);

    $effect(() => { showCode && fetch(`/shown/${encodeURIComponent(source_url)}`) })

    $effect(() => {
        if (!source_url || (isDataURL && source)) return;

        (async () => {
            const responseBody = await (await fetch(source_url)).text();
            // remove "javascript:" prefix if present
            source = responseBody.trim().replace(/^javascript:/, '');
            editMode = false;
        })()
    })

    let { name, description } = $derived(getScriptMetadata(source, untrack(()=>source_url)))

    let bookmarklet = $derived.by(() => {
        try {
            const minified = minify_sync(source)?.code || '';
            return `javascript:(function(){${encodeURIComponent(minified)}})();`
        } catch (error) {
            console.error(error);
            return ''
        }
    })

    /**
     * @param {string} newSource
     */
    function handleSourceChanged(newSource) {
        source = newSource;
        source_url = `data:text/javascript,${encodeURIComponent(source)}`;
    }

    /**
     * @param event {{currentTarget: HTMLAnchorElement}}
     */
    async function handleUserscriptInstall(event) {

        let userscript_source;
        if (source.match(/==UserScript==/)) {
            if (!source_url.endsWith('.user.js')) {
                event.currentTarget.href += '#.user.js';
            }
            if (!isDataURL) {
                return
            }
            userscript_source = source;
        } else {
            userscript_source = addUserscriptHeaders(name, description, uploader, source_url, source)
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
    function addUserscriptHeaders(name, description, uploader, source_url, source) {
        /**
         * @type {{[key: string]: string}}
         */
        const headers = {
            name: name || 'Unnamed',
            match: '*://*/*',
            grant: 'none',
        }
        if (description) headers.description = description;
        if (uploader) headers.uploader = uploader;
        if (!isDataURL) headers.downloadURL = source_url

        const headers_str = Object.entries(headers).map(([key, value]) => `// @${key}  ${value}`).join('\n')
        return `// ==UserScript==\n${headers_str}\n// ==/UserScript==\n\n${source}`;
    }
</script>

<article>

    <div class="title_row">
        <div class="title"><a href={`/scripts/${encodeURIComponent(source_url)}`} title={name} data-sveltekit-preload-data="tap"><h1>{name}</h1></a></div>
        <div class="install">
            <LinkButton href={bookmarklet} disabled={!bookmarklet}>
                <span class="label"><!-- Drag to bookmarks --></span>
                <span class="name">{name}</span>
            </LinkButton>
            <LinkButton
                href={source_url}
                onclick={handleUserscriptInstall}
            >Install as Userscript</LinkButton>
        </div>
    </div>


    {#if description}<p>{description}</p>{/if}

    <div class="metadata">
        {#if uploader}<div><span>Uploaded by:</span> {uploader}</div>{/if}
        {#if source_url}<div class="source_url"><span>Source URL:</span> <a href={source_url}>{decodeURIComponent(source_url)}</a></div>{/if}
    </div>
    <details bind:open={showCode} >
        <summary class:hidden={!collapseCode}>Source code</summary>
        <Source {source} {handleSourceChanged} {editMode}/>
    </details>
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .metadata {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        overflow: hidden;
    }
    .source_url {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    h1, p {
        margin: 0;
    }
    .metadata span {
        font-weight: bold;
    }
    span.label::after {
        content: "Install bookmarklet";
        color: white;
        min-width: 10rem;
    }
    :global(a:hover) span.label::after {
        content: "Drag to bookmarks";
    }
    span.name {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
    .title_row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        align-self: stretch;
        overflow: hidden;
        flex-wrap: wrap;
    }
    .title {
        display: flex;
        flex-grow: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        flex-basis: 15rem;
    }
    .title a {
        text-decoration: none;
    }
    .title a:hover {
        opacity: 0.7;
    }
    .title * {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .install {
        display: flex;
        gap: 1rem;
    }
    details {
        font-size: larger;
    }
    details > summary {
        cursor: pointer;
        display: inline list-item;
    }
    details > summary:hover {
        opacity: 0.7;
    }
    details > summary::before {
        content: "Show ";
    }
    details[open] > summary::before {
        content: "Hide ";
    }
    details > summary.hidden {
        display: none;
    }
    details > summary:not(.hidden) + :global(*){
        margin-top: 1rem;
    }
</style>
