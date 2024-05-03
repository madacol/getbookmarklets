<script>
    import PrimaryButtonStyle from "./PrimaryButtonStyle.svelte"

    let { disabled = false, children, ...props } = $props();
</script>

<a {...props}>
    <PrimaryButtonStyle {disabled}>
        {@render children()}
    </PrimaryButtonStyle>
</a>

<style>
    a {
        text-decoration: none;
        display: block;
    }
</style>