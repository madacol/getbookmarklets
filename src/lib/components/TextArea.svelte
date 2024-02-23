<script>
    let { value = '', ...props } = $props();
</script>

<textarea
    bind:value
    {...props}
/>

<style>
    textarea {
        font-size: 1em;
        border-radius: 2rem;
        padding: 2rem;
        min-width: 30rem;
        min-height: 10rem;
        border: 1px solid #e5e5e5;
        box-shadow: 0 0.3rem 0.9rem 0 rgba(6, 81, 126, 0.18);
    }
</style>
