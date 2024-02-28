<script>
    import LinkButton from "$lib/components/LinkButton.svelte";
    import MonacoEditor from "$lib/components/MonacoEditor.svelte";
    import { minify_sync } from "terser";
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';
    import 'highlight.js/styles/stackoverflow-dark.min.css';
    import PrimaryButton from "$lib/components/PrimaryButton.svelte";

    let { name = '', author = '', source_url = '', description = '' } = $props();

    let source = $state('')
    let bookmarklet = $state('')

    let editMode = $state(!source_url);

    $effect(() => {
        if (!source_url || source_url.toLowerCase().match(/^data:/)) return;

        (async () => {
            const responseBody = await (await fetch(source_url)).text();
            // remove "javascript:" prefix if present
            source = responseBody.replace(/^javascript:/, '');
            editMode = false;

            // try to extract description from the source in the case it is a userscript
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
        source_url = `data:text/javascript;charset=utf-8,${encodeURIComponent(source)}`;
    }

    /**
     * @type {HTMLElement}
     */
    hljs.registerLanguage('javascript', javascript);
    let sourceHighlighted = $derived(hljs.highlight(source, { language: 'javascript' }).value);
</script>

<article class="box">
    {#if name}<h1>{name}</h1>{/if}

    {#if description}<pre>{description}</pre>{/if}

    <div class="metadata">
        {#if author}<span><span>Author:</span> {author}</span>{/if}
        {#if source_url}<span class="source_url"><span>Source URL:</span> <a href={source_url}>{source_url}</a></span>{/if}
    </div>

    <div>
        <LinkButton href={bookmarklet}>
            <span class="label"><!-- Drag to bookmarks --></span>
            <span class="name">{name}</span>
        </LinkButton>
    </div>

    <div class="source">
        {#if source_url}
            <PrimaryButton onclick={() => editMode = !editMode}>
                {#if editMode}Close editor{:else}Edit with Monaco{/if}
            </PrimaryButton>
        {/if}
        {#if editMode || !source_url}
            <MonacoEditor onchange={handleSourceChanged} value={source} />
        {:else}
            <pre><code class="language-javascript">{@html sourceHighlighted}</code></pre>
        {/if}
    </div>
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        max-width: 100vw;
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
    span > span {
        font-weight: bold;
    }
    .source {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .source > pre {
        background-color: #1e1e1e;
        color: white;
        padding: 1rem;
        border-radius: 1em;
        overflow: auto;
        max-height: 100vh;
        margin: 0;
    }
    span.label::after {
        content: "Drag to bookmarks";
        color: white;
        min-width: 10rem;
    }
    span.name {
        display: none;
    }
    article > div {
        display: flex;
        flex-direction: row;
        gap: 2rem;
        bottom: 0;
    }
</style>

