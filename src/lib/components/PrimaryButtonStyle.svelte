<script>
    import ButtonStyle from "./ButtonStyle.svelte";

    let { ...props } = $props();
</script>

<ButtonStyle
    {...props}
    --background-color="var(--primary-color)"
    --background-hover-color="var(--primary-hover-color)"
    --color="white"
>
    <slot />
</ButtonStyle>
