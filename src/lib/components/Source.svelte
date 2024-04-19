<script>
    import hljs from "highlight.js";
    import MonacoEditor from "./MonacoEditor.svelte";
    import PrimaryButton from "./PrimaryButton.svelte";
    import javascript from "highlight.js/lib/languages/javascript";
    import 'highlight.js/styles/stackoverflow-dark.min.css';

    /**
    * @type {{ source: string, handleSourceChanged: (newSource: string) => void, editMode?: boolean, logCopy?: () => void }}
     */
    let { source, handleSourceChanged, editMode = $bindable(false), logCopy = ()=>{} } = $props();

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
            <button type="button" onclick={event => {
                const button = event.currentTarget;
                navigator.clipboard.writeText(source)
                    .then(() => {
                        const defaultText = button.textContent;
                        button.textContent = 'Copied!'
                        setTimeout(() => button.textContent = defaultText, 1000);
                    })
                    .catch(() => button.textContent = 'Failed to copy!');

                logCopy();
            }}
            >Copy code</button>
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
    .source {
        position: relative;

        button {
            display: none;
            font-size: medium;
            color: white;
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            padding: 0.5rem;
            border: 2px dashed white;
            border-radius: 0.5rem;
            background-color: #1e1e1eb0;
            box-sizing: border-box;
            text-align: center;
            cursor: pointer;
        }
        &:hover:has(code:not(:hover)) button {
            display: block;
        }
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