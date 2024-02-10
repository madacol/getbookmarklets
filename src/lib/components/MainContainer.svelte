<script>
    import BackButton from "./BackButton.svelte"

    export let back_button = false
</script>

<main>
    {#if back_button}
        <div class="header">
            <BackButton />
        </div>
    {/if}

    <div class="content">
        <slot/>
    </div>

</main>


<style>
    .header {
        margin: 0.5rem auto 0 0.5rem;
    }
    main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: stretch;
        max-width: 40rem;
        margin: auto;
        background-color: white;
        border-radius: 2rem;
        box-shadow: 0 0.5rem 1.5rem 0 rgba(6, 81, 126, 0.18);
    }
    .content {
        padding: 0 2rem 2rem 2rem;
    }
</style>