<script>
    import { minimalSetup } from 'codemirror';
    import { EditorView } from '@codemirror/view';
    import { oneDark } from '@codemirror/theme-one-dark';
    import { placeholder as editorPlaceholder } from '@codemirror/view';
    import { Compartment } from '@codemirror/state';
    import { onMount } from 'svelte';

    /**
     * source code
     * @type {{value: string, onchange?: (changedSource: string)=>void, placeholder?: string, [x: string]: any}}
     */
    let { value: _value, onchange=()=>{}, placeholder = '', ...props } = $props();

    let value = $derived(_value || '');

    /**
     * @type {HTMLDivElement}
     */
    let editorContainer;

    /**
     * @type {EditorView | null}
     */
    let editor = null;
    const languageCompartment = new Compartment();
    let languageLoaded = false;
    let languageLoading = false;

    /**
     * @param {string} nextValue
     */
    function setEditorValue(nextValue) {
        if (!editor || editor.state.doc.toString() === nextValue) return;

        editor.dispatch({
            changes: {
                from: 0,
                to: editor.state.doc.length,
                insert: nextValue
            }
        });
    }

    async function loadJavaScriptSupport() {
        if (!editor || languageLoaded || languageLoading) return;

        languageLoading = true;
        try {
            const { javascript } = await import('@codemirror/lang-javascript');
            editor?.dispatch({
                effects: languageCompartment.reconfigure(javascript().extension)
            });
            languageLoaded = true;
        } finally {
            languageLoading = false;
        }
    }

    onMount(() => {
        editor = new EditorView({
            doc: value,
            parent: editorContainer,
            extensions: [
                minimalSetup,
                oneDark,
                languageCompartment.of([]),
                placeholder ? editorPlaceholder(placeholder) : [],
                EditorView.lineWrapping,
                EditorView.domEventHandlers({
                    focus: () => {
                        void loadJavaScriptSupport();
                        return false;
                    },
                    beforeinput: () => {
                        void loadJavaScriptSupport();
                        return false;
                    }
                }),
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) onchange(update.state.doc.toString());
                }),
            ],
        });

        void loadJavaScriptSupport();

        return () => {
            editor?.destroy();
            editor = null;
        }
    });

    $effect(() => setEditorValue(value));
</script>

<div bind:this={editorContainer} {...props}></div>

<style>
    div {
        height: 70vh;
        border-radius: 1rem;
        overflow: hidden;
    }

    div :global(.cm-editor) {
        height: 100%;
        font-size: 0.95rem;
    }

    div :global(.cm-scroller) {
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
    }
</style>
