<script>
    import PrimaryButtonStyle from "./PrimaryButtonStyle.svelte"

    let { ...props } = $props();
    /**
     * @type {HTMLAnchorElement | undefined}
     */
    let anchor;
</script>

<a {...props} bind:this={anchor}>
    <PrimaryButtonStyle>
        <slot />
    </PrimaryButtonStyle>
</a>

<style>
    a {
        text-decoration: none;
        display: block;
    }
</style>