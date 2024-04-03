<script>
    import 'monaco-editor/min/vs/editor/editor.main.css';
    import { onMount } from 'svelte';

    /**
     * source code
     * @type {{value: string, onchange?: (changedSource: string)=>void, placeholder?: string, [x: string]: any}}
     */
    let { value: _value, onchange=()=>{}, placeholder = '', ...props } = $props();

    let value = $derived(_value || placeholder);

    /**
   * @type {HTMLElement}
   */
    let editorContainer;
    onMount(() => {
        /**
         * @type {import("monaco-editor").editor.IStandaloneCodeEditor}
         */
        let editor;

        import('monaco-editor').then(monaco => {
            if (!editorContainer) return;

            editor = monaco.editor.create(editorContainer, {
                value,
                language: 'javascript',
                theme: 'vs-dark',
                scrollBeyondLastLine: false,
            });

            editor.onDidChangeModelContent(() => onchange(editor.getValue()));
        });

        $effect(() => editor?.setValue(value));

        return () => {
            editor?.dispose();
        }
    });
</script>

<div bind:this={editorContainer} {...props}></div>

<style>
    div {
        height: 70vh;
        border-radius: 1rem;
        overflow: hidden;
    }
</style>