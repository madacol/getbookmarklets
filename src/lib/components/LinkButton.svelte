<script>
    import PrimaryButton from "./PrimaryButton.svelte"

    let { ...props } = $props();
</script>

<a {...props}>
    <PrimaryButton>
        <slot />
    </PrimaryButton>
</a>

<style>
    a {
        text-decoration: none;
        color: inherit;
        display: block;
    }
    a > :global(*) {
        pointer-events: none;
    }
</style>