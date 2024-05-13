<script>
    import Script from "$lib/components/Script.svelte";

    const { data } = $props();
</script>

<main>
    <div class="box">
        <h1>Welcome!</h1>
        <p>This is a place to share bookmarklets.</p>

        <hr>


        <h2>How this site works</h2>

        <p>Scripts are stored as URLs.</p>
        <p>To add a script</p>
        <ol>
            <li>Navigate to <a href="/scripts/add">Add script</a>.</li>
            <li>Paste the URL of a RAW JavaScript file.</li>
        </ol>
        <p>You can add metadata using userscript-like comments. Supported tags:</p>
        <ul>
            <li><code>// @name</code> – if not present, defaults to the URL's filename.</li>
            <li><code>// @description</code></li>
            <li><code>// @image</code> – URL to an image that will be displayed on this site. You can add multiple images.</li>
            <li><code>// @video</code> – URL to a video. You can add many.</li>
        </ul>



        <h2>Why? (or Rant)</h2>
        <p>Honestly, bookmarklets and userscripts should not exist. The fact that they still do is a failure of the web extension ecosystem.</p>
        <p>
            Extensions are difficult to verify that they <i>don't do anything else</i> than what they claim.
            <br>The permission system is too broad, and the time and knowledge you need to get to the source code is too high. Making it look like a joke how much harder it is to verify compared to an equivalent one-liner bookmarklet.
        </p>
        <p>Since the minimum effort needed to verify is really high, and average users cannot verify it anyway, browsers decided to focus on methods that end up putting friction/restrictions to what you can do with your browser.</p>
        <p>Narrowing the permission system would help <i>a lot</i>, but it requires lots of efforts into coordination and implementation. So it only makes sense for the most popular restrictions users want. The long tail will still be neglected.</p>
        <p>So I think extension platforms should make it easier to verify extension's code, and let social signaling do the rest (e.g. developers --influence-> power users --influence-> average users).</p>


        <h2>What are Bookmarklets?</h2>
        <p>They are small JavaScript programs stored as browser bookmarks.</p>
        <p>When you click the bookmark, the code runs on the current web page, to do things like:</p>
        <ul>
            <li>modify the page</li>
            <li>automate actions</li>
            <li>extract information.</li>
        </ul>


        <h2>How to install a bookmarklet</h2>
        <p>There are multiple ways:</p>
            <ul>
                <li>Drag the <strong>Install</strong> button to your browser's bookmarks toolbar.</li>
                <li>(Firefox only) Right-click the <strong>Install</strong> button and select <strong>"Bookmark link"</strong>.</li>
                <li>Manually add a new bookmark. Right-click the <strong>Install</strong> button and select <strong>"Copy link address"</strong>, then create a new bookmark and paste the URL in the URL field.</li>
            </ul>
        <p></p>

    </div>

    {#each data.scripts as {source_url}}
        <div class="box">
            <Script {source_url} collapseCode={true} />
        </div>
    {/each}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: stretch;
        gap: 2rem;
        max-width: fit-content;
        margin: auto;
        max-width: 1000px;
    }
    .box {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        * {
            margin: 0;
        }
    }
    li:has(code) {
        padding: 0.2rem 0;
        code {
            background-color: #dddddd;
            padding: 0.1rem 0.3rem;
            border-radius: 0.3rem;
        }
    }
</style>
