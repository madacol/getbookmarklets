<script>
    import { getScriptMetadata } from "$lib";
    import LinkButton from "$lib/components/LinkButton.svelte";
    import { untrack } from "svelte";

    /**
     * @type {{ source: string, source_url: string }}
     */
    let { source, source_url } = $props();

    let isUserscript = $derived(source.startsWith('// ==UserScript=='));

    let isDataURL = $derived(source_url.startsWith('data:'));

    let { name, description } = $derived(getScriptMetadata(source, untrack(()=>source_url)))

    let bookmarklet = $derived.by(() => {
        try {
            const source_no_comments = source.replaceAll(/(^|\n)\s*(\/\/.*?)?(?=\n)/g,'').replace(/ +/, ' ').trim();
            return `javascript:(()=>{${encodeURIComponent(source_no_comments)}})()`
        } catch (error) {
            console.error(error);
            return ''
        }
    })

    /**
     * @param event {{currentTarget: HTMLAnchorElement}}
     */
    async function handleUserscriptInstall(event) {

        fetch(`/signal/userscript/${encodeURIComponent(source_url)}`, { method: 'POST' });

        let userscript_source;
        if (isUserscript) {
            if (!isDataURL) {
                if (!source_url.endsWith('.user.js')) {
                    event.currentTarget.href += '#.user.js';
                }
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

    const installMessage =
`To install, do one of the following:

    - Drag button to the bookmark's bar

    - Right-click and select "Bookmark link" (Firefox only)

    - Right-click and select "Copy link address", now
        create a new bookmark and paste in the URL field
`
</script>

<div class="install">
    <LinkButton
        href={bookmarklet}
        onclick={e=>{
            alert(installMessage)
            e.preventDefault()
        }}
        disabled={!bookmarklet}
        ondragstart={startEvent => {
            const leaveHandler = event => {
                if (event.relatedTarget === null) {
                    fetch(`/signal/drag/${encodeURIComponent(source_url)}`, { method: 'POST' })
                }
            }
            window.addEventListener('dragleave', leaveHandler)

            // cleanup, remove event listener once drag ends
            startEvent.currentTarget.addEventListener('dragend', () => window.removeEventListener('dragleave', leaveHandler))
        }}
        oncontextmenu={()=>fetch(`/signal/rightclick/${encodeURIComponent(source_url)}`, { method: 'POST' })}
    >
        <span class="label"><!-- Install bookmarklet / Drag to bookmarks --></span>
        <span class="name">{name}</span>
    </LinkButton>
    <LinkButton disabled={!isUserscript} href={source_url} onclick={handleUserscriptInstall}>
        Install as Userscript
    </LinkButton>
    <LinkButton
        onclick={e => {
            e.preventDefault();
            // Create the shareable URL - this is the URL that appears in the header
            const shareUrl = `/scripts#${source_url}`;
            const shareableUrl = new URL(shareUrl, window.location.origin).href;

            if (navigator.share) {
                navigator.share({
                    title: name || 'Bookmarklet',
                    text: description,
                    url: shareableUrl
                })
                .then(() => {
                    fetch(`/signal/share/${encodeURIComponent(source_url)}`, { method: 'POST' });
                })
                .catch(err => console.error('Share failed:', err));
            } else {
                navigator.clipboard.writeText(shareableUrl)
                .then(() => {
                    // Use a more subtle notification instead of alert
                    const button = e.target;
                    const originalText = button.textContent;
                    button.textContent = '✓ Copied!';

                    setTimeout(() => {
                        button.textContent = originalText;
                    }, 2000);

                    fetch(`/signal/share_copy/${encodeURIComponent(source_url)}`, { method: 'POST' });
                })
                .catch(err => {
                    console.error('Copy failed:', err);
                    alert('Failed to copy link. Please copy the URL manually.');
                });
            }
        }}
    >
        <span class="share-icon">🔗</span> Share
    </LinkButton>
</div>

<style>
    .install {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
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
    .share-icon {
        display: inline-block;
        margin-right: 0.3rem;
    }
</style>