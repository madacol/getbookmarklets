<script>
    /**
     * @type {{children: () => any, open?: boolean, [x: string]: any}}
     */
    let {children, open = $bindable(false), ...props} = $props();
</script>

<details bind:open {...props}>
    {@render children()}
</details>

<style>
    details :global {
        & > summary {
            cursor: pointer;
            width: fit-content;

            & > * {
                display: inline;
            }
            &:hover {
                opacity: 0.7;
            }
        }
    }
</style>