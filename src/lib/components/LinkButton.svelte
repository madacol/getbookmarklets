<script>
    import PrimaryButtonStyle from "./PrimaryButtonStyle.svelte"

    let { ...props } = $props();
</script>

<a {...props}>
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