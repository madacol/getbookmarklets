<script>
    import PrimaryButton from '$lib/components/PrimaryButton.svelte';
    import TextArea from '$lib/components/TextArea.svelte';
    import 'highlight.js/styles/stackoverflow-dark.min.css';
    import Script from '$lib/components/Script.svelte';
    import { debounce, isURLInvalid } from '$lib';
    import { onDestroy } from 'svelte';

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
        const error = await isURLInvalid(value, fetch, false)
        if (error) {
            error_message = error
            return;
        } else {
            error_message = '';
        }
        source_url = value;
    }

    const [debuncedOnInputHandler, timeoutId] = debounce(event => sourceUrlInputChanged(event.target.value), 500);

    onDestroy(() => clearTimeout(timeoutId.value));

</script>

<main>
    <div class="container">
        <p class="server error" class:show={form?.error}>server: {form?.error}</p>
        <p class="error" class:show={error_message}>{error_message}</p>

        <div class="tabs">
            <label>From Url<input type="radio" value="url" bind:group={selected_tab} name="tab"></label>
            <label>From Code<input type="radio" value="code" bind:group={selected_tab} name="tab"></label>
        </div>
        <form class="box" method="post">
            <div class="instructions">
                {#if isTabUrl}
                    <p>URL must link to a RAW file.</p>
                {:else}
                    <p>Code must be less than 10,000 characters.</p>
                {/if}
            </div>
            <div class="textarea" class:hidden={!isTabUrl}>
                <TextArea
                    onpaste={event => sourceUrlInputChanged(event.clipboardData.getData('text/plain').trim())}
                    oninput={debuncedOnInputHandler}
                    value={source_url}
                    name="source_url"
                    required
                    placeholder="Source url"
                    autofocus
                />
            </div>

            {#if source_url || !isTabUrl}
                <Script
                    bind:source_url
                    editMode={!isTabUrl}
                />
            {/if}

            <div class="add-button">
                <PrimaryButton type="submit">Add Script</PrimaryButton>
            </div>
        </form>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-wrap: wrap;
        margin: auto;
        gap: 2rem;
        max-width: 1000px;
    }
    .container {
        box-sizing: border-box;
        width: 100%;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        width: 100%;
        box-sizing: border-box;
        border-radius: 0 1rem 1rem 1rem ;
    }
    .error {
        color: rgb(201, 0, 0);
        background-color: rgb(255, 193, 193);
        padding: 0.5rem;
        height: 2rem;
        font-size: large;
        text-align: center;
        visibility: hidden;

        &.show {
            visibility: visible;
        }

        &.server {
            display: none;
            &.show {
                display: block;
            }
        }
    }
    .add-button {
        background-color: white;
        padding: 1rem 0;
        margin: -1rem 0;
    }
    .tabs {
        display: flex;

        label {
            padding: 1.5rem;
            font-size: large;
            cursor: pointer;
            border: 1px solid #e5e5e5;
            border-left: 0;
            border-radius: 1rem 1rem 0 0;
            background-color: white;
            opacity: 0.7;

            input {
                display: none;
            }
            &:hover {
                opacity: 0.9;
            }
            &:has(input:checked) {
                opacity: 1;
                border-bottom: 0;
                cursor: auto;
            }
        }
    }
    .textarea {
        display: contents;
        &.hidden {
            display: none;
        }
    }
</style>
