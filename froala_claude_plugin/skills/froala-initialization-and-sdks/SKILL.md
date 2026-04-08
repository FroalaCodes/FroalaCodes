---
name: froala-initialization-and-sdks
description: >
  Use when the user is setting up a Froala editor instance. Activates on:
  import tokens (froala-editor, react-froala-wysiwyg, vue-froala-wysiwyg, angular-froala-wysiwyg),
  config tokens (toolbarButtons, heightMin, heightMax, theme, FroalaEditor),
  usage tokens (new FroalaEditor(, initControls, FroalaEditorComponent),
  or when user asks how to install, configure, or initialize Froala.
version: 1.0.0
license: MIT
---

# Froala Initialization & SDKs

## Installation

**npm (all frameworks)**

```bash
npm install froala-editor
```

**React**

```bash
npm install react-froala-wysiwyg
```

**Vue 3**

```bash
npm install vue-froala-wysiwyg
```

**Angular**

```bash
npm install angular-froala-wysiwyg
```

---

## Vanilla JavaScript

```html
<!-- In <head> -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/froala-editor/css/froala_editor.pkgd.min.css">

<!-- Before </body> -->
<script src="https://cdn.jsdelivr.net/npm/froala-editor/js/froala_editor.pkgd.min.js"></script>

<div id="editor">Hello, Froala!</div>

<script>
  const editor = new FroalaEditor('#editor', {
    licenseKey: 'YOUR_LICENSE_KEY',
    toolbarButtons: ['bold', 'italic', 'underline', '|', 'insertImage', 'insertLink'],
    heightMin: 200,
    heightMax: 500,
  });
</script>
```

---

## React

```jsx
import React, { useRef } from 'react';
import FroalaEditorComponent from 'react-froala-wysiwyg';

// Import Froala styles
import 'froala-editor/css/froala_style.min.css';
import 'froala-editor/css/froala_editor.pkgd.min.css';

// Import plugins you need
import 'froala-editor/js/plugins/image.min.js';
import 'froala-editor/js/plugins/link.min.js';

export default function MyEditor({ onModelChange }) {
  const config = {
    licenseKey: 'YOUR_LICENSE_KEY',
    toolbarButtons: {
      moreText: { buttons: ['bold', 'italic', 'underline', 'fontSize', 'textColor'] },
      moreParagraph: { buttons: ['alignLeft', 'alignCenter', 'alignRight', 'formatOL', 'formatUL'] },
      moreRich: { buttons: ['insertLink', 'insertImage', 'insertTable'] },
    },
    heightMin: 200,
  };

  return (
    <FroalaEditorComponent
      tag="textarea"
      config={config}
      onModelChange={onModelChange}
    />
  );
}
```

**Cleanup:** `react-froala-wysiwyg` destroys the editor on unmount automatically. If you hold a ref to the raw Froala instance, call `editor.destroy()` in `useEffect`'s cleanup.

---

## Vue 3

```vue
<template>
  <froala-editor v-model:value="content" :config="config" />
</template>

<script setup>
import { ref } from 'vue';
import VueFroala from 'vue-froala-wysiwyg';

// Register globally in main.js: app.use(VueFroala)

import 'froala-editor/css/froala_editor.pkgd.min.css';
import 'froala-editor/css/froala_style.min.css';

const content = ref('<p>Hello from Vue!</p>');
const config = ref({
  licenseKey: 'YOUR_LICENSE_KEY',
  toolbarButtons: ['bold', 'italic', 'underline', '|', 'insertImage'],
  heightMin: 200,
});
</script>
```

---

## Angular

```typescript
// app.module.ts
import { FroalaEditorModule, FroalaViewModule } from 'angular-froala-wysiwyg';

@NgModule({
  imports: [
    FroalaEditorModule.forRoot(),
    FroalaViewModule.forRoot(),
  ],
})
export class AppModule {}
```

```html
<!-- component.html -->
<div [froalaEditor]="options" [(froalaModel)]="content"></div>
```

```typescript
// component.ts
export class MyComponent {
  content = '<p>Hello from Angular!</p>';
  options = {
    licenseKey: 'YOUR_LICENSE_KEY',
    toolbarButtons: ['bold', 'italic', 'underline'],
    heightMin: 200,
  };
}
```

---

## Common Configuration Options

```js
const config = {
  licenseKey: 'YOUR_LICENSE_KEY',

  // Toolbar
  toolbarButtons: ['bold', 'italic', 'underline', '|', 'alignLeft', 'alignCenter',
    'alignRight', '|', 'formatOL', 'formatUL', '|', 'insertImage', 'insertLink', 'insertTable'],
  toolbarSticky: true,
  toolbarStickyOffset: 0,

  // Height
  heightMin: 200,
  heightMax: 600,

  // Theme: 'dark' or omit for light
  theme: 'dark',

  // Placeholder
  placeholderText: 'Start typing...',

  // Disable spellcheck
  spellcheck: false,

  // Inline mode (no toolbar until text selected)
  toolbarInline: false,
};
```

---

## License Key

- **Localhost / development:** Froala shows a warning banner if no key is set. This does not break functionality.
- **Production:** Set `licenseKey` in your config. Get a key at [froala.com](https://froala.com/wysiwyg-editor/pricing/).
- **Trial key:** Use the key from your Froala account dashboard; it expires after 30 days.

Do **not** hardcode production license keys in public repos — inject via environment variable:

```js
licenseKey: process.env.FROALA_LICENSE_KEY,
```

---

## Common Mistakes

1. **Missing CSS imports** — the editor renders but looks broken. Always import both `froala_editor.pkgd.min.css` and `froala_style.min.css`.

2. **Plugin JS not imported** — calling `editor.image.insert()` fails if `froala-editor/js/plugins/image.min.js` is not imported.

3. **Mounting before DOM is ready** — `new FroalaEditor('#editor')` fails if the element doesn't exist yet. Wrap in `DOMContentLoaded` or framework equivalent.

4. **Not destroying on unmount** — creates memory leaks and duplicate event listeners. Always call `editor.destroy()` or rely on the framework wrapper's cleanup.
