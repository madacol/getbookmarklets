<script>
    import Script from "$lib/components/Script.svelte";

    const { data } = $props();
</script>

<main>
    {#each data.scripts as {uploader, source_url}}
        <div class="box">
            <Script {uploader} {source_url} collapseCode={true} />
        </div>
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
    .box {
        max-width: 1000px;
    }
</style>
