<script>
    import { pushState, replaceState } from "$app/navigation";
    import { page } from "$app/stores";

    /**
     * @type {{ medias: { key: string, value: string }[] }}
     */
    let { medias } = $props();

    /**
     * @type {HTMLElement | null}
     */
    let expandedElement = $state(null);
    replaceState('', { expanded: false });

    $effect(() => {
        if ($page.state?.expanded) {
            expandedElement?.scrollIntoView({inline: 'center', block: 'center'})
        }
    })

    function toggleExpanded(e) {
        if ($page.state?.expanded) {
            expandedElement = null
            history.back();
        } else {
            expandedElement = e.target;
            pushState('', { expanded: true });
        }
    }
</script>

<div class="carousel" class:expanded={$page.state?.expanded} aria-expanded={$page.state?.expanded}
    onclick={toggleExpanded}
    onkeydown={(e) => {
        if (e.key === 'Escape' && $page.state?.expanded) toggleExpanded(e);
        else if (e.key === 'Enter') toggleExpanded(e)
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
        padding: 1rem 0;
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
            padding: 5vh 0;
            gap: 5vh;
            box-sizing: border-box;
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
