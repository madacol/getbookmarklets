<script>
    import Button from "./Button.svelte"

    /** @type {{ children: import('svelte').Snippet, [x: string]: any }} */
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
