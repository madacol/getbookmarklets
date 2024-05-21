<script>
  import LinkButton from '$lib/components/LinkButton.svelte'
  import Logo from './Logo.svelte'

  let { children, data } = $props();

  // let menu_open = $state(false);
</script>

<header>
  <div class="logo_links">
    <div class="logo">
      <a href="/" aria-label="logo">
        <Logo/>
      </a>
    </div>

  </div>
  <div id="right-menu">
    <LinkButton href="/scripts/add">Add Script</LinkButton>
    <!-- {#if data.user}
      <div id="profile">
        <PrimaryButton
            onclick={e => {
                e.stopPropagation()
                menu_open = !menu_open
            }}
            onkeypress={e => e.key === 'Enter' && (menu_open = !menu_open)}
        >
          {data.user.username}
        </PrimaryButton>

        <div
            id="profile-menu"
            class:open={menu_open}
        >
            <div class="profile-menu-item">
              <a class="logout" href="/logout?redirectTo={$page.url.pathname}">Logout</a>
            </div>
        </div>
      </div>
    {:else}
      <div id="login-button">
        <LinkButton href="/login">Sign In</LinkButton>
      </div>
    {/if} -->
  </div>
</header>


<div id="content">
    {@render children()}
</div>


<footer>
  <div class="social">
    <a href="https://github.com/madacol/getbookmarklets">Github</a>
  </div>
</footer>


<style>
    header {
      padding: 0 1em 0 0;
      display: flex;
      gap: 2em;
      justify-content: space-between;
      align-items: center;
    }

    .logo_links {
      display: flex;
      align-items: stretch;
      overflow: auto;
    }

    .logo {
      padding: 1em;
    }

    .logo > a {
      text-decoration: none;
    }

    .logo > a:hover {
      opacity: 0.8;
    }
/* 
    #right-menu {
      position: relative;
      display: flex;
      gap: 1rem;
      align-items: center;
      align-self: stretch;
    }

    #right-menu > div {
      padding: 1em 0;
      display: flex;
      align-items: center;
    }

    #profile {
      position: relative;
    }

    #profile-menu {
      display: none;
      position: absolute;
      top: 100%;
      right: 0;
      background: #fff;
      border: 1px solid #ccc;
      padding: 10px;
      flex-direction: column;
      gap: 10px;
      align-items: start;
    }
    #profile-menu.open {
      display: flex;
    }

    .profile-menu-item {
      margin-right: 10px;
    }

    .profile-menu-item a {
      text-decoration: none;
    }

    a.logout {
      color: #9d0000;
    } */

    #content {
      background: #2c4657;
      padding: 2rem;
      flex-grow: 1;
    }

    a {
      color: #333;
    }
    footer {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      font-size: large;
    }
    .social {
      display: flex;
      gap: 1rem;
    }
</style>