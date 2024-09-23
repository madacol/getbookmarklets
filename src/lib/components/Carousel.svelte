<script>
    /**
     * @type {{ medias: { key: string, value: string }[] }}
     */
    let { medias } = $props();

    let isExpanded = $state(false);

    /** @type {HTMLElement | null} */
    let expandedElement = $state(null);

    $effect(() => {
        const element = expandedElement;
        if (element) {
            setTimeout(() => {
                element?.scrollIntoView({inline: 'center', block: 'center'})
            });
        }
    })

    /** @param {MouseEvent} event */
    function toggleExpanded(event) {
        isExpanded = !isExpanded;
        expandedElement = event.target instanceof HTMLElement ? event.target : null;
    }
</script>

<div class="carousel"
    onclick={toggleExpanded}
    onkeydown={(e) => {
        if (e.key === 'Escape' && isExpanded) toggleExpanded(e);
        else if (e.key === 'Enter') toggleExpanded(e);
    }}
    role="button"
    tabindex="0"
>
    <div class="carousel-popover" aria-expanded={isExpanded} popover={isExpanded ? "manual" : null}>
        {#each medias as {key, value}}
            {#if key === 'image'}
                <img src={value} loading="lazy" />
            {:else if key === 'video'}
                <video src={value} controls preload="metadata"></video>
            {/if}
        {/each}
    </div>
</div>

<style>
    .carousel {
        height: 15rem;

        .carousel-popover {
            display: flex;
            gap: 1rem;
            padding: 1rem 0;
            max-width: 100%;
            height: 100%;
            box-sizing: border-box;
            overflow: auto;
            cursor: pointer;
            z-index: 1;
        }

        .carousel-popover[aria-expanded="true"] {
            height: 100vh;
            padding: 5vh 0;
            gap: 5vh;
            background: rgba(0, 0, 0, 0.7);
        }

        img, video {
            height: 100%;
            max-width: 100vw;
            max-height: 100vh;
            object-fit: contain;
        }
    }

</style>
