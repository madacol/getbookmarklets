<script>
    import PrimaryButton from '$lib/components/PrimaryButton.svelte';
    import TextArea from '$lib/components/TextArea.svelte';
    import Script from '$lib/components/Script.svelte';
    import { debounce, isURLInvalid } from '$lib';
    import { onDestroy } from 'svelte';
    import Details from '$lib/components/Details.svelte';

    let { form } = $props();
    $effect(() => {
        const timeoutId = setTimeout(() => {
            form = null;
        }, 5000);
        return () => clearTimeout(timeoutId);
    });

    let error_message = $state('');

    let source_url = $state('');
    let selected_tab = $state('url');

    let isTabUrl = $derived(selected_tab === 'url');

    /**
     * @param {string} value
     */
    async function sourceUrlInputChanged(value) {
        if (
            await validate_url(value)
            || value === ''
        ) {
            source_url = value;
        }
    }

    /**
     * @param {string} url
     */
    async function validate_url(url) {
        const error = await isURLInvalid(url, fetch, false)
        if (error) {
            error_message = error
            return false;
        } else {
            error_message = '';
            return true;
        }
    }

    /**
     * @param {InputEvent} event
     */
    function handleSourceUrlInput(event) {
        if (event.target instanceof HTMLTextAreaElement) {
            sourceUrlInputChanged(event.target.value);
        }
    }

    /**
     * @param {ClipboardEvent} event
     */
    function handleSourceUrlPaste(event) {
        sourceUrlInputChanged(event.clipboardData?.getData('text/plain').trim() ?? '');
    }

    const [debuncedOnInputHandler, timeoutId] = debounce(handleSourceUrlInput, 1000);
    $effect(()=>{ if (source_url) validate_url(source_url); })

    onDestroy(() => clearTimeout(timeoutId.value));

</script>

<main>
    <div class="container">
        <div class="page-header">
            <h1>Add a Script</h1>
            <p>Submit a bookmarklet or userscript to share with the community.</p>
        </div>

        {#if form?.error}
            <div class="alert alert-error" role="alert">
                <strong>Server error:</strong> {form.error}
            </div>
        {/if}
        {#if error_message}
            <div class="alert alert-error" role="alert">{error_message}</div>
        {/if}

        <div class="tabs">
            <label class="tab-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                From URL
                <input type="radio" value="url" bind:group={selected_tab} name="tab">
            </label>
            <label class="tab-label">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
                From Code
                <input type="radio" value="code" bind:group={selected_tab} name="tab">
            </label>
        </div>
        <form class="box" method="post">
            <div class="review-notice">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p>Submitted scripts require manual review before appearing publicly. The generated bookmarklet URL works immediately without saving.</p>
            </div>

            <div class="instructions">
                {#if isTabUrl}
                    <p class="instruction-hint">Paste the URL of a <strong>raw JavaScript file</strong> (e.g. a GitHub raw link).</p>
                {:else}
                    <p class="instruction-hint">Paste or type your JavaScript code directly. <strong>Max 10,000 characters.</strong></p>
                {/if}
                <Details>
                    <summary><span class="metadata-toggle">How to add metadata ↓</span></summary>
                    <div class="metadata-info">
                        <p>Use userscript-like comments at the top of your script:</p>
                        <ul>
                            <li><code>// @name</code> – display name (defaults to filename)</li>
                            <li><code>// @description</code> – short description</li>
                            <li><code>// @image</code> – preview image URL (repeatable)</li>
                            <li><code>// @video</code> – demo video URL (repeatable)</li>
                        </ul>
                    </div>
                </Details>
            </div>

            <div class="textarea" class:hidden={!isTabUrl}>
                <TextArea
                    onpaste={handleSourceUrlPaste}
                    oninput={debuncedOnInputHandler}
                    value={source_url}
                    name="source_url"
                    required
                    placeholder="https://raw.githubusercontent.com/user/repo/main/script.js"
                    autofocus
                />
            </div>

            <PrimaryButton type="submit">Add Script</PrimaryButton>

            {#if source_url || !isTabUrl}
                <div class="preview-section">
                    <p class="preview-label">Preview</p>
                    <Script
                        bind:source_url
                        editMode={!isTabUrl}
                    />
                </div>
            {/if}
        </form>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: auto;
        max-width: 1000px;
    }
    .container {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .page-header {
        color: white;
        margin-bottom: 1.5rem;
    }
    .page-header h1 {
        margin: 0 0 0.25rem;
        font-size: 1.8rem;
    }
    .page-header p {
        margin: 0;
        opacity: 0.8;
        font-size: 1rem;
    }

    /* ---- Alerts ---- */
    .alert {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 0.7rem 1rem;
        border-radius: var(--radius-sm);
        font-size: 0.92rem;
        margin-bottom: 0.75rem;
    }
    .alert-error {
        background: #fff1f1;
        color: #b91c1c;
        border: 1px solid #fecaca;
    }

    /* ---- Tabs ---- */
    .tabs {
        display: flex;
        gap: 0;
    }

    .tab-label {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.7rem 1.3rem;
        font-size: 0.95rem;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.25);
        border-bottom: none;
        border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        background: rgba(255,255,255,0.6);
        color: #374151;
        opacity: 0.75;
        transition: background 0.15s, opacity 0.15s;
        margin-right: 0.25rem;
        user-select: none;

        input {
            display: none;
        }
        &:hover {
            opacity: 0.9;
            background: rgba(255,255,255,0.8);
        }
        &:has(input:checked) {
            opacity: 1;
            background: white;
            color: var(--primary-color);
            font-weight: 600;
            cursor: default;
            border-color: var(--border-color);
        }
    }

    /* ---- Form ---- */
    form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 1.5rem;
        width: 100%;
        border-radius: 0 var(--radius-lg) var(--radius-lg) var(--radius-lg);
    }

    /* ---- Review notice ---- */
    .review-notice {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        margin: 0;
        padding: 0.85rem 1rem;
        background: #eef6ff;
        border: 1px solid #b9d8f2;
        border-radius: var(--radius-sm);
        color: #173c5a;
        font-size: 0.92rem;
        line-height: 1.5;

        svg {
            flex-shrink: 0;
            margin-top: 0.15rem;
            color: var(--primary-color);
        }

        p {
            margin: 0;
        }
    }

    /* ---- Instructions ---- */
    .instructions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .instruction-hint {
        margin: 0;
        color: #374151;
        font-size: 0.95rem;
    }

    .metadata-toggle {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--primary-color);
    }

    .metadata-info {
        margin-top: 0.5rem;
        padding: 0.75rem 1rem;
        background: #f8fafc;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-color);
        font-size: 0.9rem;

        p { margin: 0 0 0.4rem; }

        ul {
            margin: 0;
            padding-left: 1.25rem;
            display: flex;
            flex-direction: column;
            gap: 0.3rem;
        }

        code {
            background: #e2e8f0;
            color: #1a3a5c;
            padding: 0.1rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.88em;
        }
    }

    /* ---- Textarea ---- */
    .textarea {
        display: contents;
        &.hidden {
            display: none;
        }
    }

    /* ---- Preview ---- */
    .preview-section {
        border-top: 1px solid var(--border-color);
        padding-top: 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    .preview-label {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-muted);
    }
</style>
