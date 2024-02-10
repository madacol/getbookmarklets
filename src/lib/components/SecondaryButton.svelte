<script>
    import Button from "./Button.svelte"

    let { ...props } = $props();
</script>

<Button
    {...props}
    --background-color="var(--secondary-color)"
    --background-hover-color="var(--secondary-hover-color)"
    --color="#05517E"
>
    <slot />
</Button>
