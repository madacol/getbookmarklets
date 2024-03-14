<script>
    import PrimaryButton from '$lib/components/PrimaryButton.svelte'
    import TextArea from '$lib/components/TextArea.svelte'
    import 'highlight.js/styles/stackoverflow-dark.min.css';
    import Script from '../Script.svelte';
    import { toSnakeCase } from '$lib';

    let { form } = $props();

    let source_url = $state('')
    let name = $state('')
    let description = $state('')

    /**
     * @param {string} value
     */
    function sourceUrlInputChanged(value) {
        source_url = value;
        const pathList = decodeURIComponent(source_url).split('/');
        const original_filename = pathList?.pop()?.split('.').shift() || '';

        const filename = (original_filename === "index")
                            ? pathList.pop() || ''
                            : original_filename;

        if (filename) name = toSnakeCase(filename);
    }

</script>

<main>
    <div>
        <p class="error" class:show={form?.error}>{form?.error}</p>

        <form class="box" method="post">
            <TextArea
                onchange={event => sourceUrlInputChanged(event.target.value)}
                onpaste={event => sourceUrlInputChanged(event.clipboardData.getData('text/plain').trim())}
                value={source_url}
                name="source_url"
                required
                placeholder="Source url"
                autofocus
            />

            <PrimaryButton type="submit">Add Script</PrimaryButton>
        </form>
    </div>

    <Script
        {name}
        bind:source_url
        bind:description
    />
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        align-items: start;
        flex-wrap: wrap;
        margin: auto;
        gap: 2rem;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        max-width: 30rem;
    }
    .error {
        color: red;
        height: 2rem;
        margin: 0;
        font-size: 1rem;
        text-align: center;
        display: none;
    }
    .error.show {
        display: block;
    }
</style>
