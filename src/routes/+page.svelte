<script>
    import Details from "$lib/components/Details.svelte";
    import Script from "$lib/components/Script.svelte";

    const { data } = $props();
</script>

<div class="introduction">
    <div>
        <h1>Welcome!</h1>
        <p>This is a place to share bookmarklets.</p>

        <hr>

        <h2>How this site works</h2>

        <p>Scripts are shared as URLs.</p>
        <p>To add a script</p>
        <ol>
            <li>Go to <a href="/scripts/add">Add script</a>.</li>
            <li>Paste the URL of a RAW JavaScript file.</li>
        </ol>
        <p>
            You can add optional metadata using userscript-like comments.
            <br>Supported tags:
        </p>
        <ul>
            <li><code>// @name</code> – if not present, defaults to the URL's filename.</li>
            <li><code>// @description</code></li>
            <li><code>// @image</code> – URL to an image that will be displayed on this site. You can add multiple images.</li>
            <li><code>// @video</code> – URL to a video. You can add many.</li>
        </ul>

        <Details>
            <summary><h2>What, How, Why?</h2></summary>

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

            <h3>Why bookmarklets? (or Rant)</h3>

            <p>Bookmarklets and Userscripts should ideally be implemented as Web Extensions, but verifying that extensions <i>only do</i> what they claim is hard. Although permissions aim to address this issue, they are too broad. So often, a better option is to read and verify the code ourselves.</p>

            <p>However, verifying extensions has two challenges: <strong>1.</strong> Learning how extensions work and its APIs <strong>2.</strong> Accessing the source code. Especially relevant for extensions that can be written as a one-line bookmarklet, it's harder to verify them than to write them as a bookmarklet.</p>

            <p>Narrowing permissions' scope would help, but it requires significant coordination and effort, making it feasible only for the most common requested permissions.</p>

            <p>Extension platforms should make it easy to read the code, it's the best way to tell what an extension can do. But until then, bookmarklets and userscripts remain better options for many tasks.</p>
        </Details>

    </div>
</div>

<div class="scripts">
    <div>
        {#each data.scripts as {source_url}}
            <div class="box">
                <Script {source_url} collapseCode={true} />
            </div>
        {/each}
    </div>
</div>

<style>
    :global(#content):has(.introduction) {
        background: white;
        padding: 0;
    }
    .introduction {
        padding: 2rem;
        & > div {
            max-width: 1000px;
            margin: auto;
        }
    }
    .scripts {
        background: #2c4657;
        padding: 2rem;

        & > div {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            max-width: 1000px;
            margin: auto;
        }

        .box {
            display: flex;
            flex-direction: column;
            gap: 1rem;
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
    summary {
        text-decoration: underline;
    }
</style>
