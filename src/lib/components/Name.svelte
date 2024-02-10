<script>
    import Verified from "./VerifiedIcon.svelte"

    /** @type {string} */
     export let name;
    export let is_verified = false;
</script>

<div class="name" >
    <span title={name}>
        {name}
    </span>
    {#if is_verified}
        <Verified />
    {/if}
</div>

<style>
    .name {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
    }
    span {
        font-size: x-large;
        font-weight: bold;
    }
</style>