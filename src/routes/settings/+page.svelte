<script>

    import Input from '$lib/components/Input.svelte'
    import MainContainer from '$lib/components/MainContainer.svelte'
    import PrimaryButton from '$lib/components/PrimaryButton.svelte'
    import { PASSWORD_MINLENGTH } from '$lib/config.js'

    export let form

    let password = ''
    let password_repeat = ''
    /** @type {string | null} */
    let error = null

    function validate() {
        if (password !== password_repeat) {
            form = {error: 'Passwords do not match'}
            return false
        }
        error = null
        return true
    }

    $: if (form?.error) {
        error = form.error
    }
</script>

<MainContainer back_button={true}>
    {#if error}
        <p class="error">{error}</p>
    {/if}
    {#if form?.message}
        <p class="success">{form.message}</p>
    {/if}

    <h2>Change password</h2>

    <form method="post" action="?/password_change">
        <Input
            bind:value={password}
            name="password"
            type="password"
            required
            placeholder="Password"
            autocomplete="new-password"
            minlength={PASSWORD_MINLENGTH}
        />
        <Input
            bind:value={password_repeat}
            type="password"
            placeholder="Confirm password"
            autocomplete="new-password"
            minlength={PASSWORD_MINLENGTH}
        />

        <div>
            <PrimaryButton
                type="submit"
                on:click={(e) => (validate() || e.preventDefault())}
            >
                Change password
            </PrimaryButton>
        </div>
    </form>
</MainContainer>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    h2 {
        margin-top: 0;
    }
    .error {
        color: red;
    }
    .success {
        color: green;
    }
</style>
