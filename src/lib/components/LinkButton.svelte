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
    a > :global(*) {
        pointer-events: none;
    }
</style>