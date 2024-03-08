<script>
    import Script from "../Script.svelte";

    let { data } = $props();
</script>

<main>
    <Script
        {...data.script}
    />
</main>


<style>
    main {
        max-width: 70vw;
        margin: auto;
    }
</style>

