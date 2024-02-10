
<button on:click={()=>window.history.back()}>
    <span class="back-icon">⟨</span>
    <span>Back</span>
</button>

<style>
    button {
        background-color: transparent;
        padding: 1rem;
        border: 0;
        border-radius: 2rem;
        cursor: pointer;
        color: black;
        text-align: center;
        font-size: 1rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.3rem;
        opacity: 0.6;
    }
    button:hover {
        opacity: 1;
    }
    .back-icon {
        font-size: 1.5em;
        padding-bottom: 0.19em;
    }
</style>