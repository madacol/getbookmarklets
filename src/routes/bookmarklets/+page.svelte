<script>
    import Script from './Script.svelte';

    const { data } = $props();

</script>

<main>

    {#each data.scripts as script}
        <Script
            script_id={script.script_id}
            name={script.name}
            source={script.source}
        />
    {/each}

</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        max-width: 700px;
        margin: auto;
    }
</style>
