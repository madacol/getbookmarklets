<script>
    import 'monaco-editor/min/vs/editor/editor.main.css';

    /**
     * source code
     * @type {{value: string, onchange: (changedSource: string)=>void, [x: string]: any}}
     */
    let { value, onchange=()=>{}, ...props } = $props();

    /**
   * @type {HTMLElement}
   */
    let editorContainer;

    $effect(() => {
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

            editor.onDidChangeModelContent(() => {
                const updatedSource = editor.getValue();
                onchange(updatedSource);
            });
        });

        return () => {
            editor.dispose();
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