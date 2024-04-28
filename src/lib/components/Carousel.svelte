<script>
    /**
     * @type {{ medias: { key: string, value: string }[] }}
     */
    let { medias } = $props();

    let expanded = $state(false);
    /**
     * @type {HTMLElement | null}
     */
    let expandedElement = $state(null);

    $effect(() => {
        if (expandedElement) {
            expandedElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            expandedElement = null
        }
    })
</script>

<div class="carousel" class:expanded aria-expanded={expanded}
    onclick={(e) => {
        expanded = !expanded
        if (expanded) expandedElement = e.target
    }}
    onkeydown={(e) => {
        if (e.key === 'Escape') expanded = false
        else if (e.key === 'Enter') expanded = !expanded
    }}
    role="button"
    tabindex="0"
>
    {#each medias as {key, value}}
        {#if key === 'image'}
            <img src={value} loading="lazy" />
        {:else if key === 'video'}
            <video src={value} controls preload="metadata"></video>
        {/if}
    {/each}
</div>

<style>
    .carousel {
        display: flex;
        gap: 1rem;
        max-width: 100%;
        overflow: auto;
        height: 15rem;
        cursor: pointer;
        z-index: 1;

        &:hover:not(.expanded) {
            opacity: 0.9;
        }
        &.expanded {
            position: fixed;
            height: 100vh;
            top: 0;
            left: 0;
            padding: 5vh;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.7);
        }
        img, video {
            height: 100%;
            object-fit: contain;
        }
    }
</style>

