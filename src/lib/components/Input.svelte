<script>
    let { value = '', ...props } = $props();

</script>

<input
    bind:value
    {...props}
/>

<style>
    input {
        height: 3.5rem;
        flex-shrink: 0;
        border-radius: 2rem;
        border: 1px solid #e5e5e5;
        background: #fcfcfc;
        color: rgba(0, 0, 0, 0.79);
        text-align: center;
        font-size: 1rem;
    }
</style>
