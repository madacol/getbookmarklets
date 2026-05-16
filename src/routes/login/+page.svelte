<script>
    import Input from '$lib/components/Input.svelte'
    import PrimaryButton from '$lib/components/PrimaryButton.svelte'

    export let form
</script>

<main class="box">
    <div class="form-header">
        <h1>Sign In</h1>
        <p>Welcome back! Enter your credentials below.</p>
    </div>

    {#if form?.error}
        <p class="error" role="alert">{form.error}</p>
    {/if}

    <form method="post">
        <label for="login-username">Username</label>
        <Input
            id="login-username"
            name="username"
            type="text"
            required
            placeholder="Your username"
            autocomplete="username"
        />

        <label for="login-password">Password</label>
        <Input
            id="login-password"
            name="password"
            type="password"
            required
            placeholder="Your password"
            autocomplete="current-password"
        />

        <PrimaryButton type="submit">Log in</PrimaryButton>
    </form>
    <p class="alt-action">Don’t have an account? <a href="/signup">Sign Up</a></p>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: stretch;
        margin: auto;
        gap: 1.5rem;
        max-width: 24rem;
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
        align-items: stretch;
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
        background: var(--error-bg);
        color: var(--error-color);
        border: 1px solid #fecaca;
        border-radius: var(--radius-sm);
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
