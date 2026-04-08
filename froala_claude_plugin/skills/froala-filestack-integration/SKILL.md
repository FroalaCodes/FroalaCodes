---
name: froala-filestack-integration
description: >
  Use when the user is wiring Filestack into Froala for image or file uploads. Activates on:
  Filestack plugin tokens (filestackOptions, filestackAPI, uploadToFilestackOnly, pickerOptions),
  plugin events (filestack.uploadedToFilestack, filestack.filestackPickerOpened),
  upload interception tokens (image.beforeUpload, file.beforeUpload, imageUploadURL, fileUploadURL),
  or when user asks how to use Filestack with Froala, bypass Froala's default uploader, or store files in the cloud.
version: 2.0.0
license: MIT
---

# Froala + Filestack Integration

## Two Approaches

| Approach | When to Use |
|----------|-------------|
| **Official Froala Filestack plugin** | Default — use when you want Froala's built-in Filestack support |
| **Manual interception** | Advanced — use when you need full custom control over the upload flow |

---

## Approach 1: Official Froala Filestack Plugin (Recommended)

Froala ships a native `filestack` plugin. This is the simplest and most supported path.

### Required Dependencies

Include all four scripts/stylesheets before Froala initializes:

```html
<!-- Filestack JS SDK (must be 3.x.x for the official plugin) -->
<script src="https://static.filestackapi.com/filestack-js/3.x.x/filestack.min.js"></script>
<script src="https://static.filestackapi.com/filestack-drag-and-drop-js/1.1.1/filestack-drag-and-drop.min.js"></script>
<script src="https://static.filestackapi.com/transforms-ui/2.x.x/transforms.umd.min.js"></script>
<link rel="stylesheet" href="https://static.filestackapi.com/transforms-ui/2.x.x/transforms.css" />

<!-- Froala Filestack plugin -->
<script src="https://cdn.jsdelivr.net/npm/froala-editor@latest/js/plugins/filestack.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/froala-editor@latest/css/plugins/filestack.min.css" />
```

### Configuration

```js
new FroalaEditor('#editor', {
  // Enable the plugin
  pluginsEnabled: ['filestack'],

  filestackOptions: {
    filestackAPI: 'YOUR_FILESTACK_API_KEY',       // Required
    uploadToFilestackOnly: false,                  // true = disable Froala's own uploader
    pickerOptions: {},                             // Filestack Picker config options
  },

  events: {
    'filestack.uploadedToFilestack'(response) {
      console.log('Upload success:', response);
    },
    'filestack.uploadFailedToFilestack'(response) {
      console.error('Upload failed:', response);
    },
    'filestack.filestackPickerOpened'(response) {
      console.log('Picker opened');
    },
    'filestack.filestackPickerClosed'(response) {
      console.log('Picker closed');
    },
  },
});
```

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filestackOptions.filestackAPI` | String | `""` | Your Filestack API key |
| `filestackOptions.uploadToFilestackOnly` | Boolean | `false` | When `true`, disables Froala's native uploader — all uploads go through Filestack |
| `filestackOptions.pickerOptions` | Object | `{}` | Passed directly to the Filestack File Picker |

### Plugin Events

| Event | Triggered when |
|-------|----------------|
| `filestack.uploadedToFilestack` | File successfully uploaded to Filestack |
| `filestack.uploadFailedToFilestack` | File upload to Filestack fails |
| `filestack.filestackPickerOpened` | Filestack Picker UI opens |
| `filestack.filestackPickerClosed` | Filestack Picker UI closes |

---

## Approach 2: Manual Interception (Advanced)

Use this when you need custom upload logic not covered by the official plugin — e.g., applying transformations before insert, custom picker behavior, or using Filestack JS 4.x.

### Vanilla JS

```html
<script src="https://static.filestackapi.com/filestack-js/4.x.x/filestack.min.js"></script>

<script>
  const fsClient = filestack.init('YOUR_FILESTACK_API_KEY');

  const editor = new FroalaEditor('#editor', {
    imageUploadURL: null,  // Disable Froala's default upload endpoint
    fileUploadURL: null,

    events: {
      'image.beforeUpload'(files) {
        const file = files[0];

        fsClient.upload(file).then((result) => {
          editor.image.insert(result.url, false, null, editor.image.get());
        }).catch((err) => {
          console.error('Filestack upload failed:', err);
        });

        return false; // Cancel Froala's own upload
      },
    },
  });
</script>
```

### React

```jsx
import FroalaEditorComponent from 'react-froala-wysiwyg';
import * as filestack from 'filestack-js';
import 'froala-editor/js/plugins/image.min.js';

const fsClient = filestack.init(process.env.REACT_APP_FILESTACK_API_KEY);

export default function FroalaWithFilestack({ onModelChange }) {
  const config = {
    imageUploadURL: null,
    fileUploadURL: null,

    events: {
      'image.beforeUpload'(files) {
        const editor = this; // `this` is the Froala editor instance inside function()
        const file = files[0];

        fsClient.upload(file)
          .then((result) => {
            editor.image.insert(result.url, false, null, editor.image.get());
          })
          .catch((err) => console.error('Upload error:', err));

        return false;
      },
    },
  };

  return <FroalaEditorComponent tag="textarea" config={config} onModelChange={onModelChange} />;
}
```

### Applying Transformations Before Insert

```js
fsClient.upload(file).then((result) => {
  const optimizedUrl = `https://cdn.filestackcontent.com/resize=width:800/output=format:webp/${result.handle}`;
  editor.image.insert(optimizedUrl, false, null, editor.image.get());
});
```

---

## Common Mistakes

| Problem | Cause | Fix |
|---------|-------|-----|
| Plugin does nothing | `pluginsEnabled` missing or doesn't include `'filestack'` | Add `pluginsEnabled: ['filestack']` |
| Plugin broken / no picker UI | Wrong Filestack JS version | Official plugin requires `3.x.x`, not `4.x.x` |
| No transforms/drag-drop UI | Missing CDN dependencies | Include all four scripts/stylesheets listed above |
| Image appears then disappears | Forgot `return false` in `image.beforeUpload` | Always `return false` to cancel Froala's upload attempt |
| `editor.image.get()` returns null | No image selected | Pass `null` as 4th arg to insert at cursor |
| `editor` is undefined in callback | Arrow function lost `this` context | Use `function()` not `() =>` for Froala event handlers |
| 403 on upload | Invalid API key or expired security policy | Verify key in Filestack Dashboard; regenerate policy if using security |
