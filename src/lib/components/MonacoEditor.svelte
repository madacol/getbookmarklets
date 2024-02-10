<script>
    import { onDestroy, onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    /**
     * source code
     * @type {{value: string}}
     */
    const { value } = $props();

    /**
   * @type {HTMLElement}
   */
    let editorContainer;

    /** 
     * @type {import("monaco-editor").editor.IStandaloneCodeEditor}
     */
    let editor;

    onMount(() => {
        import('monaco-editor').then(monaco => {
            editor = monaco.editor.create(editorContainer, {
                value,
                language: 'javascript',
            });

            editor.onDidChangeModelContent(() => {
                const updatedSource = editor.getValue();
                dispatch('change', updatedSource);
            });
        });
    });

    onDestroy(() => {
        editor.dispose();
    });
</script>

<div bind:this={editorContainer} style="height: 300px;"></div>

<style>
    @import 'monaco-editor/min/vs/editor/editor.main.css';
</style>