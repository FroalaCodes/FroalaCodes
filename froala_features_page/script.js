import { plugins } from './js/plugins_data.js';

document.addEventListener('DOMContentLoaded', () => {
    const pluginsGrid = document.getElementById('plugins-grid');
    const demoContainer = document.getElementById('editor-demo-container');
    const closeDemoBtn = document.getElementById('close-demo');
    const demoTitle = document.getElementById('demo-title');
    const demoDesc = document.getElementById('demo-desc');
    const demoDocsLink = document.getElementById('demo-docs-link');
    const searchInput = document.getElementById('plugin-search');
    const navLinks = document.querySelectorAll('.nav-tab');
    let editorInstance = null;
    let allPlugins = plugins;

    const categoryOrder = [
        "Text & Formatting",
        "Media & Embeds",
        "Structure & Layout",
        "Editing Tools",
        "Advanced Features",
        "Integrations"
    ];

    // Render Plugins
    function renderPlugins(pluginsToRender = allPlugins) {
        pluginsGrid.innerHTML = '';
        if (pluginsToRender.length === 0) {
            // Don't show message here - it will be handled by the search function
            // which checks all sections before showing "no results"
            return;
        }

        // Grouping
        const groups = {};
        categoryOrder.forEach(cat => groups[cat] = []);
        
        // Helper for 'Other' or uncategorized
        groups['Other'] = [];

        pluginsToRender.forEach(plugin => {
            const cat = plugin.category || 'Other';
            if (groups[cat]) {
                groups[cat].push(plugin);
            } else {
                groups['Other'].push(plugin);
            }
        });

        // Render in Order
        [...categoryOrder, 'Other'].forEach(cat => {
            const groupPlugins = groups[cat];
            if (groupPlugins && groupPlugins.length > 0) {
                // Category Descriptions for SEO
                const categoryDescriptions = {
                    "Text & Formatting": "Empower users with precise control over typography and style. From font selection to inline styling, ensure every word looks perfect.",
                    "Media & Embeds": "Bring content to life with powerful media tools. Seamlessly handle images, videos, and files to create immersive, visually stunning experiences.",
                    "Structure & Layout": "Organize information effectively. Provide robust tools for creating complex tables, lists, and structured layouts with intuitive ease.",
                    "Editing Tools": "Enhance efficiency and workflow. Features like spell checking, character counts, and track changes help users write better and faster.",
                    "Advanced Features": "Advanced tools for total control. Access code view, markdown support, and debugging features designed to meet developer needs.",
                    "Integrations": "Expand capabilities with seamless integrations. Connect Froala with industry-leading tools for real-time editing, math equations, and more."
                };

                // Render Header
                const slug = cat.toLowerCase().replace(/ /g, '-').replace(/&/g, 'and');
                const headerGroup = document.createElement('div');
                headerGroup.className = 'category-group-header';
                
                const header = document.createElement('h3');
                header.className = 'category-header';
                header.id = `cat-${slug}`;
                header.textContent = cat;
                
                const desc = document.createElement('p');
                desc.className = 'category-description';
                desc.textContent = categoryDescriptions[cat] || "Explore our features.";

                headerGroup.appendChild(header);
                headerGroup.appendChild(desc);
                pluginsGrid.appendChild(headerGroup);

                // Icon Mapping
                const iconMap = {
                    'align': 'fas fa-align-left',
                    'charCounter': 'fas fa-calculator',
                    'codeBeautifier': 'fas fa-code',
                    'codeView': 'fas fa-code',
                    'colors': 'fas fa-palette',
                    'draggable': 'fas fa-arrows-alt',
                    'embedly': 'fas fa-share-alt',
                    'emoticons': 'far fa-smile',
                    'entities': 'fas fa-subscript',
                    'exportToWord': 'fas fa-file-word',
                    'file': 'fas fa-paperclip',
                    'filesManager': 'fas fa-folder-open',
                    'filestack': 'fas fa-cloud-upload-alt',
                    'findReplace': 'fas fa-search',
                    'fontAwesome': 'fab fa-font-awesome',
                    'fontFamily': 'fas fa-font',
                    'fontSize': 'fas fa-text-height',
                    'fullscreen': 'fas fa-expand',
                    'help': 'fas fa-question-circle',
                    'image': 'far fa-image',
                    'imageManager': 'fas fa-images',
                    'inlineClass': 'fas fa-css3-alt',
                    'inlineStyle': 'fas fa-paint-brush',
                    'lineBreaker': 'fas fa-level-down-alt',
                    'lineHeight': 'fas fa-arrows-alt-v',
                    'link': 'fas fa-link',
                    'linkToAnchor': 'fas fa-anchor',
                    'lists': 'fas fa-list-ul',
                    'markdown': 'fab fa-markdown',
                    'pageBreak': 'fas fa-cut',
                    'paragraphFormat': 'fas fa-heading',
                    'paragraphStyle': 'fas fa-paragraph',
                    'quickInsert': 'fas fa-plus-circle',
                    'quote': 'fas fa-quote-right',
                    'save': 'fas fa-save',
                    'specialCharacters': 'fas fa-euro-sign',
                    'spellChecker': 'fas fa-check',
                    'table': 'fas fa-table',
                    'track_changes': 'fas fa-history',
                    'url': 'fas fa-globe',
                    'video': 'fas fa-video',
                    'wordCounter': 'fas fa-sort-numeric-down',
                    'wordPaste': 'fas fa-paste',
                    'codeMirror': 'fas fa-code',
                    'codox': 'fas fa-users',
                    'tui': 'fas fa-magic',
                    'tribute': 'fas fa-at',
                    'wsc': 'fas fa-spell-check',
                    'wiris': 'fas fa-square-root-alt',
                    'multilingual': 'fas fa-language'
                };

                // Render Cards
                groupPlugins.forEach(plugin => {
                    const isThirdParty = plugin.category === '3rd Party Plugins';
                    const card = document.createElement('div');
                    card.className = plugin.isNew ? 'feature-card new-card' : 'feature-card';
                    
                    const buttonText = isThirdParty ? 'View Example' : 'Try it now';
                    const iconClass = isThirdParty ? 'fas fa-external-link-alt' : 'fas fa-arrow-right';
                    const isFilestack = plugin.id === 'filestack';
                    
                    let iconHtml;
                    if (isFilestack) {
                        iconHtml = `<div class="card-icon" style="background: transparent; padding: 0;"><img src="assets/filestack_logo.png" alt="Filestack" style="width: 100%; height: 100%; object-fit: contain;"></div>`;
                    } else {
                        const cardIcon = iconMap[plugin.id] || 'fas fa-cube';
                        iconHtml = `<div class="card-icon"><i class="${cardIcon}"></i></div>`;
                    }
                    
                    card.innerHTML = `
                        <div class="card-header">
                            ${iconHtml}
                            <h4>${plugin.title}</h4>
                            ${plugin.isNew ? '<span class="new-badge">New</span>' : ''}
                        </div>
                        <p>${plugin.description}</p>
                        <div class="card-footer">
                            <span>${buttonText} <i class="${iconClass}"></i></span>
                        </div>
                    `;
                    
                    if (isThirdParty) {
                        card.addEventListener('click', () => {
                            window.open(plugin.docsUrl, '_blank');
                        });
                    } else {
                        card.addEventListener('click', () => openDemo(plugin));
                    }
                    pluginsGrid.appendChild(card);
                });
            }
        });
    }

    // Semantic keyword mapping for intelligent search
    const semanticKeywords = {
        'align': [
        'alignment', 'justify', 'center', 'left', 'right', 'text align', 
        'paragraph align', 'justify text', 'center text', 'left align', 
        'right align', 'text position', 'positioning', 'orientation', 
        'flush left', 'flush right', 'centering', 'indentation', 'layout', 
        'text flow', 'horizontal align', 'text placement', 'justification'
    ],
    'charCounter': [
        'character', 'count', 'limit', 'length', 'word count', 'char limit', 
        'character limit', 'counting', 'character counter', 'text length', 
        'max characters', 'counter', 'input size', 'text metrics', 
        'capacity', 'remaining characters', 'usage tracker', 'input limit', 
        'validation', 'length check', 'character tracking'
    ],
    'codeBeautifier': [
        'format', 'beautify', 'indent', 'html', 'code formatting', 
        'pretty print', 'code format', 'beautifier', 'format code', 
        'clean code', 'organize code', 'code cleanup', 'syntax formatting', 
        'indentation fixer', 'source cleanup', 'html tidy', 'structure code', 
        'readability', 'prettifier', 'auto format', 'style fixer'
    ],
    'codeView': [
        'html', 'source', 'code', 'markup', 'raw', 'source code', 
        'html view', 'code editor', 'view source', 'edit html', 
        'raw html', 'html editor', 'developer mode', 'markup editor', 
        'tag view', 'inspect element', 'coding mode', 'text editor', 
        'backend view', 'source editing', 'syntax view', 'raw text'
    ],
    'colors': [
        'color', 'background', 'text color', 'highlight', 'picker', 
        'color picker', 'background color', 'font color', 'text highlight', 
        'highlighter', 'coloring', 'paint', 'hex color', 'rgb', 
        'palette', 'shade', 'tint', 'hue', 'saturation', 
        'foreground color', 'swatch', 'color selection', 'text shading', 
        'fill color', 'opacity', 'custom color'
    ],
    'draggable': [
        'drag', 'drop', 'move', 'reorder', 'drag and drop', 'draggable', 
        'rearrange', 'drag content', 'move content', 'reposition', 'dnd', 
        'sort', 'sortable', 'shift', 'grab', 'handle', 
        'movable elements', 'interactive move', 'layout adjustment', 
        'slide', 'organize', 'shuffle'
    ],
    'filestack': [
        'upload', 'file upload', 'image upload', 'cloud', 'storage', 
        'facebook', 'instagram', 'google drive', 'dropbox', 'cloud storage', 
        'cdn', 'cloud upload', 'social upload', 'import from', 'cloud files', 
        'remote upload', 'external upload', 'third party upload', 
        'asset picker', 'remote files', 'content delivery', 'cloud import', 
        'media fetch', 'social import', 'drive integration'
    ],
    'embedly': [
        'embed', 'url', 'youtube', 'twitter', 'social media', 'rich media', 
        'embed content', 'embed url', 'video embed', 'social embed', 
        'media embed', 'iframe', 'oembed', 'preview', 'link preview', 
        'rich snippet', 'content card', 'integration', 'third party content', 
        'url expansion', 'media card', 'social integration', 'smart embed'
    ],
    'emoticons': [
        'emoji', 'emoticon', 'smiley', 'icon', 'emojis', 'smileys', 
        'emoticons', 'faces', 'reactions', 'unicode emoji', 
        'stickers', 'pictographs', 'facial expressions', 'moods', 
        'graphics', 'symbols', 'expressive icons', 'glyphs', 'avatar'
    ],
    'entities': [
        'html entities', 'special characters', 'escape', 'encode', 
        'html encode', 'character encoding', 'entity encoding', 
        'escape html', 'sanitize', 'html safe', 'string escape', 
        'text cleaning', 'reserved characters', 'markup encoding', 
        'security', 'xss prevention', 'input sanitization'
    ],
    'exportToWord': [
        'export', 'word', 'download', 'doc', 'docx', 'microsoft', 
        'microsoft word', 'save as word', 'word document', 'export doc', 
        'word export', 'download doc', 'ms word', 'convert to word', 
        'document conversion', 'offline copy', 'report generation', 
        'office export', 'save to disk', 'file export'
    ],
    'file': [
        'file', 'upload', 'attachment', 'document', 'pdf', 'file upload', 
        'attach file', 'upload file', 'file attachment', 'attach', 
        'attachments', 'documents', 'upload document', 'resource', 
        'binary', 'data file', 'downloadable', 'linked file', 
        'insert file', 'media attachment', 'file embedding'
    ],
    'filesManager': [
        'file manager', 'browse files', 'media library', 'file browser', 
        'manage files', 'file gallery', 'uploaded files', 'file management', 
        'browse uploads', 'server files', 'directory', 'folder view', 
        'asset library', 'file explorer', 'server browser', 'media organizer', 
        'file list', 'storage view'
    ],
    'findReplace': [
        'find', 'replace', 'search', 'substitute', 'find and replace', 
        'search and replace', 'find text', 'replace text', 'search replace', 
        'text search', 'text replace', 'batch edit', 'global replace', 
        'query', 'text modification', 'swap text', 'lookup', 
        'pattern match', 'search tool', 'replace all'
    ],
    'fontAwesome': [
        'icon', 'font awesome', 'symbol', 'icons', 'fa icon', 
        'font icon', 'web icon', 'vector icon', 'icon font', 
        'glyph', 'scalable vector', 'ui icons', 'symbolic font', 
        'icon library', 'graphics', 'interface icons', 'svg icons'
    ],
    'fontFamily': [
        'font', 'typeface', 'typography', 'font family', 'font type', 
        'text font', 'change font', 'font style', 'fonts', 
        'font face', 'text appearance', 'lettering style', 
        'font selection', 'serif', 'sans-serif', 'script', 'typography design'
    ],
    'fontSize': [
        'size', 'font size', 'text size', 'large', 'small', 
        'text scale', 'font scale', 'bigger', 'smaller', 'resize text', 
        'text height', 'font height', 'typography size', 'text dimension', 
        'scaling', 'points', 'px', 'readability', 'zoom text', 'enlarge'
    ],
    'fullscreen': [
        'fullscreen', 'maximize', 'expand', 'full screen', 'maximized', 
        'distraction free', 'focus mode', 'zen mode', 'fullscreen mode', 
        'whole screen', 'wide view', 'canvas maximize', 'enlarge view', 
        'focus view', 'expanded mode', 'presentation mode'
    ],
    'help': [
        'help', 'keyboard shortcuts', 'shortcuts', 'hotkeys', 'help menu', 
        'documentation', 'tips', 'assistance', 'guide', 'manual', 
        'instructions', 'support', 'key bindings', 'usage guide', 
        'tutorial', 'command list', 'cheat sheet', 'reference'
    ],
    'image': [
        'image', 'picture', 'photo', 'upload image', 'resize', 'crop', 
        'img', 'insert image', 'add image', 'image upload', 'pic', 
        'photograph', 'graphics', 'resize image', 'crop image', 
        'image editor', 'edit image', 'image manipulation', 'visual', 
        'artwork', 'snapshot', 'figure', 'illustration', 'embedding'
    ],
    'imageManager': [
        'image manager', 'gallery', 'media library', 'browse images', 
        'image gallery', 'image library', 'photo gallery', 'image browser', 
        'manage images', 'uploaded images', 'photo organizer', 
        'media storage', 'visual assets', 'server images', 'album', 
        'grid view', 'thumbnail view', 'select image'
    ],
    'inlineClass': [
        'class', 'css class', 'style', 'inline class', 'custom class', 
        'apply class', 'css styling', 'html class', 'span style', 
        'text classifier', 'custom attribute', 'style tag', 
        'semantic style', 'element class', 'add class', 'formatting class'
    ],
    'inlineStyle': [
        'style', 'css', 'formatting', 'inline style', 'custom style', 
        'css style', 'apply style', 'custom css', 'direct styling', 
        'manual format', 'text decoration', 'css attribute', 
        'visual override', 'local style', 'style attribute'
    ],
    'lineBreaker': [
        'line break', 'paragraph', 'separator', 'break line', 'new line', 
        'line separator', 'insert line', 'paragraph break', 'soft return', 
        'divider', 'spacing', 'carriage return', 'split line', 
        'vertical space', 'text break', 'horizontal rule'
    ],
    'lineHeight': [
        'line height', 'spacing', 'leading', 'line spacing', 
        'vertical spacing', 'space between lines', 'text spacing', 
        'paragraph spacing', 'text density', 'vertical rhythm', 
        'readability spacing', 'line distance', 'text gap', 'row height'
    ],
    'link': [
        'link', 'hyperlink', 'url', 'anchor', 'insert link', 
        'add link', 'create link', 'web link', 'external link', 
        'href', 'clickable', 'redirection', 'web address', 
        'path', 'pointer', 'connection', 'reference'
    ],
    'linkToAnchor': [
        'anchor', 'jump', 'internal link', 'bookmark', 'jump to', 
        'anchor link', 'page anchor', 'section link', 'internal anchor', 
        'jump link', 'table of contents', 'page navigation', 'hash link', 
        'scroll to', 'target link', 'in-page link', 'section jump'
    ],
    'lists': [
        'list', 'bullet', 'numbered', 'ordered', 'unordered', 
        'bullet list', 'numbered list', 'ol', 'ul', 'bulleted', 
        'bullets', 'numbering', 'list items', 'checklist', 
        'points', 'enumeration', 'steps', 'series', 'outline', 
        'itemization', 'todo list'
    ],
    'markdown': [
        'markdown', 'md', 'markup', 'markdown syntax', 'markdown editor', 
        'markdown mode', 'md format', 'markdown formatting', 
        'lightweight markup', 'text-to-html', 'plain text format', 
        'commonmark', 'gfm', 'writing mode', 'simplified formatting'
    ],
    'pageBreak': [
        'page break', 'separator', 'print', 'new page', 'break page', 
        'page separator', 'print break', 'pagination', 'new sheet', 
        'print layout', 'split page', 'pdf break', 'divider', 'hard break'
    ],
    'paragraphFormat': [
        'heading', 'paragraph', 'blockquote', 'format', 'h1', 'h2', 'h3', 
        'header', 'headers', 'paragraph format', 'text format', 
        'block format', 'code block', 'pre', 'text structure', 
        'block style', 'typography hierarchy', 'title', 'subtitle', 
        'section header', 'text block'
    ],
    'paragraphStyle': [
        'paragraph style', 'block style', 'custom paragraph', 
        'paragraph formatting', 'block styling', 'box style', 
        'container style', 'text box formatting', 'custom block', 
        'layout style', 'div style', 'wrapper style'
    ],
    'quickInsert': [
        'quick insert', 'add', 'insert', 'quick add', 'fast insert', 
        'easy insert', 'insert menu', 'plus button', 'shortcut menu', 
        'context menu', 'smart insert', 'floating menu', 'action menu', 
        'add block', 'rapid insert', 'helper menu'
    ],
    'quote': [
        'quote', 'blockquote', 'citation', 'quotation', 'quoted text', 
        'cite', 'block quote', 'excerpt', 'testimonial', 'reference text', 
        'indentation quote', 'saying', 'speech', 'pull quote'
    ],
    'save': [
        'save', 'submit', 'store', 'save content', 'submit content', 
        'save changes', 'persist', 'update', 'record', 'commit', 
        'send data', 'keep', 'store data', 'upload changes', 'sync'
    ],
    'specialCharacters': [
        'special characters', 'symbols', 'unicode', 'copyright', 
        'trademark', 'special chars', 'character map', 'insert symbol', 
        'omega', 'special symbols', '©', '™', '®', 'currency', 
        'math symbols', 'glyphs', 'foreign characters', 'accents', 
        'punctuation', 'arrows', 'shapes'
    ],
    'spellChecker': [
        'spell', 'spelling', 'grammar', 'spellcheck', 'spell check', 
        'grammar check', 'proofread', 'spelling check', 'typo', 
        'typos', 'spelling error', 'correction', 'auto correct', 
        'language check', 'proofing tool', 'text review', 'red underline', 
        'error detection', 'writing aid'
    ],
    'table': [
        'table', 'grid', 'rows', 'columns', 'cells', 'insert table', 
        'create table', 'data table', 'spreadsheet', 'tabular', 
        'table editor', 'matrix', 'data grid', 'structured data', 
        'row', 'column', 'cell merge', 'table layout', 'chart data'
    ],
    'track_changes': [
        'track changes', 'revision', 'history', 'review', 'track edits', 
        'change tracking', 'document review', 'edit tracking', 
        'revision history', 'changes', 'audit trail', 'version control', 
        'diff', 'suggestions', 'collaborative review', 'markup view', 
        'editor log', 'change log'
    ],
    'url': [
        'url', 'auto link', 'automatic', 'auto url', 'automatic link', 
        'link conversion', 'url detection', 'web address recognizer', 
        'hyperlink detector', 'text to link', 'magic link', 
        'address formatting', 'path detection'
    ],
    'video': [
        'video', 'youtube', 'vimeo', 'embed video', 'insert video', 
        'video embed', 'video player', 'media', 'movie', 'clip', 
        'video upload', 'streaming', 'film', 'motion picture', 
        'mp4', 'webm', 'multimedia', 'play', 'visual content'
    ],
    'wordCounter': [
        'word count', 'character count', 'count', 'word counter', 
        'counter', 'count words', 'word limit', 'character counter', 
        'text stats', 'statistics', 'volume', 'writing metrics', 
        'text analysis', 'length check', 'content size', 'data metrics'
    ],
    'wordPaste': [
        'paste', 'word', 'microsoft word', 'clean paste', 
        'paste from word', 'word paste', 'copy paste', 'paste content', 
        'paste text', 'import from word', 'strip formatting', 
        'clean html', 'office paste', 'format remover', 'plain text paste', 
        'clipboard cleanup', 'word cleanup'
    ],
    'codeMirror': [
        'code mirror', 'syntax highlighting', 'code editor', 'codemirror', 
        'code coloring', 'syntax coloring', 'code view', 'advanced code', 
        'ide', 'script editor', 'programming view', 'textmate', 
        'source highlighter', 'developer editor', 'line numbers', 
        'code folding', 'bracket matching'
    ],
    'codox': [
        'collaboration', 'real-time', 'co-editing', 'multiplayer', 
        'collaborative', 'co-authoring', 'real time editing', 'live editing', 
        'shared editing', 'team editing', 'simultaneous editing', 
        'sync', 'google docs style', 'cursors', 'remote collaboration', 
        'group edit', 'live sync', 'presence'
    ],
    'tui': [
        'image editor', 'advanced editing', 'filters', 'crop', 'draw', 
        'image manipulation', 'photo editor', 'edit photo', 'image filters', 
        'crop image', 'drawing', 'advanced image', 'tui editor', 
        'photo effects', 'masking', 'rotation', 'flip', 'brightness', 
        'contrast', 'canvas editor', 'annotate image'
    ],
    'tribute': [
        'mention', 'at mention', '@mention', 'autocomplete', 'mentions', 
        'tag user', 'tag people', '@', 'user mention', 'auto complete', 
        'referencing', 'tagging', 'user lookup', 'context menu', 
        'suggestions', 'name completion', 'handle'
    ],
    'wsc': [
        'spell checker', 'proofreading', 'grammar', 'web spell checker', 
        'spell check', 'grammar check', 'advanced spell', 'proofread', 
        'server side spell check', 'language correction', 'dictionary', 
        'thesaurus', 'writing assistant', 'text validation', 'proofing'
    ],
    'wiris': [
        'math', 'equation', 'formula', 'mathtype', 'chemistry', 
        'mathematical', 'equations', 'formulas', 'math editor', 
        'latex', 'chemical formula', 'science', 'stem', 
        'calculus', 'algebra', 'scientific notation', 'math symbols', 
        'equation builder', 'scientific editor'
    ],
    'multilingual': [
        'translate', 'translation', 'language', 'multilingual', 
        'translator', 'multi language', 'localization', 'i18n', 
        'internationalization', 'locale', 'globalization', 
        'language switcher', 'l10n', 'native text', 'dialect', 
        'ui language', 'text direction'
    ]
    };

    // Intelligent search function
    function matchesSearch(plugin, searchTerm) {
        // Direct match in title or description
        if (plugin.title.toLowerCase().includes(searchTerm) ||
            plugin.description.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Semantic keyword match
        const keywords = semanticKeywords[plugin.id] || [];
        return keywords.some(keyword => keyword.includes(searchTerm) || searchTerm.includes(keyword));
    }

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        // 1. Filter Plugins
        let hasPluginResults = false;
        if (!searchTerm) {
            renderPlugins(allPlugins);
            hasPluginResults = true;
        } else {
            const filtered = allPlugins.filter(plugin => matchesSearch(plugin, searchTerm));
            renderPlugins(filtered);
            hasPluginResults = filtered.length > 0;
        }

        // Helper to filter static lists (Frameworks, SDKs, APIs)
        const filterSection = (sectionId, itemSelector) => {
            const section = document.getElementById(sectionId);
            if (!section) return false;

            const items = section.querySelectorAll(itemSelector);
            let hasVisibleItems = false;

            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const isMatch = !searchTerm || text.includes(searchTerm);
                item.style.display = isMatch ? '' : 'none';
                if (isMatch) hasVisibleItems = true;
            });

            // Hide the entire section if no items match
            section.style.display = (hasVisibleItems || !searchTerm) ? '' : 'none';
            return hasVisibleItems;
        };

        // 2. Filter Frameworks
        const hasFrameworkResults = filterSection('frameworks-section', '.framework-item');

        // 3. Filter SDKs
        const hasSDKResults = filterSection('sdks-section', '.framework-item');

        // 4. Filter Accessibility
        const hasAccessibilityResults = filterSection('accessibility-section', '.api-card');

        // 5. Filter API
        const hasAPIResults = filterSection('api-section', '.api-card');

        // Check if there are any results at all
        const hasAnyResults = hasPluginResults || hasFrameworkResults || hasSDKResults || hasAccessibilityResults || hasAPIResults;

        // Show/hide no results message
        if (searchTerm && !hasAnyResults) {
            pluginsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No results found matching your search.</p>';
        }
    });

    // Navigation Active State
    function updateActiveNav() {
        // Include both main sections and category headers
        const sections = document.querySelectorAll('section[id], header[id], #plugins-grid');
        const categoryHeaders = document.querySelectorAll('.category-header[id]');
        const scrollPos = window.scrollY + 150;

        // Remove active class from all nav links
        const allNavLinks = document.querySelectorAll('.nav-tab, .nav-child-tab');

        let activeSection = null;
        let activeCategoryHeader = null;

        // Check main sections
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                activeSection = sectionId;
            }
        });

        // Check category headers (they're within plugins-grid)
        categoryHeaders.forEach(header => {
            const headerTop = header.offsetTop;
            const headerParent = header.closest('.category-group-header');
            const nextHeader = headerParent?.nextElementSibling;

            // Calculate height until next category or end of container
            let headerHeight = 300; // default fallback
            if (nextHeader && nextHeader.classList.contains('category-group-header')) {
                headerHeight = nextHeader.offsetTop - headerTop;
            }

            if (scrollPos >= headerTop && scrollPos < headerTop + headerHeight) {
                activeCategoryHeader = header.getAttribute('id');
            }
        });

        // Apply active states
        allNavLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');

            // Highlight category child tabs
            if (activeCategoryHeader && href === `#${activeCategoryHeader}`) {
                link.classList.add('active');
                // Also keep parent "Plugins" tab highlighted
                const pluginsTab = document.querySelector('a[href="#plugins-grid"]');
                if (pluginsTab) pluginsTab.classList.add('active');
            }
            // Highlight main section tabs
            else if (activeSection && href === `#${activeSection}` && !activeCategoryHeader) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    window.addEventListener('load', updateActiveNav);

    // Smooth scroll for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Open Demo
    function openDemo(plugin) {
        // Create modal overlay if it doesn't exist
        let modalOverlay = document.getElementById('modal-overlay');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'modal-overlay';
            modalOverlay.className = 'modal-overlay hidden';
            modalOverlay.appendChild(demoContainer);
            document.body.appendChild(modalOverlay);

            // Close on overlay click
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    closeDemo();
                }
            });
        }

        // Show modal
        modalOverlay.classList.remove('hidden');
        demoContainer.classList.remove('hidden');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        // Update Info
        demoTitle.textContent = plugin.title;
        demoDesc.textContent = plugin.description;
        demoDocsLink.href = plugin.docsUrl;

        // Special handling for Quick Insert layout
        const demoBody = demoContainer.querySelector('.demo-body');
        if (plugin.id === 'quickInsert') {
            demoContainer.style.maxWidth = '1100px';
            if (demoBody) demoBody.style.paddingLeft = '80px';
        } else {
            demoContainer.style.maxWidth = '';
            if (demoBody) demoBody.style.paddingLeft = '';
        }

        // Destroy previous instance if exists
        const editorEl = document.getElementById('froala-editor');

        // Destroy previous instance if exists
        if (editorInstance) {
            editorInstance.destroy();
            editorInstance = null;
        }

        // Set initial content
        editorEl.innerHTML = plugin.initialContent || '<p>Start typing...</p>';

        // Initialize Editor with specific config
        // We use the config generated in plugins_data.js
        // If no specific config, we default to a basic one + the plugin enabled

        const config = plugin.config || {
            pluginsEnabled: [plugin.id],
            toolbarButtons: [plugin.id] // heuristic
        };

        // Build complete toolbar with common buttons + plugin-specific buttons
        const commonToolbarButtons = ['bold', 'italic', 'underline', '|', 'paragraphFormat', '|', 'undo', 'redo'];
        const pluginToolbarButtons = config.toolbarButtons || [];

        // Combine common buttons with plugin-specific buttons
        const fullToolbarButtons = pluginToolbarButtons.length > 0
            ? [...commonToolbarButtons, '|', ...pluginToolbarButtons]
            : commonToolbarButtons;
        
        // Add license key if needed (mocked here or rely on trial)
        
        // Base configuration with license key and common options
        const baseConfig = {
            // Add your license key here (get from https://froala.com/wysiwyg-editor/pricing/)
            key: 'Lc2C1qC1D1D4C3qB12qC8tsE4B-8F3J3A6B8B5D5D2A2di1aaA4cA1lnE1F2nrXYb1VPUGRHYZNRJd1JVOOb1HAc1zSZC1KGD1D1D1A1F1I4A10B1C6E4==',

            // Image upload configuration
            imageUploadURL: '/upload_image',
            imageUploadParams: { id: 'froala_editor' },
            imageManagerLoadURL: '/load_images',
            imageManagerDeleteURL: '/delete_image',

            // File upload configuration
            fileUploadURL: '/upload_file',
            fileUploadParams: { id: 'froala_editor' },

            // Video upload configuration
            videoUploadURL: '/upload_video',
            videoUploadParams: { id: 'froala_editor' },

            // Filestack configuration (required for Filestack plugin)
            filestackOptions: {
                filestackAPI: 'YOUR_FILESTACK_API_KEY_HERE', // Get from https://www.filestack.com/
                uploadToFilestackOnly: false,
                pickerOptions: {
                    maxFiles: 10,
                    accept: ['image/*', 'video/*', 'application/pdf']
                }
            },

            // Save configuration
            saveURL: '/save',
            saveParams: { id: 'froala_editor' },

            // Spell checker configuration
            spellcheck: true,

            // Track changes configuration
            trackChangesEnabled: false,
            showChangesEnabled: false
        };

        // Display-only config (Clean, specific to plugin)
        const finalConfigForDisplay = {
            pluginsEnabled: config.pluginsEnabled,
            toolbarButtons: fullToolbarButtons,
            heightMin: 300,
            placeholderText: `Try the ${plugin.title} feature...`
        };

        // Add specific plugin options if any
        if (plugin.config) {
            Object.keys(plugin.config).forEach(key => {
                if (key !== 'pluginsEnabled' && key !== 'toolbarButtons') {
                    finalConfigForDisplay[key] = plugin.config[key];
                }
            });
        }

        const configCodeEl = document.getElementById('config-code');
        if (configCodeEl) {
            configCodeEl.textContent = JSON.stringify(finalConfigForDisplay, null, 4);
        }

        // Collapse detail view by default
        const detailsEl = document.querySelector('.config-display');
        if (detailsEl) detailsEl.removeAttribute('open');

        // Initialize with full config (Base + Specific)
        editorInstance = new FroalaEditor('#froala-editor', {
            ...baseConfig,
            ...finalConfigForDisplay,
            events: {
                'initialized': function () {
                    console.log(`${plugin.title} initialized`);
                },
                'image.beforeUpload': function (images) {
                    console.log('Image upload started');
                },
                'image.uploaded': function (response) {
                    console.log('Image uploaded:', response);
                },
                'file.beforeUpload': function (files) {
                    console.log('File upload started');
                },
                'file.uploaded': function (response) {
                    console.log('File uploaded:', response);
                },
                'video.beforeUpload': function (videos) {
                    console.log('Video upload started');
                },
                'video.uploaded': function (response) {
                    console.log('Video uploaded:', response);
                },
                'filestack.uploadedToFilestack': function (response) {
                    console.log('Uploaded to Filestack:', response);
                },
                'filestack.uploadFailedToFilestack': function (response) {
                    console.error('Filestack upload failed:', response);
                }
            }
        });
    }

    // Close Demo
    function closeDemo() {
        const modalOverlay = document.getElementById('modal-overlay');
        if (modalOverlay) {
            modalOverlay.classList.add('hidden');
        }
        demoContainer.classList.add('hidden');
        document.body.style.overflow = ''; // Restore background scrolling

        if (editorInstance) {
            editorInstance.destroy();
            editorInstance = null;
        }
    }

    closeDemoBtn.addEventListener('click', closeDemo);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modalOverlay = document.getElementById('modal-overlay');
            if (modalOverlay && !modalOverlay.classList.contains('hidden')) {
                closeDemo();
            }
        }
    });

    // Mobile Menu Toggle Logic
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const sidebar = document.querySelector('.plugins-sidebar');
    
    if (mobileBtn && sidebar) {
        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate closing if body click listener exists
            sidebar.classList.toggle('active');
            
            // Toggle Icon
            const icon = mobileBtn.querySelector('i');
            if (sidebar.classList.contains('active')) {
                icon.className = 'fas fa-times';
                document.body.style.overflow = 'hidden'; // Lock body scroll
            } else {
                icon.className = 'fas fa-bars';
                document.body.style.overflow = ''; // Unlock body scroll
            }
        });

        // Close sidebar when clicking a link inside it
        const sidebarLinks = sidebar.querySelectorAll('a');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', () => {
                sidebar.classList.remove('active');
                const icon = mobileBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-bars';
                document.body.style.overflow = '';
            });
        });
    }

    // Initialize Hero Editor - Removed, using image instead
    // if (document.getElementById('hero-editor')) {
    //     new FroalaEditor('#hero-editor', {
    //         key: 'Lc2C1qC1D1D4C3qB12qC8tsE4B-8F3J3A6B8B5D5D2A2di1aaA4cA1lnE1F2nrXYb1VPUGRHYZNRJd1JVOOb1HAc1zSZC1KGD1D1D1A1F1I4A10B1C6E4==',
    //         heightMin: 350,
    //         heightMax: 500,
    //         placeholderText: 'Experience the fully featured editor...',
    //         toolbarSticky: false
    //     });
    // }

    // Initialize
    renderPlugins();
});
