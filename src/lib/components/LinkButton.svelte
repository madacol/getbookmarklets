<script>
    import PrimaryButtonStyle from "./PrimaryButtonStyle.svelte"

    /** @type {{ disabled?: boolean, children: import('svelte').Snippet, [x: string]: any }} */
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
