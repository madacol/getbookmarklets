<script>
    import SecondaryButton from "./SecondaryButton.svelte"

    let { ...props } = $props();
</script>

<a {...props}>
    <SecondaryButton>
        <slot />
    </SecondaryButton>
</a>