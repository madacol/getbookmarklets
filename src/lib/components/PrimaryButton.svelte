<script>
    import Button from "./Button.svelte"

    let { ...props } = $props();
</script>

<Button
    {...props}
    --background-color="var(--primary-color)"
    --background-hover-color="var(--primary-hover-color)"
    --color="white"
>
    <slot />
</Button>
