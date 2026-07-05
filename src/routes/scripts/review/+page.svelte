<script>
    import Script from "$lib/components/Script.svelte";

    /**
     * @typedef {{
     *   script_id: string,
     *   source_url: string,
     *   content_hash: string | null,
     *   status: string,
     *   created_at: string
     * }} ReviewScript
     */

    const { data, form } = $props();
    let reviewScripts = $state(/** @type {ReviewScript[]} */ ([]));

    $effect(() => {
        const scripts = /** @type {ReviewScript[]} */ (data.scripts);
        reviewScripts = scripts.map((script) => ({ ...script }));
    });

    /**
     * @param {SubmitEvent} event
     */
    function confirmDelete(event) {
        if (!confirm('Delete this script?')) event.preventDefault();
    }
</script>

<main>
    <header>
        <h1>Review Scripts</h1>
        <p>{reviewScripts.length} scripts need review.</p>
    </header>

    {#if form?.error}
        <p class="error">{form.error}</p>
    {/if}

    {#if reviewScripts.length === 0}
        <section class="empty box">
            <h2>No scripts to review</h2>
            <p>New submissions and changed accepted scripts will appear here.</p>
        </section>
    {:else}
        <section class="queue">
            {#each reviewScripts as script (script.script_id)}
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

                    <Script bind:source_url={script.source_url} />

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
                        <form method="post" action="?/delete" onsubmit={confirmDelete}>
                            <input type="hidden" name="script_id" value={script.script_id}>
                            <button class="delete" type="submit">Delete</button>
                        </form>
                    </div>
                </article>
            {/each}
        </section>
    {/if}

    <section class="managed">
        <header>
            <h2>Other Scripts</h2>
            <p>{data.otherScripts.length} accepted or rejected scripts, newest first.</p>
        </header>

        {#if data.otherScripts.length === 0}
            <section class="empty box">
                <p>No accepted or rejected scripts yet.</p>
            </section>
        {:else}
            <section class="queue">
                {#each data.otherScripts as script}
                    <article class="box managed-script">
                        <div class="meta">
                            <div>
                                <span class="label">Submitted</span>
                                <time datetime={script.created_at}>{new Date(script.created_at).toLocaleString()}</time>
                            </div>
                            <div>
                                <span class="label">Status</span>
                                <strong>{script.status}</strong>
                            </div>
                            <div>
                                <span class="label">Stored Hash</span>
                                <code>{script.content_hash ?? 'none'}</code>
                            </div>
                        </div>

                        <Script source_url={script.source_url} content_hash={script.content_hash} collapseCode />

                        <form class="edit-form" method="post" action="?/update">
                            <input type="hidden" name="script_id" value={script.script_id}>
                            <label>
                                Source URL
                                <textarea name="source_url">{script.source_url}</textarea>
                            </label>
                            <label>
                                Status
                                <select name="status">
                                    <option value="accepted" selected={script.status === 'accepted'}>accepted</option>
                                    <option value="rejected" selected={script.status === 'rejected'}>rejected</option>
                                    <option value="needs_review" selected={script.status === 'needs_review'}>needs_review</option>
                                </select>
                            </label>
                            <button class="save" type="submit">Save</button>
                        </form>

                        <form method="post" action="?/delete" onsubmit={confirmDelete}>
                            <input type="hidden" name="script_id" value={script.script_id}>
                            <button class="delete" type="submit">Delete</button>
                        </form>
                    </article>
                {/each}
            </section>
        {/if}
    </section>
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
    .queue, .managed {
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
    .delete {
        background: #5b1f1f;
    }
    .save {
        background: #1761a7;
    }
    .edit-form {
        display: grid;
        grid-template-columns: minmax(0, 1fr) minmax(10rem, 14rem) auto;
        gap: 1rem;
        align-items: end;
        padding-top: 1rem;
        border-top: 1px solid #d6d6d6;
    }
    .edit-form label {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-weight: 700;
    }
    textarea, select {
        width: 100%;
        border: 1px solid #c8d0d8;
        border-radius: 0.5rem;
        font: inherit;
        padding: 0.6rem;
    }
    textarea {
        min-height: 5rem;
        resize: vertical;
        font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", "Courier New", monospace;
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
    @media (max-width: 800px) {
        .edit-form {
            grid-template-columns: 1fr;
        }
    }
</style>
