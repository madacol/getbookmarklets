<script>
    import { getScriptMetadata } from "$lib";
    import LinkButton from "$lib/components/LinkButton.svelte";
    import { untrack } from "svelte";
    import { minify_sync } from "terser";

    /**
     * @type {{ source: string, source_url: string }}
     */
    let { source, source_url } = $props();

    let isDataURL = $derived(source_url.startsWith('data:'));

    let { name, description } = $derived(getScriptMetadata(source, untrack(()=>source_url)))

    let bookmarklet = $derived.by(() => {
        try {
            const minified = minify_sync(source)?.code || '';
            return `javascript:(function(){${encodeURIComponent(minified)}})();`
        } catch (error) {
            console.error(error);
            return ''
        }
    })

    /**
     * @param event {{currentTarget: HTMLAnchorElement}}
     */
    async function handleUserscriptInstall(event) {

        let userscript_source;
        if (source.match(/==UserScript==/)) {
            if (!source_url.endsWith('.user.js')) {
                event.currentTarget.href += '#.user.js';
            }
            if (!isDataURL) {
                return
            }
            userscript_source = source;
        } else {
            userscript_source = addUserscriptHeaders(name, description, source_url, source)
        }

        // send file to the server in the url
        const href = `/userscript/${encodeURIComponent(userscript_source)}#${name||"userscript"}.user.js`;
        event.currentTarget.href = href;
    }

    /**
     * @param name {string}
     * @param description {string}
     * @param uploader {string}
     * @param source_url {string}
     * @param source {string}
     */
    function addUserscriptHeaders(name, description, source_url, source) {
        /**
         * @type {{[key: string]: string}}
         */
        const headers = {
            name: name || 'Unnamed',
            match: '*://*/*',
            grant: 'none',
        }
        if (description) headers.description = description;
        if (!isDataURL) headers.downloadURL = source_url

        const headers_str = Object.entries(headers).map(([key, value]) => `// @${key}  ${value}`).join('\n')
        return `// ==UserScript==\n${headers_str}\n// ==/UserScript==\n\n${source}`;
    }
</script>

<div class="install">
    <LinkButton href={bookmarklet} disabled={!bookmarklet}>
        <span class="label"><!-- Drag to bookmarks --></span>
        <span class="name">{name}</span>
    </LinkButton>
    <LinkButton href={source_url} onclick={handleUserscriptInstall}>
        Install as Userscript
    </LinkButton>
</div>

<style>
    .install {
        display: flex;
        gap: 1rem;
    }
    span.label::after {
        content: "Install bookmarklet";
        color: white;
        min-width: 10rem;
    }
    :global(a:hover) span.label::after {
        content: "Drag to bookmarks";
    }
    span.name {
        position: absolute;
        opacity: 0;
        pointer-events: none;
    }
</style>