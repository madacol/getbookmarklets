<script>

    /**
     * @type {{type: "button" | "submit" | "reset", [x: string]: any}}
     */
    let { type = "button", children, ...props } = $props();
</script>

<button {type} { ...props }>
    {@render children()}
</button>

<style>
    button {
        background-color: var(--background-color);
        width: 100%;
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
    button:not(:disabled):hover {
        background-color: var(--background-hover-color);
    }
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
