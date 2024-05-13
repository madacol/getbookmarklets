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


        <details>
            <summary><h2>Why, What and How to install</h2></summary>

            <h3>Why? (or Rant)</h3>
            <p>Honestly, bookmarklets and userscripts should not exist. They should be extensions instead, but...</p>
            <p>
                Extensions are difficult to verify that they <strong>do not do anything else</strong> than what they claim.
                <br>The permission system is too broad, and to verify the source code is too hard. It looks like a joke for a lot of extensions out there that could have been just a one-liner bookmarklet.
            </p>
            <p>Since the minimum effort needed to verify is really high, and average users cannot verify it anyway, browsers decided to focus on methods that end up putting friction/restrictions to what you can do with your browser.</p>
            <p>Narrowing the permission system would help <i>a lot</i>, but it requires lots of efforts into coordination and implementation. So it only makes sense for the most popular restrictions users want. The long tail will still be neglected.</p>
            <p>So I think extension platforms should make it easier to verify extension's code, so more people can verify, and improve the quality of word of mouth when sharing extensions.</p>


            <h3>What are Bookmarklets?</h3>
            <p>They are small JavaScript programs stored as browser bookmarks.</p>
            <p>When you click the bookmark, the code runs on the current web page, to do things like:</p>
            <ul>
                <li>modify the page</li>
                <li>automate actions</li>
                <li>extract information.</li>
            </ul>


            <h3>How to install a bookmarklet</h3>
            <p>There are multiple ways:</p>
            <ul>
                <li>Drag the <strong>Install</strong> button to your browser's bookmarks toolbar.</li>
                <li>(Firefox only) Right-click the <strong>Install</strong> button and select <strong>"Bookmark link"</strong>.</li>
                <li>Manually add a new bookmark. Right-click the <strong>Install</strong> button and select <strong>"Copy link address"</strong>, then create a new bookmark and paste the URL in the URL field.</li>
            </ul>
        </details>

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
        & > * {
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
    details > summary {
        cursor: pointer;
        width: fit-content;
        
        &:hover {
            opacity: 0.7;
        }
        
        & > h2 {
            display: inline;
        }
    }
</style>
