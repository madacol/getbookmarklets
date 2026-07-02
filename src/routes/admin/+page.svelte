<script>
    import ReviewPage from '../scripts/review/+page.svelte';

    const { data, form } = $props();
</script>

<ReviewPage {data} {form} />
