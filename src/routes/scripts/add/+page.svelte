<script>
    import Input from '$lib/components/Input.svelte'
    import PrimaryButton from '$lib/components/PrimaryButton.svelte'
    import TextArea from '$lib/components/TextArea.svelte'
    import 'highlight.js/styles/stackoverflow-dark.min.css';
    import Script from '../Script.svelte';
    import { toSnakeCase } from '$lib';

    let source_url = $state('')
    let name = $state('')
    let description = $state('')

    /**
     * @param {string} value
     */
    function sourceUrlInputChanged(value) {
        source_url = decodeURIComponent(value);
        const pathList = source_url.split('/');
        const original_filename = pathList?.pop()?.split('.').shift() || '';

        const filename = (original_filename === "index")
                            ? pathList.pop() || ''
                            : original_filename;

        if (filename) name = toSnakeCase(filename);
    }

</script>

<main>
    <form class="box" method="post">
        <Input
            onchange={event => sourceUrlInputChanged(event.target.value)}
            onpaste={event => sourceUrlInputChanged(event.clipboardData.getData('text/plain').trim())}
            value={source_url}
            name="source_url"
            type="text"
            required
            placeholder="Source url"
            autofocus
        />
        <Input
            bind:value={name}
            name="name"
            type="text"
            required
            placeholder="Script name"
        />
        <TextArea
            bind:value={description}
            name="description"
            placeholder="Description"
        />

        <PrimaryButton type="submit">Add Script</PrimaryButton>
    </form>

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
</style>
