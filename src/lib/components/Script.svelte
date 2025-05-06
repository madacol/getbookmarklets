<script>
    import Carousel from './Carousel.svelte';
    import Install_Buttons from './Install_Buttons.svelte';
    import Source from './Source.svelte';
    import { getScriptMetadata } from "$lib";
    import { untrack } from "svelte";
    import Details from './Details.svelte';

    /**
     * @type {{ source_url?: string, collapseCode?: boolean, editMode?: boolean }}
     */
    let { source_url = $bindable(''), collapseCode = false, editMode = $bindable(false) } = $props();

    let source = $state('')

    let isDataURL = $derived(source_url.startsWith('data:'));

    let showCode = $state(!collapseCode);
    let showMedia = $state(!collapseCode);

    if (collapseCode) {
        $effect(() => { showCode && navigator.sendBeacon(`/signal/code/${encodeURIComponent(untrack(()=>source_url))}`) });
        $effect(() => { showMedia && navigator.sendBeacon(`/signal/media/${encodeURIComponent(untrack(()=>source_url))}`) });
    } else {
        navigator.sendBeacon(`/signal/open/${encodeURIComponent(source_url)}`);
    }

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
        <div class="title"><a href={`/scripts#${source_url}`} title={name} data-sveltekit-preload-data="tap"><h1>{name}</h1></a></div>
        <Install_Buttons {source} {source_url} />
    </div>


    {#if description}<p>{description}</p>{/if}

    {#if source_url}<div class="source_url"><span>Source URL:</span> <a href={source_url} rel="nofollow">{decodeURIComponent(source_url)}</a></div>{/if}

    {#if medias.length > 0}
        {#if showMedia}
            <Carousel {medias} />
        {:else}
            <Details class="script-details" bind:open={showMedia}>
                <summary>Show Media</summary>
            </Details>
        {/if}
    {/if}

    <Details class="script-details" bind:open={showCode}>
        <summary class="source" class:hidden={!collapseCode}>Source code</summary>
        <Source
            {source}
            {handleSourceChanged}
            {editMode}
            oncopy={()=>navigator.sendBeacon(`/signal/copy/${encodeURIComponent(source_url)}`)}
        />
    </Details>
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

            a {
                text-decoration: none;

                &:hover {
                    opacity: 0.7;
                }
            }

            * {
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
    :global {
        .script-details {
            font-size: larger;

            & > summary {
                &.source::before {
                    content: "View ";
                }
                &.hidden {
                    display: none;
                }
                &:not(.hidden) + * {
                    margin-top: 1rem;
                }
            }

            &[open] > summary.source::before {
                content: "Hide ";
            }
        }
    }
</style>
