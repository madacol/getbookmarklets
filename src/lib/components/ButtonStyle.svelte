<script>
    let { ...props } = $props();
</script>

<div {...props}>
    <slot />
</div>

<style>
    div {
        background-color: var(--background-color);
        padding: 1.2rem;
        border: 0;
        cursor: pointer;
        color: var(--color);
        text-align: center;
        font-size: 1rem;
        font-weight: bold;
        border-radius: .4rem;
        box-shadow: 0 0.3rem 0.9rem 0 rgba(6, 81, 126, 0.18);
    }
    div:not([disabled="true"]):hover {
        background-color: var(--background-hover-color);
    }
    div[disabled="true"] {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
