<script>
    import Script from "$lib/components/Script.svelte";

    const { data } = $props();
</script>

<main>
    {#each data.scripts as {uploader, source_url}}
        <Script {uploader} {source_url} showCode={false} />
    {/each}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        max-width: fit-content;
        margin: auto;
    }
</style>
