<script>
    import 'monaco-editor/min/vs/editor/editor.main.css';
    import { onMount } from 'svelte';

    /**
     * source code
     * @type {{value: string, onchange: (changedSource: string)=>void, [x: string]: any}}
     */
    let { value, onchange=()=>{}, ...props } = $props();

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
            editor = monaco.editor.create(editorContainer, {
                value,
                language: 'javascript',
                theme: 'vs-dark',
            });

            editor.onDidChangeModelContent(() => onchange(editor.getValue()));
        });

        $effect(() => {
            if (editor) {
                editor.setValue(value);
            }
        });

        return () => {
            editor?.dispose();
        }
    });
</script>

<div bind:this={editorContainer} {...props}></div>

<style>
    div {
        height: 90vh;
        border-radius: 1rem;
        overflow: hidden;
    }
</style>