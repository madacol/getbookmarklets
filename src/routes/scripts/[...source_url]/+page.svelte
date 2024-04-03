<script>
    import Script from "$lib/components/Script.svelte";

    let { data } = $props();
</script>

<main>
    <div class="box">
        <Script
            {...data.script}
        />
    </div>
</main>


<style>
    main {
        max-width: 1000px;
        margin: auto;
    }
</style>

