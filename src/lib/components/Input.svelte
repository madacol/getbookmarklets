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
