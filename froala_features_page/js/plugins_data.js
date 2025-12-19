export const plugins = [
    {
        "id": "align",
        "title": "Align",
        "description": "Align text and paragraphs with left, center, right, or justify alignment options.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/align-plugin/",
        "config": {
            "pluginsEnabled": ["align", "paragraphFormat"],
            "toolbarButtons": ["alignLeft", "alignCenter", "alignRight", "alignJustify"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Alignment Demo</h1><p style='text-align: left;'>Left aligned text.</p><p style='text-align: center;'>Center aligned text.</p><p style='text-align: right;'>Right aligned text.</p><p style='text-align: justify;'>Justified text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>"
    },
    {
        "id": "charCounter",
        "title": "Char Counter",
        "description": "Display the number of characters at the bottom bar of the editor and limit character input.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/char-counter-plugin/",
        "config": {
            "pluginsEnabled": ["charCounter", "paragraphFormat"],
            "toolbarButtons": []
        },
        "cssRequired": true,
        "initialContent": "<h1>Character Counter</h1><p>Start typing to see the character count change in the bottom right corner.</p>"
    },
    {
        "id": "codeBeautifier",
        "title": "Code Beautifier",
        "description": "Beautifies the code inside the code view mode.",
        "category": "Advanced Features",
        "docsUrl": "https://froala.com/code-beautifier-plugin/",
        "config": {
            "pluginsEnabled": ["codeBeautifier", "codeView", "paragraphFormat"],
            "toolbarButtons": ["html"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Code Beautifier</h1><p>Switch to Code View (<code>&lt;/&gt;</code>) to see the HTML code automatically beautified/indented.</p>"
    },
    {
        "id": "codeView",
        "title": "Code View",
        "description": "Switch between visual and HTML code view to edit raw HTML markup.",
        "category": "Advanced Features",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/code-view-plugin/",
        "config": {
            "pluginsEnabled": ["codeView", "paragraphFormat"],
            "toolbarButtons": ["html"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Code View</h1><p>Click the <code>&lt;/&gt;</code> button in the toolbar to switch to HTML view and edit the source code directly.</p>"
    },
    {
        "id": "colors",
        "title": "Colors",
        "description": "Apply text and background colors with an intuitive color picker.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/colors-plugin/",
        "config": {
            "pluginsEnabled": ["colors", "paragraphFormat"],
            "toolbarButtons": ["textColor", "backgroundColor"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Colors</h1><p>Select this text and change its <span style='color: #0098f7;'>color</span> or <span style='background-color: #f1c40f;'>background</span> using the toolbar buttons.</p>"
    },
    {
        "id": "draggable",
        "title": "Draggable",
        "description": "Adds ability to drag content like images and videos.",
        "category": "Structure & Layout",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/draggable-plugin/",
        "config": {
            "pluginsEnabled": ["draggable", "image", "video", "paragraphFormat"],
            "toolbarButtons": ["insertImage", "insertVideo"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Draggable Content</h1><p>Try dragging the image below to a new position:</p><br><img src='https://froala.com/assets/editor/docs/photo14.jpg' class='fr-fic fr-dib' alt='Draggable Image' style='width: 300px;'><br><p>Move it here!</p>"
    },
    {
        "id": "filestack",
        "title": "Filestack",
        "description": "Powerful cloud-based file uploads with image transformation and CDN delivery.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/filestack-plugin/",
        "config": {
            "pluginsEnabled": ["filestack", "paragraphFormat"],
            "toolbarButtons": ["openFilePicker", "openFilePickerImage", "openFilePickerVideo", "openFilePickerFile", "filestackIcon"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Filestack Integration</h1><p>Use the powerful Filestack picker to upload content from Facebook, Instagram, Google Drive, and more.</p>"
    },
    {
        "id": "embedly",
        "title": "Embedly",
        "description": "Embeds any content from the web in the editor.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/embedly-plugin/",
        "config": {
            "pluginsEnabled": ["embedly", "paragraphFormat"],
            "toolbarButtons": ["embedly"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Embedly</h1><p>Click the Embedly icon and paste a URL (like a YouTube video or Tweet) to instantly embed rich media.</p>"
    },
    {
        "id": "emoticons",
        "title": "Emoticons",
        "description": "Insert emoticons and emoji to add personality to your content.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/emoticons-plugin/",
        "config": {
            "pluginsEnabled": ["emoticons", "paragraphFormat"],
            "toolbarButtons": ["emoticons"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Emoticons</h1><p>Add some personality to your text! 😀 🎉 🚀 Click the smiley face icon to browse emojis.</p>"
    },
    {
        "id": "entities",
        "title": "Entities",
        "description": "Converts special characters to HTML entities.",
        "category": "Advanced Features",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/entities-plugin/",
        "config": {
            "pluginsEnabled": ["entities", "codeView", "paragraphFormat"],
            "toolbarButtons": ["html"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Entities</h1><p>Special characters like < > & \" are automatically converted to their HTML entity equivalents in the source code.</p>"
    },
    {
        "id": "exportToWord",
        "title": "Export to Word",
        "description": "Export your editor content as a Microsoft Word document.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/export-to-word-plugin/",
        "config": {
            "pluginsEnabled": ["exportToWord", "paragraphFormat"],
            "toolbarButtons": ["export_to_word"]
        },
        "cssRequired": false,
        "isNew": true,
        "initialContent": "<h1>Export to Word</h1><p>This content can be exported directly to a .doc file. Click the export button in the toolbar to try it.</p>"
    },
    {
        "id": "file",
        "title": "File",
        "description": "Upload and insert files into your content with drag-and-drop support.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/file-plugin/",
        "config": {
            "pluginsEnabled": ["file", "paragraphFormat"],
            "toolbarButtons": ["insertFile"]
        },
        "cssRequired": false,
        "initialContent": "<h1>File Upload</h1><p>Drag and drop a file anywhere here, or use the paperclip icon to upload a document.</p>"
    },
    {
        "id": "filesManager",
        "title": "Files Manager",
        "description": "Browse and manage uploaded files stored on your server.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/files-manager-plugin/",
        "config": {
            "pluginsEnabled": ["file", "filesManager", "paragraphFormat"],
            "toolbarButtons": ["insertFile"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Files Manager</h1><p>Use the file manager to browse previously uploaded files and insert them.</p>"
    },

    {
        "id": "findReplace",
        "title": "Find and Replace",
        "description": "Search and replace text throughout your document with ease.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/find-replace-plugin/",
        "config": {
            "pluginsEnabled": ["findReplace", "paragraphFormat"],
            "toolbarButtons": ["findReplaceButton"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Find and Replace</h1><p>Try finding the word \"Froala\" and replacing it with \"Editor\". Froala is fast. Froala is beautiful.</p>"
    },
    {
        "id": "fontAwesome",
        "title": "Font Awesome",
        "description": "Insert Font Awesome icons directly into your content.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/font-awesome-plugin/",
        "config": {
            "pluginsEnabled": ["fontAwesome", "paragraphFormat"],
            "toolbarButtons": ["fontAwesome"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Font Awesome</h1><p>Enhance your content with icons: <i class='fab fa-font-awesome fa-2x' style='color: #0098f7;'></i> <i class='fas fa-star fa-2x' style='color: gold;'></i></p>"
    },
    {
        "id": "fontFamily",
        "title": "Font Family",
        "description": "Choose from a wide selection of fonts to customize your text style.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/font-family-plugin/",
        "config": {
            "pluginsEnabled": ["fontFamily", "paragraphFormat"],
            "toolbarButtons": ["fontFamily"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Font Family</h1><p style='font-family: Arial, Helvetica, sans-serif;'>This text is Arial.</p><p style='font-family: Georgia, serif;'>This text is Georgia.</p><p style='font-family: Impact, Charcoal, sans-serif;'>This text is Impact.</p>"
    },
    {
        "id": "fontSize",
        "title": "Font Size",
        "description": "Adjust text size with precise font size controls.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/font-size-plugin/",
        "config": {
            "pluginsEnabled": ["fontSize", "paragraphFormat"],
            "toolbarButtons": ["fontSize"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Font Size</h1><p style='font-size: 14px;'>Small text (14px)</p><p style='font-size: 24px;'>Medium text (24px)</p><p style='font-size: 36px;'>Large text (36px)</p>"
    },
    {
        "id": "fullscreen",
        "title": "Fullscreen",
        "description": "Expand the editor to fullscreen for distraction-free editing.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/fullscreen-plugin/",
        "config": {
            "pluginsEnabled": ["fullscreen", "paragraphFormat"],
            "toolbarButtons": ["fullscreen"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Fullscreen</h1><p>Need more space? Click the fullscreen button to expand the editor to the full size of your browser window.</p>"
    },
    {
        "id": "help",
        "title": "Help",
        "description": "Access keyboard shortcuts and helpful editing tips.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/help-plugin/",
        "config": {
            "pluginsEnabled": ["help", "paragraphFormat"],
            "toolbarButtons": ["help"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Help & Shortcuts</h1><p>Not sure how to do something? Click the Help (?) icon to view a list of useful keyboard shortcuts.</p>"
    },
    {
        "id": "image",
        "title": "Image",
        "description": "Upload, resize, and manipulate images with advanced editing tools.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/image-plugin/",
        "config": {
            "pluginsEnabled": ["image", "paragraphFormat"],
            "toolbarButtons": ["insertImage"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Image Editing</h1><p>Click on the image below to access advanced editing options like resize, align, and style:</p><img src='https://froala.com/assets/editor/docs/photo14.jpg' class='fr-fic fr-dib' alt='Example Image' style='width: 300px;'>"
    },
    {
        "id": "imageManager",
        "title": "Image Manager",
        "description": "Browse and manage uploaded images stored on your server.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/image-manager-plugin/",
        "config": {
            "pluginsEnabled": ["image", "imageManager", "paragraphFormat"],
            "toolbarButtons": ["insertImage"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Image Manager</h1><p>Easily browse through your server's image library to find and insert the perfect picture.</p>"
    },
    {
        "id": "inlineClass",
        "title": "Inline Class",
        "description": "Apply custom CSS classes to selected text for advanced styling.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/inline-class-plugin/",
        "config": {
            "pluginsEnabled": ["inlineClass", "paragraphFormat"],
            "toolbarButtons": ["inlineClass"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Inline Classes</h1><p>Select this text and use the toolbar to apply custom defined CSS classes.</p>"
    },
    {
        "id": "inlineStyle",
        "title": "Inline Style",
        "description": "Apply predefined CSS styles to selected text with one click.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/inline-style-plugin/",
        "config": {
            "pluginsEnabled": ["inlineStyle", "paragraphFormat"],
            "toolbarButtons": ["inlineStyle"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Inline Styles</h1><p>Apply specific CSS properties directly to text elements using the toolbar.</p>"
    },
    {
        "id": "lineBreaker",
        "title": "Line Breaker",
        "description": "Using the line_breaker plugin it is possible to insert a new paragraph between HTML elements where the cursor cannot be placed.",
        "category": "Structure & Layout",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/line-breaker-plugin/",
        "config": {
            "pluginsEnabled": ["lineBreaker", "table", "paragraphFormat"],
            "toolbarButtons": ["insertTable"] 
        },
        "cssRequired": true,
        "initialContent": "<div style='padding: 20px;'><strong>Hover between the two tables below to see the Line Breaker:</strong></div><table style='width: 100%; border: 1px solid #ddd;'><tbody><tr><td style='width: 25%; border: 1px solid #ddd;'>1</td><td style='width: 25%; border: 1px solid #ddd;'><table style='width: 100%; background: #f9f9f9;'><tbody><tr><td style='width: 50%; border: 1px solid #ccc;'>Nested 1</td><td style='width: 50%; border: 1px solid #ccc;'>Nested 2</td></tr><tr><td style='width: 50%; border: 1px solid #ccc;'>Nested 3</td><td style='width: 50%; border: 1px solid #ccc;'>Nested 4</td></tr></tbody></table></td><td style='width: 25%; border: 1px solid #ddd;'>2</td><td style='width: 25%; border: 1px solid #ddd;'>3</td></tr><tr><td style='width: 25%; border: 1px solid #ddd;'>4</td><td style='width: 25%; border: 1px solid #ddd;'>5</td><td style='width: 25%; border: 1px solid #ddd;'>6</td><td style='width: 25%; border: 1px solid #ddd;'>7</td></tr></tbody></table><hr/><table style='width: 100%; border: 1px solid #ddd;'><tbody><tr><td style='width: 25%; border: 1px solid #ddd;'>A</td><td style='width: 25%; border: 1px solid #ddd;'>B</td><td style='width: 25%; border: 1px solid #ddd;'>C</td><td style='width: 25%; border: 1px solid #ddd;'>D</td></tr><tr><td style='width: 25%; border: 1px solid #ddd;'>E</td><td style='width: 25%; border: 1px solid #ddd;'>F</td><td style='width: 25%; border: 1px solid #ddd;'>G</td><td style='width: 25%; border: 1px solid #ddd;'>H</td></tr></tbody></table>"
    },
    {
        "id": "lineHeight",
        "title": "Line Height",
        "description": "Adjust spacing between lines for improved readability and formatting.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/line-height-plugin/",
        "config": {
            "pluginsEnabled": ["lineHeight", "paragraphFormat"],
            "toolbarButtons": ["lineHeight"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Line Height</h1><p style='line-height: 1.2;'>Single Line Height: Lorem ipsum dolor sit amet.</p><p style='line-height: 3;'>Double Line Height: Lorem ipsum dolor sit amet.</p>"
    },
    {
        "id": "link",
        "title": "Link",
        "description": "Insert and edit hyperlinks with customizable attributes and styling.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/link-plugin/",
        "config": {
            "pluginsEnabled": ["link", "paragraphFormat"],
            "toolbarButtons": ["insertLink"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Links</h1><p>Visit the <a href='https://froala.com'>Froala Website</a> or edit this link to point somewhere else.</p>"
    },
    {
        "id": "linkToAnchor",
        "title": "Link to Anchor",
        "description": "Create internal page links that jump to specific sections.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/link-to-anchor-plugin/",
        "config": {
            "pluginsEnabled": ["link", "linkToAnchor", "paragraphFormat"],
            "toolbarButtons": ["insertLink", "insertAnchor"]
        },
        "cssRequired": true,
        "isNew": true,
        "initialContent": "<h1>Anchor Links</h1><p><a href='#target-section'>Jump to Target Section</a></p><div style='height: 100px; background: #eee; text-align: center; padding: 40px;'>Spacer Content</div><h2 id='target-section'>Target Section</h2><p>You've arrived!</p>"
    },
    {
        "id": "lists",
        "title": "Lists",
        "description": "Insert lists with advanced types such as lower greek or upper roman.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/lists-plugin/",
        "config": {
            "pluginsEnabled": ["lists", "paragraphFormat"],
            "toolbarButtons": ["formatOL", "formatUL"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Advanced Lists</h1><ul><li>Bulleted List<ul><li>Nested Item</li></ul></li></ul><ol><li>Numbered List</li><li>Second Item</li></ol>"
    },
    {
        "id": "markdown",
        "title": "Markdown",
        "description": "Write and edit content using Markdown syntax with live preview.",
        "category": "Advanced Features",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/markdown-plugin/",
        "config": {
            "pluginsEnabled": ["markdown", "paragraphFormat"],
            "toolbarButtons": ["markdown"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Markdown Support</h1><p>This is an example of text. Enable the Markdown view to see how it converts.</p><h2>Section Header</h2><p>Here is some plain text that will become markdown.</p>"
    },
    {
        "id": "pageBreak",
        "title": "Page Break",
        "description": "Insert page breaks for structuring long documents intended for export.",
        "category": "Structure & Layout",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/page-break-plugin/",
        "config": {
            "pluginsEnabled": ["pageBreak", "paragraphFormat"],
            "toolbarButtons": ["pageBreak"]
        },
        "cssRequired": true,
        "isNew": true,
        "initialContent": "<h1>Page Breaks</h1><p>This is the content on page 1. Place your cursor here and click the Page Break button to move the following text to a new page.</p><p>This content will move to page 2.</p>"
    },
    {
        "id": "paragraphFormat",
        "title": "Paragraph Format",
        "description": "Format paragraphs with headings, blockquotes, and code blocks.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/paragraph-format-plugin/",
        "config": {
            "pluginsEnabled": ["paragraphFormat"],
            "toolbarButtons": ["paragraphFormat"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><p>Normal paragraph.</p><blockquote>Blockquote.</blockquote><pre>Code block.</pre>"
    },
    {
        "id": "paragraphStyle",
        "title": "Paragraph Style",
        "description": "Apply custom CSS styles to paragraphs for unique formatting.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/paragraph-style-plugin/",
        "config": {
            "pluginsEnabled": ["paragraphStyle", "paragraphFormat"],
            "toolbarButtons": ["paragraphStyle"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Paragraph Style</h1><p>Select this paragraph and apply a custom style from the toolbar (e.g. gray box).</p>"
    },
    {
        "id": "quickInsert",
        "title": "Quick Insert",
        "description": "Quickly add images, tables, and media with a convenient popup menu.",
        "category": "Structure & Layout",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/quick-insert-plugin/",
        "config": {
            "pluginsEnabled": ["quickInsert", "image", "table", "video", "paragraphFormat"],
            "toolbarButtons": []
        },
        "cssRequired": false,
        "initialContent": "<h1>Quick Insert</h1><p>Move your mouse to the beginning of the empty line below to see the Quick Insert (+) button.</p><p><br></p><p>It works on any empty block!</p>"
    },
    {
        "id": "quote",
        "title": "Quote",
        "description": "Increase or decrease quote indentation levels for nested quotations.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/quote-plugin/",
        "config": {
            "pluginsEnabled": ["quote", "paragraphFormat"],
            "toolbarButtons": ["quote"]
        },
        "cssRequired": false,
        "initialContent": "<blockquote><p>\"Design is not just what it looks like and feels like. Design is how it works.\"</p><footer>- Steve Jobs</footer></blockquote>"
    },
    {
        "id": "save",
        "title": "Save",
        "description": "Save editor content directly to your server with a single click.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/save-plugin/",
        "config": {
            "pluginsEnabled": ["save", "paragraphFormat"],
            "toolbarButtons": ["save"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Save Action</h1><p>Edit this text and click the Save icon in the toolbar to trigger a save event (check your console).</p>"
    },
    {
        "id": "specialCharacters",
        "title": "Special Characters",
        "description": "Insert symbols, mathematical operators, and international characters easily.",
        "category": "Text & Formatting",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/special-characters-plugin/",
        "config": {
            "pluginsEnabled": ["specialCharacters", "paragraphFormat"],
            "toolbarButtons": ["specialCharacters"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Special Characters</h1><p>Need a symbol? © ™ € £ ¥ ®. Click the Omega (Ω) icon to insert more.</p>"
    },
    {
        "id": "spellChecker",
        "title": "Spell Checker",
        "description": "Check spelling and grammar with real-time error detection and corrections.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/spell-checker-plugin/",
        "config": {
            "pluginsEnabled": ["spellChecker", "paragraphFormat"],
            "toolbarButtons": ["spellChecker"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Spell Checker</h1><p>This sentense has some mispeled words. You should see them underlined in red.</p>"
    },
    {
        "id": "table",
        "title": "Table",
        "description": "Create and edit tables with advanced formatting and styling options.",
        "category": "Structure & Layout",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/table-plugin/",
        "config": {
            "pluginsEnabled": ["table", "paragraphFormat"],
            "toolbarButtons": ["insertTable"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Table Example</h1><table style='width: 100%; border: 1px solid #ddd; border-collapse: collapse;'><thead><tr><th style='border: 1px solid #ddd; padding: 8px;'>Project</th><th style='border: 1px solid #ddd; padding: 8px;'>Status</th><th style='border: 1px solid #ddd; padding: 8px;'>Progress</th></tr></thead><tbody><tr><td style='border: 1px solid #ddd; padding: 8px;'>Website Redesign</td><td style='border: 1px solid #ddd; padding: 8px;'>In Progress</td><td style='border: 1px solid #ddd; padding: 8px;'>60%</td></tr><tr><td style='border: 1px solid #ddd; padding: 8px;'>Mobile App</td><td style='border: 1px solid #ddd; padding: 8px;'>Planned</td><td style='border: 1px solid #ddd; padding: 8px;'>0%</td></tr><tr><td style='border: 1px solid #ddd; padding: 8px;'>Marketing Campaign</td><td style='border: 1px solid #ddd; padding: 8px;'>Completed</td><td style='border: 1px solid #ddd; padding: 8px;'>100%</td></tr></tbody></table>"
    },
    {
        "id": "track_changes",
        "title": "Track Changes",
        "description": "Track, review, and accept or reject document changes like in Word.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/track-changes-plugin/",
        "config": {
            "pluginsEnabled": ["track_changes", "paragraphFormat"],
            "toolbarButtons": ["trackChanges"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Track Changes</h1><p>Enable 'Track Changes' in the toolbar, then start editing this text to see the changes marked.</p>"
    },
    {
        "id": "url",
        "title": "URL",
        "description": "Automatically convert typed URLs into clickable links.",
        "category": "Advanced Features",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/url-plugin/",
        "config": {
            "pluginsEnabled": ["url", "paragraphFormat"],
            "toolbarButtons": []
        },
        "cssRequired": false,
        "initialContent": "<h1>Auto URL</h1><p>Type a URL like https://froala.com and press space. It will automatically become a link!</p>"
    },
    {
        "id": "video",
        "title": "Video",
        "description": "Embed and manage videos from YouTube, Vimeo, and other sources.",
        "category": "Media & Embeds",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/video-plugin/",
        "config": {
            "pluginsEnabled": ["video", "paragraphFormat"],
            "toolbarButtons": ["insertVideo"]
        },
        "cssRequired": false,
        "initialContent": "<h1>Video Embedding</h1><p>Insert a video from YouTube or Vimeo to see how it looks:</p>"
    },
    {
        "id": "wordCounter",
        "title": "Word Counter",
        "description": "Display real-time word and character count while editing.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/word-counter-plugin/",
        "config": {
            "pluginsEnabled": ["wordCounter", "paragraphFormat"],
            "toolbarButtons": []
        },
        "cssRequired": false,
        "initialContent": "<h1>Word Counter</h1><p>Keep an eye on the bottom right corner. It counts words as you type!</p>"
    },
    {
        "id": "wordPaste",
        "title": "Word Paste",
        "description": "Paste content from Microsoft Word with clean HTML formatting.",
        "category": "Editing Tools",
        "docsUrl": "https://froala.com/wysiwyg-editor/docs/plugins/word-paste-plugin/",
        "config": {
            "pluginsEnabled": ["wordPaste", "paragraphFormat"],
            "toolbarButtons": []
        },
        "cssRequired": false,
        "initialContent": "<h1>Word Paste</h1><p>Copy some complex content from Microsoft Word and paste it here. It will be cleaned and formatted perfectly.</p>"
    },
    {
        "id": "codeMirror",
        "title": "Code Mirror (Code View)",
        "description": "Enhanced code editing with syntax highlighting using CodeMirror.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/code-mirror/",
        "config": {
            "pluginsEnabled": ["codeView", "paragraphFormat"],
            "toolbarButtons": ["html"]
        },
        "cssRequired": true,
        "initialContent": "<h1>Code Mirror</h1><p>Click the <code>&lt;/&gt;</code> button to see syntax highlighting in action.</p>"
    },
    {
        "id": "codox",
        "title": "Codox Real-time",
        "description": "Real-time collaborative editing with co-cursors and presence.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/codox-real-time-editing/",
        "config": {
            "pluginsEnabled": ["paragraphFormat", "image", "table"],
            "toolbarButtons": ["bold", "italic", "|", "image", "table"],
            "events": {
                "initialized": function() {
                    if (typeof Codox !== 'undefined') {
                        const editor = this;
                        const codox = new Codox();
                        codox.init({
                            "app": "froala",
                            "docId": "demo-doc-" + Math.random().toString(36).substr(2, 9),
                            "username": "User-" + Math.random().toString(36).substr(2, 5),
                            "editor": editor,
                            "apiKey": "d5bb1f48-356b-4032-8d0c-ba1a79396f79"
                        });
                        console.log('Codox initialized');
                    } else {
                        console.warn('Codox script not loaded.');
                    }
                }
            }
        },
        "cssRequired": true,
        "initialContent": "<h1>Real-time Collaboration</h1><p>Open this page in another window (if you could) to see real-time updates.</p>"
    },
    {
        "id": "tui",
        "title": "TUI Image Editor",
        "description": "Advanced image editing features including filters, cropping, and drawing.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/tui-advanced-image-editor/",
        "config": {
            "pluginsEnabled": ["image", "imageTUI", "paragraphFormat"],
            "toolbarButtons": ["insertImage"],
            "imageTUIOptions": {
                "includeUI": {
                    "initMenu": "filter",
                    "menuBarPosition": "left",
                    "uiSize": {
                        "width": "100%",
                        "height": "100%"
                    }
                }
            }
        },
        "cssRequired": true,
        "initialContent": "<h1>Advanced Image Editor</h1><p>Click the image below and select the 'Advanced Edit' (magic wand) icon.</p><br><img src='https://froala.com/assets/editor/docs/photo14.jpg' class='fr-fic fr-dib' alt='TUI Example' style='width: 400px;'>"
    },
    {
        "id": "tribute",
        "title": "Tribute.js",
        "description": "Native ES6 @mention implementation.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/tribute-js/",
        "config": {
            "pluginsEnabled": ["paragraphFormat"],
            "events": {
                "initialized": function() {
                    if (typeof Tribute !== 'undefined') {
                        var tribute = new Tribute({
                            values: [
                                { key: 'Phil', value: 'pheartman' },
                                { key: 'Gordon', value: 'gramsey' },
                                { key: 'Jacob', value: 'jacob' },
                                { key: 'Ethan', value: 'ethan' },
                                { key: 'Emma', value: 'emma' },
                                { key: 'Isabella', value: 'isabella' }
                            ],
                            selectTemplate: function (item) {
                                return '<span class="fr-deletable fr-tribute" contenteditable="false">@' + item.original.key + '</span>';
                            }
                        });
                        tribute.attach(this.el);
                        console.log('Tribute attached');
                    }
                }
            }
        },
        "cssRequired": true,
        "initialContent": "<h1>Mentions</h1><p>Type @ to trigger the mentions popup (e.g. @Phil, @Gordon).</p>"
    },
    {
        "id": "wsc",
        "title": "Web Spell Checker",
        "description": "Professional proofreading tool for spelling and grammar.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/web-spell-checker/",
        "config": {
            "pluginsEnabled": ["paragraphFormat"],
            "events": {
                "initialized": function() {
                    if (typeof WEBSPELLCHECKER !== 'undefined') {
                        WEBSPELLCHECKER.init({
                            container: this.el
                        });
                    }
                }
            }
        },
        "cssRequired": false,
        "initialContent": "<h1>Proofreading</h1><p>This paragraph contains some mispelled wordz and grammar errors for the proofreader to catch.</p>"
    },
    {
        "id": "wiris",
        "title": "MathType (Wiris)",
        "description": "Type and edit complex mathematical equations and chemical formulas.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/wiris/",
        "config": {
            "pluginsEnabled": ["wiris", "paragraphFormat"],
            "toolbarButtons": ["wirisEditor", "wirisChemistry"],
            "imageEditButtons": ["wirisEditor", "wirisChemistry", "imageDisplay", "imageAlign", "imageInfo", "imageRemove"],
            "htmlAllowedTags": [".*"],
            "htmlAllowedAttrs": [".*"]
        },
        "cssRequired": false,
        "initialContent": "<h1>MathType</h1><p>Eq 1: <math xmlns='http://www.w3.org/1998/Math/MathML'><msqrt><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup></msqrt></math></p><p>Click the square root icon in the toolbar.</p>"
    },
    {
        "id": "multilingual",
        "title": "Multilingual",
        "description": "Translate content directly within the editor.",
        "category": "Integrations",
        "docsUrl": "https://froala.com/wysiwyg-editor/examples/multilingual-translation/",
        "config": {
            "pluginsEnabled": ["paragraphFormat"],
            "toolbarButtons": ["translate"],
            "events": {
                "initialized": function() {
                    const editor = this;
                    // Mock Translation Logic
                    FroalaEditor.RegisterCommand('translate', {
                        title: 'Translate',
                        icon: 'fa fa-language',
                        type: 'dropdown',
                        focus: false,
                        undo: true,
                        refreshAfterCallback: true,
                        options: {
                            'fr': 'French',
                            'de': 'German',
                            'es': 'Spanish',
                            'en': 'English'
                        },
                        callback: function (cmd, val) {
                            const mockTranslations = {
                                'fr': "<h1>Traduction Multilingue</h1><p>Traduire le contenu directement dans l'éditeur.</p>",
                                'de': "<h1>Mehrsprachige Übersetzung</h1><p>Übersetzen Sie Inhalte direkt im Editor.</p>",
                                'es': "<h1>Traducción Multilingüe</h1><p>Traducir contenido directamente dentro del editor.</p>",
                                'en': "<h1>Multilingual Translation</h1><p>Translate content directly within the editor.</p>"
                            };
                            if (mockTranslations[val]) {
                                this.html.set(mockTranslations[val]);
                            } else {
                                alert('Translation service requires API key. Mocking response.');
                            }
                        }
                    });
                }
            }
        },
        "cssRequired": false,
        "initialContent": "<h1>Multilingual Translation</h1><p>Translate content directly within the editor.</p>"
    }
];
