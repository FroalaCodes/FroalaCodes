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
        "Formatting",
        "Rich Media",
        "Layout & Tables",
        "Productivity",
        "Developer",
        "3rd Party Plugins"
    ];

    // Render Plugins
    function renderPlugins(pluginsToRender = allPlugins) {
        pluginsGrid.innerHTML = '';
        if (pluginsToRender.length === 0) {
            pluginsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 40px;">No plugins found matching your search.</p>';
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
                    "Formatting": "Empower users with precise control over typography and style. From font selection to inline styling, ensure every word looks perfect.",
                    "Rich Media": "Bring content to life with powerful media tools. Seamlessly handle images, videos, and files to create immersive, visually stunning experiences.",
                    "Layout & Tables": "Organize information effectively. Provide robust tools for creating complex tables, lists, and structured layouts with intuitive ease.",
                    "Productivity": "Enhance efficiency and workflow. Features like spell checking, character counts, and track changes help users write better and faster.",
                    "Developer": "Advanced tools for total control. Access code view, markdown support, and debugging features designed to meet developer needs.",
                    "3rd Party Plugins": "Expand capabilities with seamless integrations. Connect Froala with industry-leading tools for real-time editing, math equations, and more."
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

    // Search Functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        // 1. Filter Plugins
        if (!searchTerm) {
            renderPlugins(allPlugins);
        } else {
            const filtered = allPlugins.filter(plugin =>
                plugin.title.toLowerCase().includes(searchTerm) ||
                plugin.description.toLowerCase().includes(searchTerm)
            );
            renderPlugins(filtered);
        }

        // Helper to filter static lists (Frameworks, SDKs, APIs)
        const filterSection = (sectionId, itemSelector) => {
            const section = document.getElementById(sectionId);
            if (!section) return;

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
        };

        // 2. Filter Frameworks
        filterSection('frameworks-section', '.framework-item');

        // 3. Filter SDKs
        filterSection('sdks-section', '.framework-item');

        // 4. Filter API
        filterSection('api-section', '.api-card');
    });

    // Navigation Active State
    function updateActiveNav() {
        // Include #plugins-grid in the tracked sections
        const sections = document.querySelectorAll('section[id], header[id], #plugins-grid');
        const scrollPos = window.scrollY + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
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

    // Initialize Hero Editor
    if (document.getElementById('hero-editor')) {
        new FroalaEditor('#hero-editor', {
            heightMin: 350,
            heightMax: 500,
            placeholderText: 'Experience the fully featured editor...',
            toolbarSticky: false
        });
    }

    // Initialize
    renderPlugins();
});
