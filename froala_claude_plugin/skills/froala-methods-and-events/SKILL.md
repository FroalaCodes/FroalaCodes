---
name: froala-methods-and-events
description: >
  Use when the user is working with Froala editor events or API methods. Activates on:
  event tokens (events.on, events.bind, contentChanged, initialized, focus, blur, keydown, keyup),
  content tokens (html.get, html.set, editor.html, getHTML, setHTML),
  paste tokens (pastePlain, pasteDenied, paste.afterCleanup, pastePlainText),
  or when user asks how to listen for changes, get editor content, or intercept keyboard input.
version: 1.0.0
license: MIT
---

# Froala Methods & Events

## Initialization Hook

Always bind events **inside** the `events.initialized` callback or via the `events` config object — the editor instance is not safe to use until initialization completes.

```js
const editor = new FroalaEditor('#editor', {
  events: {
    initialized() {
      // `this` is the editor instance
      console.log('Editor ready');
    },
  },
});
```

---

## Event Binding

**Via config (preferred — guaranteed before first render):**

```js
new FroalaEditor('#editor', {
  events: {
    contentChanged() {
      console.log('Content changed:', this.html.get());
    },
    focus() {
      console.log('Editor focused');
    },
    blur() {
      console.log('Editor blurred');
    },
  },
});
```

**Via `editor.events.on` (after initialization):**

```js
const editor = new FroalaEditor('#editor', {
  events: {
    initialized() {
      this.events.on('contentChanged', function () {
        console.log('Changed:', this.html.get());
      });
    },
  },
});
```

---

## Common Events Reference

| Event | When it fires |
|-------|--------------|
| `initialized` | Editor is fully ready |
| `contentChanged` | Editor content changes |
| `focus` | Editor receives focus |
| `blur` | Editor loses focus |
| `keydown` | Key pressed down |
| `keyup` | Key released |
| `click` | Click inside editor |
| `mouseup` | Mouse button released |
| `commands.before` | Before a toolbar command executes |
| `commands.after` | After a toolbar command executes |
| `image.beforeUpload` | Before image upload starts (use to intercept) |
| `image.uploaded` | After image uploaded to server |
| `image.inserted` | After image inserted into editor |
| `paste.before` | Before paste event |
| `paste.afterCleanup` | After paste content is cleaned up |
| `html.set` | After `editor.html.set()` is called |

---

## Getting & Setting HTML Content

```js
// Get the editor's HTML content
const html = editor.html.get();           // includes formatting tags
const text = editor.text.get();           // plain text only

// Set the editor's HTML content
editor.html.set('<p>New content</p>');

// Get selected text
const selection = editor.selection.text();

// Get selected HTML
const selectedHtml = editor.selection.element();
```

**React (via model):**

```jsx
// Use onModelChange instead of events for React
<FroalaEditorComponent
  onModelChange={(model) => setContent(model)}
  model={content}
/>
```

---

## Keyboard Interception

```js
new FroalaEditor('#editor', {
  events: {
    keydown(e) {
      // e is the native KeyboardEvent
      if (e.key === 'Tab') {
        e.preventDefault();
        this.html.insert('&nbsp;&nbsp;&nbsp;&nbsp;'); // Insert 4 spaces on Tab
        return false;
      }
    },
    keyup(e) {
      console.log('Key up:', e.key);
    },
  },
});
```

---

## Paste Cleanup Configuration

Control what formatting is stripped when pasting from external sources (Word, Google Docs, etc.):

```js
new FroalaEditor('#editor', {
  // Strip Word formatting
  wordPasteModal: false,         // Don't show the "paste from Word" modal
  wordPasteKeepFormatting: false, // Strip Word formatting on paste

  // Plain text paste
  pastePlain: false,             // true = strip all formatting on paste

  // Fine-grained paste cleanup
  htmlAllowedTags: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
  htmlAllowedAttrs: ['href', 'target'],
  htmlRemoveTags: ['script', 'style'],

  events: {
    'paste.afterCleanup'(clipboardHtml) {
      // Modify or inspect the cleaned paste content
      return clipboardHtml.replace(/<span[^>]*>/g, '').replace(/<\/span>/g, '');
    },
  },
});
```

---

## Calling Editor API Methods Safely

**Problem:** Calling methods before initialization causes `Cannot read property of undefined` errors.

**Fix:** Always wrap post-init API calls in the `initialized` event:

```js
// WRONG — editor not ready yet
const editor = new FroalaEditor('#editor');
editor.html.set('<p>Hello</p>'); // Error: html is undefined

// CORRECT
new FroalaEditor('#editor', {
  events: {
    initialized() {
      this.html.set('<p>Hello</p>'); // Safe
    },
  },
});
```

**For React refs:**

```jsx
import FroalaEditorComponent from 'react-froala-wysiwyg';

export default function Editor() {
  const editorRef = useRef(null);

  const insertContent = () => {
    // Access editor instance via ref
    if (editorRef.current && editorRef.current.editor) {
      editorRef.current.editor.html.insert('<strong>Inserted!</strong>');
    }
  };

  return (
    <>
      <FroalaEditorComponent ref={editorRef} config={{}} />
      <button onClick={insertContent}>Insert</button>
    </>
  );
}
```

---

## Toolbar Command Events

```js
new FroalaEditor('#editor', {
  events: {
    'commands.before'(cmd) {
      console.log('About to run:', cmd);
      // Return false to cancel the command
    },
    'commands.after'(cmd) {
      console.log('Ran:', cmd);
    },
  },
});
```

---

## Programmatic Focus & Cursor Control

```js
// Focus the editor
editor.events.focus();

// Place cursor at end
editor.selection.setAtEnd(editor.$el.get(0));
editor.selection.restore();

// Select all content
editor.commands.selectAll();
```
