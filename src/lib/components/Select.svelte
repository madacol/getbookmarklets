<script>
    /**
     * @type {string}
     */
    export let name;
    export let selected = "";
    export let placeholder = 'Select an option';

    /**
     * @type {{value: string, label: string}[]}
     */
    export let options;
</script>

<select
    bind:value={selected}
    name={name}
    {...$$restProps}
    on:change
>
    {#each options as option}
        <option value={option.value}>{option.label}</option>
    {/each}
    <option value="" disabled hidden>{placeholder}</option>
</select>
<input type="hidden" {name} value={selected}>

<style>
    select {
        border-radius: 100px;
        border: 1px solid #e5e5e5;
        background: #fcfcfc;
        height: 3.5rem;

        color: rgba(0, 0, 0, 0.79);
        text-align: center;
        font-size: 1rem;
    }
</style>