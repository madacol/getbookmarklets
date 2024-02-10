<script>
    let { value = '', ...props } = $props();
</script>

<textarea
    bind:value
    {...props}
/>

<style>
    textarea {
        font-size: 0.8em;
        border-radius: 2rem;
        padding: 2rem;
        min-height: 12rem;
        border: 1px solid #e5e5e5;
        box-shadow: 0 0.3rem 0.9rem 0 rgba(6, 81, 126, 0.18);
    }

    textarea:focus {
        outline: none;
    }
</style>
