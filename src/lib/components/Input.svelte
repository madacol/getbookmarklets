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
        font-size: 1rem;
        padding: 0 2rem 0 2rem ;
        box-shadow: 0 0.3rem 0.9rem 0 rgba(6, 81, 126, 0.18);
    }
</style>
