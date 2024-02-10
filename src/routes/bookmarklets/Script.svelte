<script>
    import LinkButton from "$lib/components/LinkButton.svelte";
    import MonacoEditor from "$lib/components/MonacoEditor.svelte";
    import { minify_sync } from "terser";

    /**
     * @type {{script_id: string, name: string, source: string}}
     */
    let { script_id, name, source } = $props();

    // @ts-ignore
    const bookmarklet = $derived(`javascript:(function(){${encodeURIComponent(minify_sync(source).code)}})();`);
</script>

<article class="user box">
    <h1>{name}</h1>
    <MonacoEditor on:change={event => source = event.detail} value={source} />
    <pre><code>{source}</code></pre>
    <div>
        <LinkButton href={bookmarklet}><span>{name}</span></LinkButton>
        <LinkButton href=/{script_id}.user.js>Install as a userscript</LinkButton>
    </div>
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        border-radius: 3em;
        padding: 2rem;
        gap: 2rem;
    }
    h1 {
        margin: 0;
    }
    div {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
    }
    pre {
        background-color: #f4f4f4;
        padding: 1rem;
        border-radius: 1em;
        overflow: auto;
        max-height: 200px;
    }
    span {
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        color: transparent;
        min-width: 10rem;
    }
    span::after {
        content: "Drag to bookmarks";
        position: absolute;
        color: white;
    }
</style>

