# Froala Claude Plugin

A Claude Code plugin that makes Claude an expert on [Froala WYSIWYG editor](https://froala.com/wysiwyg-editor/) development. Get accurate, framework-specific answers about initialization, events, custom plugins, and Filestack cloud storage integration — without leaving your editor.

---

## Installation

### From GitHub (recommended)

```
/plugin marketplace add https://github.com/YOUR_USERNAME/froala-claude-plugin.git
/plugin install froala-claude-plugin@froala-claude-plugin
```

### Local / Development

```
/plugin marketplace add file:///path/to/froala_claude_plugin
/plugin install froala-claude-plugin@froala-local
```

---

## Skills

The plugin ships 4 skills that activate automatically based on your code and questions. You don't invoke them manually — Claude detects the context.

### `froala-initialization-and-sdks`

**Activates when** you import Froala packages, use framework wrappers, or ask about setup.

Covers:
- Installation for Vanilla JS, React, Vue 3, and Angular
- Toolbar configuration and layout options
- Editor lifecycle and proper destroy/cleanup patterns
- License key setup for localhost vs. production

**Trigger keywords:** `froala-editor`, `react-froala-wysiwyg`, `vue-froala-wysiwyg`, `angular-froala-wysiwyg`, `new FroalaEditor(`, `toolbarButtons`, `heightMin`

---

### `froala-methods-and-events`

**Activates when** you work with editor events, get/set content, or intercept keyboard input.

Covers:
- Event listener syntax (`contentChanged`, `focus`, `blur`, `keydown`, etc.)
- Safe HTML get/set via `editor.html.get()` and `editor.html.set()`
- Paste cleanup configuration to strip Word/Google Docs formatting
- Fixes for calling API methods before editor initialization

**Trigger keywords:** `events.on`, `events.bind`, `contentChanged`, `html.get`, `html.set`, `pastePlain`, `paste.afterCleanup`

---

### `froala-custom-plugins`

**Activates when** you register custom plugins, create toolbar buttons, build popups, or extend formatting.

Covers:
- Full plugin boilerplate (`FroalaEditor.PLUGINS`, `RegisterCommand`, `DefineIcon`)
- Custom dropdown buttons with option lists
- Floating popup panels
- State synchronization between custom plugin and editor
- SVG icon registration and shortcut key binding
- Plugin loading order requirements

**Trigger keywords:** `FroalaEditor.PLUGINS`, `RegisterCommand`, `DefineIcon`, `initPopup`, `showPopup`, `POPUP_TEMPLATES`

---

### `froala-filestack-integration`

**Activates when** you configure image/video upload or wire Filestack into the editor.

Covers:
- Intercepting `image.beforeUpload` to cancel Froala's default uploader
- Passing files to `filestack.client.upload()` and injecting the CDN URL back with `editor.image.insert()`
- Using the Filestack Picker widget as a toolbar button
- Applying Filestack CDN transformations (resize, format conversion) on insert
- Security: signed upload policies for production apps
- Common pitfalls (missing `return false`, arrow function `this` context loss)

**Trigger keywords:** `image.beforeUpload`, `file.beforeUpload`, `imageUploadURL`, `fileUploadURL`, `filestack`, `filestackcontent.com`

---

## Example Interactions

**"How do I add Froala to my React app with a dark theme?"**
→ `froala-initialization-and-sdks` activates → Complete React component with `react-froala-wysiwyg`, config prop, and `theme: 'dark'`

**"How do I listen for content changes and get the HTML?"**
→ `froala-methods-and-events` activates → `contentChanged` event with `editor.html.get()` example

**"I want a custom toolbar button that inserts a signature block."**
→ `froala-custom-plugins` activates → Full `FroalaEditor.PLUGINS` + `RegisterCommand` boilerplate

**"How do I make Froala upload images to Filestack instead of my server?"**
→ `froala-filestack-integration` activates → `image.beforeUpload` interception + `client.upload()` + `editor.image.insert()` wiring

---

## Project Structure

```
froala-claude-plugin/
├── .claude-plugin/
│   ├── plugin.json         # Plugin metadata
│   └── marketplace.json    # Enables local installation
├── skills/
│   ├── froala-initialization-and-sdks/
│   │   └── SKILL.md
│   ├── froala-methods-and-events/
│   │   └── SKILL.md
│   ├── froala-custom-plugins/
│   │   └── SKILL.md
│   └── froala-filestack-integration/
│       └── SKILL.md
├── PLUGIN_DESCRIPTION.md
└── README.md
```

---

## License

MIT
