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

    const [debuncedOnInputHandler, timeoutId] = debounce(event => sourceUrlInputChanged(event.target.value), 1000);
    $effect(()=>{ if (source_url) validate_url(source_url); })

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
                    <p>URL must link to a RAW Javascript file.</p>
                {:else}
                    <p>Code must be less than 10,000 characters.</p>
                {/if}
                <Details>
                    <summary><h4>How to add metadata</h4></summary>
                    <p>
                        Use userscript-like comments in the first lines of the script.
                        <br>Supported tags:
                    </p>
                    <ul>
                        <li><code>// @name</code> – if not present, defaults to the URL's filename.</li>
                        <li><code>// @description</code></li>
                        <li><code>// @image</code> – URL to an image that will be displayed on this site. You can add multiple images.</li>
                        <li><code>// @video</code> – URL to a video. You can add many.</li>
                    </ul>
                </Details>
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

            <PrimaryButton type="submit">Add Script</PrimaryButton>

            {#if source_url || !isTabUrl}
                <Script
                    bind:source_url
                    editMode={!isTabUrl}
                />
            {/if}
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
    .tabs {
        display: flex;

        label {
            padding: 1rem;
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
    .instructions {
        li {
            line-height: 2;
            code {
                background-color: #c7c7c7;
                padding: 0.2rem 0.5rem;
            }
        }
    }
</style>
