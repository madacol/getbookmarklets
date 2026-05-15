<script>
    import Script from "$lib/components/Script.svelte";

    const { data, form } = $props();
</script>

<main>
    <header>
        <h1>Review Scripts</h1>
        <p>{data.scripts.length} scripts need review.</p>
    </header>

    {#if form?.error}
        <p class="error">{form.error}</p>
    {/if}

    {#if data.scripts.length === 0}
        <section class="empty box">
            <h2>No scripts to review</h2>
            <p>New submissions and changed accepted scripts will appear here.</p>
        </section>
    {:else}
        <section class="queue">
            {#each data.scripts as script}
                <article class="box">
                    <div class="meta">
                        <div>
                            <span class="label">Submitted</span>
                            <time datetime={script.created_at}>{new Date(script.created_at).toLocaleString()}</time>
                        </div>
                        <div>
                            <span class="label">Stored Hash</span>
                            <code>{script.content_hash ?? 'none'}</code>
                        </div>
                    </div>

                    <Script source_url={script.source_url} />

                    <div class="actions">
                        <form method="post" action="?/accept">
                            <input type="hidden" name="script_id" value={script.script_id}>
                            <input type="hidden" name="source_url" value={script.source_url}>
                            <button class="accept" type="submit">Accept</button>
                        </form>
                        <form method="post" action="?/reject">
                            <input type="hidden" name="script_id" value={script.script_id}>
                            <button class="reject" type="submit">Reject</button>
                        </form>
                    </div>
                </article>
            {/each}
        </section>
    {/if}
</main>

<style>
    main {
        max-width: 1000px;
        margin: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    header {
        color: white;
    }
    h1, h2, p {
        margin: 0;
    }
    .queue {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    article {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
        gap: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #d6d6d6;
    }
    .label {
        display: block;
        color: #555;
        font-size: 0.9rem;
        margin-bottom: 0.25rem;
    }
    code {
        overflow-wrap: anywhere;
    }
    .actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        padding-top: 1rem;
        border-top: 1px solid #d6d6d6;
    }
    button {
        border: 0;
        border-radius: 0.5rem;
        padding: 0.8rem 1.2rem;
        color: white;
        font-size: 1rem;
        cursor: pointer;
    }
    button:hover {
        opacity: 0.85;
    }
    .accept {
        background: #147d3f;
    }
    .reject {
        background: #a32424;
    }
    .empty {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .error {
        background-color: rgb(255, 193, 193);
        color: rgb(201, 0, 0);
        padding: 1rem;
    }
</style>
