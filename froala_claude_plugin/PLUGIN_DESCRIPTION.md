# Froala Plugin for Claude Code

A context plugin that makes Claude an expert on Froala WYSIWYG editor development — initialization, events, custom plugins, and Filestack cloud storage integration.

---

## What It Does

The Froala plugin gives Claude deep, structured knowledge about the Froala editor API. Instead of searching documentation, developers get accurate, framework-specific answers directly in their coding workflow.

**No MCP server required.** This plugin works entirely through skills — it injects the right Froala API context based on what you're working on.

---

## Plugin Components

### Skills (4)

| Skill | When it activates | What it provides |
|-------|-------------------|------------------|
| `froala-initialization-and-sdks` | User imports Froala CSS/JS, uses framework wrappers, or configures editor instances | Installation for Vanilla JS, React, Vue, Angular; toolbar/theme config; lifecycle/destroy patterns; license key handling |
| `froala-methods-and-events` | User writes event listeners, gets/sets HTML content, intercepts keyboard input, or accesses `editor` instance | Event listener syntax; safe HTML get/set; paste cleanup config; pre-init API call fixes |
| `froala-custom-plugins` | User registers custom plugins, creates toolbar buttons, builds floating popups, or extends formatting | Custom plugin boilerplate; command/dropdown registration; state sync patterns; SVG icon registration |
| `froala-filestack-integration` | User configures image/video upload, bypasses the default uploader, or wires Filestack into the editor | `image.beforeUpload` interception; Filestack client upload pattern; `image.insert` CDN URL embedding; disabling default endpoints |

---

## Use Cases

### 1. Set up Froala in a React app

> **User:** "How do I add Froala to my React component with a custom toolbar?"

Claude activates `froala-initialization-and-sdks` and provides a complete React component using `react-froala-wysiwyg` with the correct `config` prop, toolbar button list, and cleanup in `useEffect`.

---

### 2. Capture content changes

> **User:** "How do I listen for content changes in the Froala editor?"

Claude activates `froala-methods-and-events` and shows the correct `events.on('contentChanged', ...)` syntax along with safe HTML extraction via `editor.html.get()`.

---

### 3. Build a custom toolbar button

> **User:** "I want to add a custom button to the Froala toolbar that inserts a special HTML block."

Claude activates `froala-custom-plugins` and provides the full plugin registration boilerplate: `FroalaEditor.PLUGINS['myPlugin']`, `FroalaEditor.DefineIcon`, `FroalaEditor.RegisterCommand`, and toolbar config.

---

### 4. Upload images to Filestack instead of a local server

> **User:** "How do I make Froala upload images to Filestack instead of my own server?"

Claude activates `froala-filestack-integration` and provides the complete wiring: intercept `image.beforeUpload`, pass the file to `client.upload()`, then call `editor.image.insert()` with the resulting CDN URL.

---

## Installation

```text
/plugin install froala-claude-plugin@local
```

Or point the plugin manager at the local directory containing this plugin.

---

## Why This Plugin Exists

Froala has a rich but sprawling API. Developers frequently hit issues with initialization order, event binding timing, custom plugin boilerplate, and upload interception. This plugin encodes the solutions to those recurring problems as structured skills — so Claude gives correct, specific answers instead of generic WYSIWYG advice.
