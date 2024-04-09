<script>
    import hljs from "highlight.js";
    import MonacoEditor from "./MonacoEditor.svelte";
    import PrimaryButton from "./PrimaryButton.svelte";
    import javascript from "highlight.js/lib/languages/javascript";
    import 'highlight.js/styles/stackoverflow-dark.min.css';

    /**
    * @type {{ source: string, handleSourceChanged: (newSource: string) => void, editMode?: boolean}}
     */
    let { source, handleSourceChanged, editMode = $bindable(false) } = $props();

    /**
     * @type {HTMLElement}
     */
     hljs.registerLanguage('javascript', javascript);
    let sourceHighlighted = $derived(hljs.highlight(source, { language: 'javascript' }).value);
</script>

<div class="source_editor">
    <div class="source">
        {#if editMode}
            <MonacoEditor
                onchange={handleSourceChanged}
                value={source}
                placeholder={"// @name Unnamed\n// @description \n\n// your code here\n"}
            />
        {:else}
            <pre><code class="language-javascript">{@html sourceHighlighted}</code></pre>
        {/if}
    </div>
    <PrimaryButton onclick={() => editMode = !editMode}>
        {#if editMode}Close editor{:else}Edit with Monaco{/if}
    </PrimaryButton>
</div>

<style>
    .source_editor {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    pre {
        background-color: #1e1e1e;
        color: white;
        padding: 1rem;
        border-radius: 1em;
        overflow: auto;
        max-height: 70vh;
        min-height: 5rem;
        font-size: medium;
        margin: 0;
    }
</style>