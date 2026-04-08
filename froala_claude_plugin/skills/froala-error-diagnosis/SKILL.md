---
name: froala-error-diagnosis
description: >
  Use when the user encounters Froala errors or unexpected behavior. Activates on:
  symptom tokens (toolbar missing, button not showing, button not appearing, toolbar empty, no toolbar,
  plugin not loading, plugin not working, editor broken, editor not rendering, editor not showing),
  console error tokens (FroalaEditor is not defined, is not a constructor, html is undefined,
  image is undefined, Cannot read property, pluginsEnabled),
  or when user asks why a toolbar button, plugin, upload, or editor feature is not working.
version: 1.0.0
license: MIT
---

# Froala Error Diagnosis

Diagnose by symptom. Find the closest match below, check the cause, apply the fix.

---

## Toolbar Button Is Missing or Not Showing

**Symptom:** You added a button name to `toolbarButtons` but it doesn't appear.

**Cause 1 — Plugin JS not imported.**
Toolbar buttons backed by a plugin (image, link, table, video, etc.) require the plugin's JS file to be imported first.

```js
// WRONG — button silently absent
new FroalaEditor('#editor', {
  toolbarButtons: ['insertImage'],
});

// CORRECT
import 'froala-editor/js/plugins/image.min.js';

new FroalaEditor('#editor', {
  toolbarButtons: ['insertImage'],
});
```

**Cause 2 — `pluginsEnabled` excludes the plugin.**
If `pluginsEnabled` is set, it acts as an allowlist — any plugin not listed is disabled even if imported.

```js
// WRONG — image plugin disabled
new FroalaEditor('#editor', {
  pluginsEnabled: ['link'],
  toolbarButtons: ['insertImage'], // silently gone
});

// CORRECT — include every plugin you need
new FroalaEditor('#editor', {
  pluginsEnabled: ['link', 'image'],
  toolbarButtons: ['insertImage', 'insertLink'],
});
```

**Cause 3 — Wrong button name.**
Button names are case-sensitive and version-specific. Common correct names:

| Feature | Correct button name |
|---------|-------------------|
| Bold | `bold` |
| Italic | `italic` |
| Insert image | `insertImage` |
| Insert link | `insertLink` |
| Insert table | `insertTable` |
| Ordered list | `formatOL` |
| Unordered list | `formatUL` |
| Align left | `alignLeft` |
| Font size | `fontSize` |
| Text color | `textColor` |
| Clear formatting | `clearFormatting` |
| Full screen | `fullscreen` |
| HTML view | `html` |

**Cause 4 — Button missing from the toolbar group object (v4+).**
In Froala v4+, `toolbarButtons` can be a grouped object. Omitting a group means those buttons are never rendered.

```js
// WRONG — insertImage not in any group
toolbarButtons: {
  moreText: { buttons: ['bold', 'italic'] },
  // no moreRich group = insertImage never appears
}

// CORRECT
toolbarButtons: {
  moreText: { buttons: ['bold', 'italic'] },
  moreRich: { buttons: ['insertImage', 'insertLink', 'insertTable'] },
}
```

---

## Editor Renders but Looks Broken or Unstyled

**Symptom:** The editor mounts but has no borders, wrong fonts, or collapsed layout.

**Cause — Missing CSS imports.**
Froala requires two stylesheets: one for the editor chrome, one for the content area.

```js
// Both are required
import 'froala-editor/css/froala_editor.pkgd.min.css'; // editor UI
import 'froala-editor/css/froala_style.min.css';       // content styling
```

For CDN:
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/froala-editor/css/froala_editor.pkgd.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/froala-editor/css/froala_style.min.css">
```

---

## "FroalaEditor is not defined" / "is not a constructor"

**Symptom:** Console error when calling `new FroalaEditor(...)`.

**Cause 1 — Script not loaded yet (CDN).**
The script tag is in `<head>` without `defer`, or the inline script runs before the CDN script.

```html
<!-- WRONG — script may not be loaded when inline JS runs -->
<head>
  <script src="https://cdn.jsdelivr.net/npm/froala-editor/js/froala_editor.pkgd.min.js"></script>
</head>
<body>
  <script>new FroalaEditor('#editor', {});</script> <!-- may fail -->
</body>

<!-- CORRECT — place before </body> or use DOMContentLoaded -->
<body>
  <div id="editor"></div>
  <script src="https://cdn.jsdelivr.net/npm/froala-editor/js/froala_editor.pkgd.min.js"></script>
  <script>new FroalaEditor('#editor', {});</script>
</body>
```

**Cause 2 — Wrong import in a bundler.**

```js
// WRONG
import { FroalaEditor } from 'froala-editor'; // named export doesn't exist

// CORRECT
import FroalaEditor from 'froala-editor';
```

---

## Plugin Method Is Undefined (`editor.image is undefined`, etc.)

**Symptom:** Calling `editor.image.insert(...)` or similar throws `Cannot read property of undefined`.

**Cause 1 — Called before `initialized`.**
The editor instance is not safe to call until the `initialized` event fires.

```js
// WRONG
const editor = new FroalaEditor('#editor', {});
editor.html.set('<p>Hello</p>'); // error — editor not ready

