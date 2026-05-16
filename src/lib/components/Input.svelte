<script>
    import { onMount } from "svelte";

    /**
     * @type {{value?: string, [x: string]: any}}
     */
    let { value = $bindable(''), ...props } = $props();

    onMount(() => {
        if (props.name && props.type !== 'password') {
            // load the value from the URL
            const url = new URL(window.location.href);
            const paramValue = url.searchParams.get(props.name);
            if (paramValue) {
                value = paramValue;
                const event = {target: {value}}
                if (props.onchange) props.onchange(event)
                else if (props.oninput) props.oninput(event)
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
        display: block;
        width: 100%;
        height: 3.25rem;
        flex-shrink: 0;
        border-radius: 2rem;
        border: 2px solid #e5e5e5;
        background: #fcfcfc;
        color: rgba(0, 0, 0, 0.79);
        font-size: 1rem;
        font-family: inherit;
        padding: 0 1.5rem;
        box-shadow: var(--shadow-md, 0 0.3rem 0.9rem 0 rgba(6, 81, 126, 0.18));
        outline: none;
        transition: border-color 0.15s, box-shadow 0.15s;
    }
    input:focus {
        border-color: var(--primary-color, #1761a7);
        box-shadow: 0 0 0 3px rgba(23, 97, 167, 0.15);
    }
</style>
