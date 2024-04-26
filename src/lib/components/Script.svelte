<script>
    import Install_Buttons from './Install_Buttons.svelte';
    import Source from './Source.svelte';
    import { getScriptMetadata } from "$lib";
    import { untrack } from "svelte";

    /**
     * @type {{ uploader?: string, source_url?: string, collapseCode?: boolean, editMode?: boolean }}
     */
    let { uploader = '', source_url = $bindable(''), collapseCode = false, editMode = $bindable(false) } = $props();

    let source = $state('')

    let isDataURL = $derived(source_url.startsWith('data:'));

    let showCode = $state(!collapseCode);
    let showMedia = $state(!collapseCode)

    $effect(() => { showCode && fetch(`/logs/code/${encodeURIComponent(untrack(()=>source_url))}`, { method: 'POST' }) });
    $effect(() => { showMedia && fetch(`/logs/media/${encodeURIComponent(untrack(()=>source_url))}`, { method: 'POST' }) });

    $effect(() => {
        if (!source_url || (isDataURL && source)) return;

        (async () => {
            const responseBody = await (await fetch(source_url)).text();
            // remove "javascript:" prefix if present
            source = responseBody.trim().replace(/^javascript:/, '');
            editMode = false;
        })()
    })

    let { name, description, medias } = $derived(getScriptMetadata(source, untrack(()=>source_url)))

    /**
     * @param {string} newSource
     */
    function handleSourceChanged(newSource) {
        source = newSource;
        source_url = `data:text/javascript,${encodeURIComponent(source)}`;
    }
</script>

<article>

    <div class="title_row">
        <div class="title"><h1 title={name}>{name}</h1></div>
        <Install_Buttons {source} {source_url} />
    </div>


    {#if description}<p>{description}</p>{/if}

    {#if source_url}<div class="source_url"><span>Source URL:</span> <a href={source_url}>{decodeURIComponent(source_url)}</a></div>{/if}

    {#if medias.length > 0}
        {#if showMedia}
            <div class="carousel">
                {#each medias as {key, value}}
                    {#if key === 'image'}
                        <img src={value} alt={name} loading="lazy" />
                    {:else if key === 'video'}
                        <video src={value} controls preload="metadata"></video>
                    {/if}
                {/each}
            </div>
        {:else}
            <details bind:open={showMedia} >
                <summary>Load Media</summary>
            </details>
        {/if}
    {/if}

    <details bind:open={showCode} >
        <summary class="source" class:hidden={!collapseCode}>Source code</summary>
        <Source
            {source}
            {handleSourceChanged}
            {editMode}
            logCopy={()=>fetch(`/logs/copy/${encodeURIComponent(source_url)}`, { method: 'POST' })}
        />
    </details>
</article>

<style>
    article {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    h1, p {
        margin: 0;
    }
    .title_row {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        align-self: stretch;
        overflow: hidden;
        flex-wrap: wrap;

        .title {
            display: flex;
            flex-grow: 1;
            text-overflow: ellipsis;
            overflow: hidden;
            flex-basis: 15rem;

            h1 {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }
    .source_url {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        span {
            font-weight: bold;
        }
    }
    .carousel {
        display: flex;
        gap: 1rem;
        max-width: 100%;
        overflow: auto;
        height: 15rem;

        img, video {
            height: 100%;
        }
    }
    details {
        font-size: larger;

        & > summary {
            cursor: pointer;
            display: inline list-item;

            &:hover {
                opacity: 0.7;
            }
            &.source::before {
                content: "View ";
            }
            &.hidden {
                display: none;
            }
            &:not(.hidden) + :global(*){
                margin-top: 1rem;
            }
        }

        &[open] > summary.source::before {
            content: "Hide ";
        }
    }
</style>
