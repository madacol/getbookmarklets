<script>
    import Button from "./Button.svelte"

    let { children, ...props } = $props();
</script>

<Button
    {...props}
    --background-color="var(--primary-color)"
    --background-hover-color="var(--primary-hover-color)"
    --color="white"
>
    {@render children()}
</Button>
