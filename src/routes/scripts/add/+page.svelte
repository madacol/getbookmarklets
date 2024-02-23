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

    $effect(() => {
        const pathTree = source_url.split('/');
        const original_filename = pathTree?.pop()?.split('.').shift() || '';

        const filename = (original_filename === "index")
                ? pathTree.pop() || ''
                : original_filename;

        name = toSnakeCase(filename);
    })

</script>

<main>
    <form class="box" method="post">
        <Input
            onblur={event => source_url = decodeURIComponent(event.target.value)}
            onpaste={event => source_url = decodeURIComponent(event.clipboardData.getData('text/plain'))}
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

    {#if source_url}
        <Script
            {name}
            {source_url}
            bind:description
        />
    {/if}
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        margin: auto;
        gap: 2rem;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        max-width: 50rem;
    }
</style>
