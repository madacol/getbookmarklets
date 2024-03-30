<script>
    import PrimaryButtonStyle from "./PrimaryButtonStyle.svelte"

    let { disabled = false, ...props } = $props();
</script>

<a {...props}>
    <PrimaryButtonStyle {disabled}>
        <slot />
    </PrimaryButtonStyle>
</a>

<style>
    a {
        text-decoration: none;
        display: block;
    }
</style>