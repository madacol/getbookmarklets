---
name: attachment-directive
description: Return a generated file, image, video, audio clip, or directory to the chat with an explicit markdown attachment directive.
---

# attachment-directive

Use this skill when you need the final response to send one or more local artifacts back to the chat.

Emit one fenced directive per attachment:

~~~md
```attachment
path: artifacts/report.pdf
caption: Optional caption
```
~~~

Rules:

- `path` is required. Prefer workspace-relative paths when possible.
- `caption` is optional. Use it when the media type supports captions.
- Emit the directive in the final markdown response. Do not wrap it in another transport-specific command.
- Images, video, audio, documents, and directories are all supported. Directories are zipped before sending.
- Use one directive block per artifact when sending multiple files.
