<script>
    import Script from "$lib/components/Script.svelte";

    const { data } = $props();
</script>

<main>
    <div class="box">
        <h1>Welcome!</h1>

        <p>Find, install and share bookmarklets.</p>

        <h2>What are Bookmarklets?</h2>

        <p>They are small JavaScript programs stored as browser bookmarks.</p>

        <p>When you click the bookmark, the code runs on the current web page, allowing you to modify it, automate actions or extract information.</p>

        <h2>Installing Bookmarklets</h2>
        <p>Drag the <strong>"Install bookmarklet"</strong> button to your browser's bookmarks toolbar.</p>
    </div>

    {#each data.scripts as {source_url}}
        <div class="box">
            <Script {source_url} collapseCode={true} />
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
        max-width: 1000px;
    }
    .box {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        * {
            margin: 0;
        }
    }
</style>
