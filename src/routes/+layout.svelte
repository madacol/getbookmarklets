<script>
  import Logo from './Logo.svelte'

  let { children } = $props();
</script>

<header>
  <div class="logo_links">
    <a href="/" class="logo" aria-label="Go to home page">
      <Logo/>
    </a>
  </div>
  <nav id="right-menu">
    <a href="/scripts/add" class="nav-cta">+ Add Script</a>
  </nav>
</header>


<div id="content">
    {@render children()}
</div>


<footer>
  <div class="footer-inner">
    <span class="footer-brand">Get Bookmarklets</span>
    <div class="footer-links">
      <a href="https://github.com/madacol/getbookmarklets" target="_blank" rel="noopener noreferrer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
        GitHub
      </a>
    </div>
  </div>
</footer>


<style>
    header {
      position: sticky;
      top: 0;
      z-index: 100;
      background: white;
      padding: 0 1.5rem;
      display: flex;
      gap: 1rem;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border-color);
      box-shadow: var(--shadow-sm);
      min-height: 4rem;
    }

    .logo_links {
      display: flex;
      align-items: center;
    }

    .logo {
      text-decoration: none;
      display: flex;
      align-items: center;
      padding: 0.5rem 0;
      transition: opacity 0.15s;
    }

    .logo:hover {
      opacity: 0.8;
    }

    #right-menu {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .nav-cta {
      text-decoration: none;
      background: var(--primary-color);
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      padding: 0.55rem 1.1rem;
      border-radius: var(--radius-md);
      transition: background 0.15s, transform 0.1s;
      white-space: nowrap;
    }

    .nav-cta:hover {
      background: var(--primary-hover-color);
      transform: translateY(-1px);
    }

    #content {
      background: var(--dark-bg);
      padding: 2rem;
      flex-grow: 1;
    }

    footer {
      background: white;
      border-top: 1px solid var(--border-color);
      padding: 1.25rem 1.5rem;
    }

    .footer-inner {
      max-width: 1000px;
      margin: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .footer-brand {
      font-weight: 600;
      color: var(--primary-color);
      font-size: 0.95rem;
    }

    .footer-links {
      display: flex;
      gap: 1.25rem;
    }

    .footer-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: color 0.15s;
    }

    .footer-links a:hover {
      color: var(--primary-color);
    }
</style>