// CORRECT
new FroalaEditor('#editor', {
  events: {
    initialized() {
      this.html.set('<p>Hello</p>'); // safe
    },
  },
});
```

**Cause 2 — Plugin JS not imported.**
`editor.image`, `editor.link`, `editor.table`, etc. only exist if the corresponding plugin is imported.

```js
import 'froala-editor/js/plugins/image.min.js'; // required for editor.image.*
import 'froala-editor/js/plugins/link.min.js';  // required for editor.link.*
```

---

## Editor Does Not Mount / Element Not Found

**Symptom:** No editor appears; no console error or a silent failure.

**Cause 1 — Selector doesn't match any element.**
`new FroalaEditor('#editor')` silently does nothing if `#editor` doesn't exist.

```js
// Verify the element exists before init
const el = document.querySelector('#editor');
if (!el) console.error('Froala target element not found');
new FroalaEditor('#editor', {});
```

**Cause 2 — DOM not ready.**

```js
// WRONG — runs before DOM is parsed
new FroalaEditor('#editor', {}); // element doesn't exist yet

// CORRECT
document.addEventListener('DOMContentLoaded', () => {
  new FroalaEditor('#editor', {});
});
```

---

## License Warning Banner Appears

**Symptom:** Yellow banner reading "You are using an unlicensed version of Froala Editor."

**Cause — `licenseKey` not set or invalid.**
This is cosmetic only in development, but required for production.

```js
new FroalaEditor('#editor', {
  licenseKey: process.env.FROALA_LICENSE_KEY, // never hardcode in public repos
});
```

Get a key at [froala.com/wysiwyg-editor/pricing](https://froala.com/wysiwyg-editor/pricing/). A missing key does not break functionality — it only shows the banner.

---

## Toolbar Button Renders but Does Nothing

**Symptom:** Button appears in the toolbar, is clickable, but has no effect.

**Cause 1 — Custom plugin registered after editor init.**
`FroalaEditor.RegisterCommand` and `FroalaEditor.PLUGINS` must run before `new FroalaEditor(...)`.

```js
// WRONG — registration too late
const editor = new FroalaEditor('#editor', {});
FroalaEditor.RegisterCommand('myBtn', { callback() { ... } }); // ignored

// CORRECT
FroalaEditor.RegisterCommand('myBtn', { callback() { ... } }); // register first
const editor = new FroalaEditor('#editor', { toolbarButtons: ['myBtn'] });
```

**Cause 2 — `pluginsEnabled` blocks the plugin the button depends on.**
See the toolbar section above.

---

## Image / File Upload Does Nothing or Fails Silently

**Symptom:** Selecting a file does nothing, or upload seems to start but never completes.

**Cause 1 — `imageUploadURL` not set.**
Without an upload endpoint, Froala encodes images as base64 inline. For server upload, set the URL:

```js
new FroalaEditor('#editor', {
  imageUploadURL: '/api/upload/image',
  fileUploadURL: '/api/upload/file',
});
```

**Cause 2 — Server response format wrong.**
Froala expects a specific JSON shape:

```json
{ "link": "https://your-cdn.com/uploaded-image.jpg" }
```

Any other shape causes a silent failure. Check the Network tab for the actual response.

**Cause 3 — CORS.**
The upload endpoint must allow the origin making the request. Check browser console for CORS errors.

**Cause 4 — `image.beforeUpload` returns `false` unintentionally.**
If you intercept uploads and `return false` always (not just for custom upload paths), Froala cancels every upload.

---

## `html.get()` Returns Empty String

**Symptom:** `editor.html.get()` returns `""` even though the editor has content.

**Cause — Called before the editor initializes or outside the editor's context.**

```js
// WRONG — race condition
const editor = new FroalaEditor('#editor', {});
console.log(editor.html.get()); // "" — not ready yet

// CORRECT
new FroalaEditor('#editor', {
  events: {
    contentChanged() {
      console.log(this.html.get()); // always safe here
    },
  },
});
```

For React, use `onModelChange` instead:

```jsx
<FroalaEditorComponent onModelChange={(html) => setContent(html)} />
```

---

## `this` Is Undefined or Wrong in Event Handlers

**Symptom:** Inside a Froala event callback, `this` is `undefined`, `window`, or a React component instead of the editor instance.

**Cause — Arrow function used as event handler.**
Arrow functions inherit `this` from their surrounding scope. Froala sets `this` to the editor instance using `.call()`, which arrow functions ignore.

```js
// WRONG — `this` is not the editor
events: {
  contentChanged: () => {
    console.log(this.html.get()); // `this` is wrong
  },
}

// CORRECT — `this` is the editor instance
events: {
  contentChanged() {
    console.log(this.html.get()); // correct
  },
}
```

---

## Quick Diagnosis Checklist

If something isn't working and you're not sure where to start:

1. **Open browser DevTools → Console** — look for any JS errors
2. **Open Network tab** — check for failed requests (uploads, license checks)
3. **Confirm plugin JS is imported** for every feature you're using
4. **Confirm CSS is imported** if the editor looks wrong
5. **Confirm `pluginsEnabled` includes** every plugin you need (or remove it entirely)
6. **Wrap post-init calls** in the `initialized` event
7. **Use `function()` not `() =>`** for all Froala event handlers
