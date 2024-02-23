<script>
    import LinkButton from "$lib/components/LinkButton.svelte";
    import { minify_sync } from "terser";
    import hljs from 'highlight.js/lib/core';
    import javascript from 'highlight.js/lib/languages/javascript';
    import 'highlight.js/styles/stackoverflow-dark.min.css';

    let { name = '', author = '', source_url = '', description = '' } = $props();

    let source = $state('')
    let bookmarklet = $state('')

    $effect(() => {
        (async () => {
            const responseBody = await (await fetch(source_url)).text();
            // remove "javascript:" prefix if present
            source = responseBody.replace(/^javascript:/, '');

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
     * @type {HTMLElement}
     */
    let codeElement;
    hljs.registerLanguage('javascript', javascript);
    let sourceHighlighted = $derived(hljs.highlight(source, { language: 'javascript' }).value);
</script>

<article class="box">
    <h1>{name}</h1>

    {#if description}<p>{description}</p>{/if}

    <div class="metadata">
        {#if author}<span><span>Author:</span> {author}</span>{/if}
        <span><span>Source URL:</span> <a href={source_url}>{source_url}</a></span>
    </div>

    <div>
        <LinkButton href={bookmarklet}>
            <span class="label"><!-- Drag to bookmarks --></span>
            <span class="name">{name}</span>
        </LinkButton>
    </div>

    <pre><code bind:this={codeElement} class="language-javascript">{@html sourceHighlighted}</code></pre>
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        border-radius: 3em;
        padding: 2rem;
        gap: 1.5rem;
        max-width: 90vw;
    }
    .metadata {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    h1, h3 {
        margin: 0;
    }
    span > span {
        font-weight: bold;
    }
    pre {
        background-color: #333;
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

