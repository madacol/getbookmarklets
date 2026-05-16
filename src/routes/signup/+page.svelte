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
    <div class="box form-card">
        <div class="form-header">
            <h1>Create an account</h1>
            <p>Join to share and discover bookmarklets.</p>
        </div>

        {#if error}
            <p class="error" role="alert">{error}</p>
        {/if}

        <form method="post">
            <label for="signup-username">Username</label>
            <Input
                id="signup-username"
                name="username"
                type="text"
                required
                placeholder="Choose a username"
                autocomplete="username"
            />

            <label for="signup-password">Password</label>
            <Input
                id="signup-password"
                bind:value={password}
                name="password"
                type="password"
                required
                placeholder="Choose a password"
                autocomplete="new-password"
                minlength={PASSWORD_MINLENGTH}
            />

            <label for="signup-password-repeat">Confirm Password</label>
            <Input
                id="signup-password-repeat"
                bind:value={password_repeat}
                type="password"
                placeholder="Repeat your password"
                autocomplete="new-password"
                minlength={PASSWORD_MINLENGTH}
            />

            <PrimaryButton
                type="submit"
                onclick={(/** @type {MouseEvent} */ e) => validate() || e.preventDefault()}
            >Sign up</PrimaryButton>
        </form>

        <p class="alt-action">
            Already have an account? <a href="/login">Sign in</a>
        </p>
    </div>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
    }

    .form-card {
        width: 100%;
        max-width: 24rem;
        display: flex;
        flex-direction: column;
        gap: 1.25rem;
    }

    .form-header {
        text-align: center;
    }

    .form-header h1 {
        margin: 0 0 0.25rem;
        font-size: 1.6rem;
        color: #0d1f30;
    }

    .form-header p {
        margin: 0;
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    label {
        font-weight: 600;
        font-size: 0.88rem;
        color: #374151;
        margin-top: 0.75rem;
    }
    label:first-of-type {
        margin-top: 0;
    }

    .error {
        background: var(--error-bg, #fff1f1);
        color: var(--error-color, #dc2626);
        border: 1px solid #fecaca;
        border-radius: var(--radius-sm, 0.5rem);
        padding: 0.6rem 0.9rem;
        margin: 0;
        font-size: 0.9rem;
    }

    .alt-action {
        margin: 0;
        text-align: center;
        font-size: 0.9rem;
        color: var(--text-muted);
    }

    .alt-action a {
        color: var(--primary-color);
        font-weight: 600;
        text-decoration: none;
    }

    .alt-action a:hover {
        text-decoration: underline;
    }
</style>
