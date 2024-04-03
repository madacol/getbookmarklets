<script>
    import Input from '$lib/components/Input.svelte'
    import PrimaryButton from '$lib/components/PrimaryButton.svelte'
    import { PASSWORD_MINLENGTH } from '$lib/config.js'

    let { form } = $props()

    let password = $state('')
    let password_repeat = $state('')
    /** @type {string | null} */
    let error = $state(null)
    $effect(() => {
        error = (password !== password_repeat)
            ? 'Passwords do not match'
            : null
    })

    function validate() {
        if (password !== password_repeat) {
            return false
        }
        return true
    }

    $effect(() => {
        if (form?.error) {
            error = form.error
        }
    })
</script>

<main>
    <p class="error">{error}</p>
    <h1>Sign Up</h1>

    <form class="box" method="post">
        <Input
            name="username"
            type="text"
            required
            placeholder="Username"
        />

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

        <PrimaryButton
            type="submit"
            onclick={(e) => validate() || e.preventDefault()}
        >Sign up</PrimaryButton
        >
    </form>
    <h5>
        Already have an account? <a href="/login">Sign in</a>
    </h5>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 20rem;
    }
    .error {
        min-height: 2rem;
        color: red;
    }
</style>
