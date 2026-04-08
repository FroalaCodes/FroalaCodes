---
name: froala-custom-plugins
description: >
  Use when the user is building custom Froala plugins or toolbar extensions. Activates on:
  registration tokens (FroalaEditor.PLUGINS, RegisterCommand, DefineIcon, RegisterShortcut),
  popup tokens (initPopup, showPopup, hidePopup, FroalaEditor.POPUP_TEMPLATES),
  or when user asks to add a custom toolbar button, dropdown, modal, popup, or extend Froala formatting.
version: 1.0.0
license: MIT
---

# Froala Custom Plugins

## Plugin Boilerplate

Every custom Froala plugin follows this structure:

```js
// Import Froala core before registering plugins
import FroalaEditor from 'froala-editor';

(function (FroalaEditor) {
  // 1. Register SVG icon for the toolbar button
  FroalaEditor.DefineIcon('myPluginIcon', {
    NAME: 'star',           // Font Awesome icon name (if using FA)
    SVG_KEY: 'star',        // OR use a built-in SVG key
  });

  // Use custom SVG:
  FroalaEditor.DefineIcon('myPluginIcon', {
    template: 'svg',
    SVG: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-6 4 2 7-6-4-6 4 2-7-6-4h7z"/></svg>',
  });

  // 2. Register the toolbar command
  FroalaEditor.RegisterCommand('myPlugin', {
    title: 'My Plugin',          // Tooltip text
    icon: 'myPluginIcon',        // Icon registered above
    focus: true,                 // Keep editor focused
    undo: true,                  // Allow undo/redo
    refreshAfterCallback: true,  // Refresh toolbar state after execution
    callback() {
      // `this` is the editor instance
      this.html.insert('<span class="my-custom-element">Custom content</span>');
    },
  });

  // 3. Define the plugin logic (optional — needed for state/popup management)
  FroalaEditor.PLUGINS.myPlugin = function (editor) {
    function _init() {
      // Called when the editor initializes
      // Set up any listeners or state here
    }

    return {
      _init,
      // Expose public methods callable via editor.myPlugin.doSomething()
      doSomething() {
        editor.html.insert('<p>Custom action executed</p>');
      },
    };
  };
})(FroalaEditor);
```

**Add to toolbar config:**

```js
new FroalaEditor('#editor', {
  toolbarButtons: ['bold', 'italic', '|', 'myPlugin'],
});
```

---

## Custom Dropdown Button

```js
FroalaEditor.RegisterCommand('myDropdown', {
  title: 'Insert Template',
  type: 'dropdown',
  icon: 'myPluginIcon',
  options: {
    template1: 'Newsletter Header',
    template2: 'Call to Action',
    template3: 'Footer Block',
  },
  callback(cmd, val) {
    // `val` is the selected option key (e.g., 'template1')
    const templates = {
      template1: '<h2>Newsletter</h2><p>Issue content here...</p>',
      template2: '<div class="cta"><a href="#">Click Here</a></div>',
      template3: '<footer><p>Footer content</p></footer>',
    };
    this.html.insert(templates[val]);
  },
  refresh($btn) {
    // Called when toolbar state updates — use to enable/disable/highlight
  },
  refreshOnShow($btn, $dropdown) {
    // Called each time the dropdown opens
  },
});
```

---

## Custom Popup

Popups let you build floating UI panels (color pickers, link editors, etc.):

```js
// 1. Register the popup template
FroalaEditor.POPUP_TEMPLATES['myPlugin.popup'] = '[_BUTTONS_][_CUSTOM_LAYER_]';

// 2. Define the plugin with popup management
FroalaEditor.PLUGINS.myPlugin = function (editor) {
  function initPopup() {
    const template = {
      buttons: '<div class="fr-buttons">' +
        editor.button.buildList(['myPluginClose']) +
        '</div>',
      custom_layer: '<div class="fr-layer fr-active" style="padding:16px">' +
        '<input id="my-input" type="text" placeholder="Enter value" />' +
        '<button onclick="applyValue()">Apply</button>' +
        '</div>',
    };
    return editor.popups.create('myPlugin.popup', template);
  }

  function showPopup() {
    let $popup = editor.popups.get('myPlugin.popup');
    if (!$popup) $popup = initPopup();

    // Position popup at current selection
    editor.popups.setContainer('myPlugin.popup', editor.$sc);
    const left = editor.$el.offset().left + editor.$el.outerWidth() / 2;
    const top = editor.$el.offset().top;
    editor.popups.show('myPlugin.popup', left, top, editor.$el.outerHeight());
  }

  function hidePopup() {
    editor.popups.hide('myPlugin.popup');
  }

  function _init() {}

  return { _init, showPopup, hidePopup };
};

// 3. Close button command
FroalaEditor.DefineIcon('myPluginClose', { NAME: 'times', SVG_KEY: 'back' });
FroalaEditor.RegisterCommand('myPluginClose', {
  title: 'Close',
  undo: false,
  focus: false,
  callback() {
    this.myPlugin.hidePopup();
  },
});

// 4. Trigger button that opens the popup
FroalaEditor.RegisterCommand('myPluginOpen', {
  title: 'Open My Panel',
  icon: 'myPluginIcon',
  undo: false,
  focus: false,
  callback() {
    this.myPlugin.showPopup();
  },
});
```

---

## State Synchronization

Keep custom plugin state in sync with the editor:

```js
FroalaEditor.PLUGINS.myPlugin = function (editor) {
  // Private state
  let _isActive = false;
  let _selectedItems = [];

  function _init() {
    // Listen to events to reset state when needed
    editor.events.on('contentChanged', function () {
      _validateState();
    });

    editor.events.on('blur', function () {
      _isActive = false;
    });
  }

  function _validateState() {
    // Check if cursor is inside a custom element
    const el = editor.selection.element();
    _isActive = el && el.classList.contains('my-custom-element');
  }

  function toggle() {
    if (_isActive) {
      _remove();
    } else {
      _insert();
    }
  }

  function _insert() {
    editor.html.insert('<span class="my-custom-element">Custom</span>');
    _isActive = true;
  }

  function _remove() {
    const el = editor.selection.element();
    if (el && el.classList.contains('my-custom-element')) {
      editor.selection.setAfter(el);
      el.parentNode.removeChild(el);
    }
    _isActive = false;
  }

  return { _init, toggle, isActive: () => _isActive };
};
```

**Refresh toolbar button to reflect active state:**

```js
FroalaEditor.RegisterCommand('myPlugin', {
  title: 'My Plugin',
  icon: 'myPluginIcon',
  callback() {
    this.myPlugin.toggle();
  },
  refresh($btn) {
    // Highlight button when active
    if (this.myPlugin.isActive()) {
      $btn.addClass('fr-active');
    } else {
      $btn.removeClass('fr-active');
    }
  },
});
```

---

## Registering Shortcut Keys

```js
FroalaEditor.RegisterShortcut(FroalaEditor.KEYCODE.K, 'myPlugin', null, 'K');
```

---

## Loading Order

Plugins must be registered **before** the editor is instantiated. In bundler environments, import your plugin file before creating the editor instance:

```js
import 'froala-editor';
import './my-froala-plugin'; // registers via side effects
import FroalaEditorComponent from 'react-froala-wysiwyg';
```
