<script>
    import { onMount } from "svelte";

    /**
     * @type {{value: string, [x: string]: any}}
     */
    let { value: propValue = '', ...props } = $props();

    let value = $state(propValue);

    onMount(() => {
        if (props.name && props.type !== 'password') {
            // load the value from the URL
            const url = new URL(window.location.href);
            const paramValue = url.searchParams.get(props.name);
            if (paramValue) {
                value = paramValue;
                if (props.onchange) props.onchange({target: {value}})
            }

            // update the URL when the value changes
            $effect(() => {
                if (props.name) {
                    const url = new URL(window.location.href);
                    (value === '')
                        ? url.searchParams.delete(props.name)
                        : url.searchParams.set(props.name, value);
                    history.replaceState(history.state, '', url);
                }
            })
        }
    });
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
        min-width: 20rem;
        min-height: 10rem;
        border: 1px solid #e5e5e5;
        box-shadow: 0 0.3rem 0.9rem 0 rgba(6, 81, 126, 0.18);
    }
</style>
