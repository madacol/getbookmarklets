<script>
    import LinkButton from "$lib/components/LinkButton.svelte";
    import MonacoEditor from "$lib/components/MonacoEditor.svelte";
    import { minify_sync } from "terser";
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';
    import 'highlight.js/styles/stackoverflow-dark.min.css';
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";
    import { urlToName } from "$lib";

    let { uploader = '', source_url = '', showCode = true } = $props();

    let name = $state('');
    let description = $state('');

    let source = $state('')
    let bookmarklet = $state('')

    let editMode = $state(false);

    let isDataURL = $derived(source_url.startsWith('data:'));

    $effect(() => {
        if (!source_url || (source_url.toLowerCase().match(/^data:/) && source)) return;

        (async () => {
            const responseBody = await (await fetch(source_url)).text();
            // remove "javascript:" prefix if present
            source = responseBody.trim().replace(/^javascript:/, '');
            editMode = false;

            // try to extract description from the source in the case it is a userscript
            if (!name) {
                const match = source.match(/\/\/\s*@name\s*(.*)/);
                if (match) {
                    name = match[1].trim();
                } else {
                    name = urlToName(source_url);
                }
            }
            const match = source.match(/\/\/\s*@description\s*(.*)/);
            if (match) {
                description = match[1].trim();
            }
        })()
    })

    $effect(() => {
        try {
            const minified = minify_sync(source)?.code || '';
            bookmarklet = `javascript:(function(){${encodeURIComponent(minified)}})();`
        } catch (error) {
            console.error(error);
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
     * @type {HTMLElement}
     */
    hljs.registerLanguage('javascript', javascript);
    let sourceHighlighted = $derived(hljs.highlight(source, { language: 'javascript' }).value);

    /**
     * @param event {{target: HTMLAnchorElement}}
     */
    async function handleUserscriptInstall(event) {

        let userscript_source;
        if (source.match(/==UserScript==/)) {
            if (!source_url.endsWith('.user.js')) {
                event.target.href += '#.user.js';
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
        event.target.href = href;
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
        return `// ==UserScript==\n${headers_str}\n// ==/UserScript==

${source}`;
    }
</script>

<article class="box">

    <div class="title_row">
        <a class="name" href={`/scripts/${encodeURIComponent(source_url)}`} title={name}><h1>{name}</h1></a>
        <LinkButton href={bookmarklet}>
            <span class="label"><!-- Drag to bookmarks --></span>
            <span class="name">{name}</span>
        </LinkButton>
        <LinkButton
            href={source_url}
            onclick={handleUserscriptInstall}
        >Install as Userscript</LinkButton>
    </div>


    {#if description}<p>{description}</p>{/if}

    <div class="metadata">
        {#if uploader}<div><span>Uploaded by:</span> {uploader}</div>{/if}
        {#if source_url}<div class="source_url"><span>Source URL:</span> <a href={source_url}>{decodeURIComponent(source_url)}</a></div>{/if}
    </div>
    {#if showCode}
        <div class="source_editor">
            <PrimaryButton onclick={() => editMode = !editMode}>
                {#if editMode}Close editor{:else}Edit with Monaco{/if}
            </PrimaryButton>
            <div class="source">
                {#if editMode}
                    <MonacoEditor onchange={handleSourceChanged} value={source} />
                {:else}
                    <pre><code class="language-javascript">{@html sourceHighlighted}</code></pre>
                {/if}
            </div>
        </div>
    {:else}
        <PrimaryButton onclick={() => showCode = true}>Show code</PrimaryButton>
    {/if}
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 1000px;
        min-width: max(60vw, 25rem);
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
    h1, h3 {
        margin: 0;
    }
    .metadata span {
        font-weight: bold;
    }
    .source_editor {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    pre, p {
        margin: 0;
    }
    .source > pre {
        background-color: #1e1e1e;
        color: white;
        padding: 1rem;
        border-radius: 1em;
        overflow: auto;
        max-height: 100vh;
    }
    span.label::after {
        content: "Drag to bookmarks";
        color: white;
        min-width: 10rem;
    }
    span.name {
        display: none;
    }
    .title_row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 2rem;
        align-self: stretch;
        overflow: hidden;
    }
    .name {
        flex-grow: 1;
        text-overflow: ellipsis;
        overflow: hidden;
        flex-basis: 20rem;
    }
    .name > h1 {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
