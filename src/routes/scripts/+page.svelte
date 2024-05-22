<script>
    import Script from "$lib/components/Script.svelte";
    import { onMount } from "svelte";

    let source_url = $state('');

    onMount(() => {
        source_url = document.location.hash.slice(1);
    });
</script>

<main>
    {#if source_url}
        <div class="box">
            <Script source_url={source_url}/>
        </div>
    {/if}
</main>


<style>
    main {
        max-width: 1000px;
        margin: auto;
    }
</style>

