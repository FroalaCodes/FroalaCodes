import json
import os
import logging
from typing import List, Dict
from generate_glossary import FroalaGlossaryGenerator, GlossaryTerm

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Define manual URL mappings based on web search and documentation structure
URL_MAPPING = {
    # Core Concepts
    "WYSIWYG Editor": "https://froala.com/wysiwyg-editor/",
    "Rich Text Editor": "https://froala.com/wysiwyg-editor/",
    "Editor Instance": "https://froala.com/wysiwyg-editor/docs/concepts/editor-instance/",
    "Initialization": "https://froala.com/wysiwyg-editor/docs/overview/",
    "Options": "https://froala.com/wysiwyg-editor/docs/options/",
    "Events": "https://froala.com/wysiwyg-editor/docs/events/",
    "Methods": "https://froala.com/wysiwyg-editor/docs/methods/",
    "API": "https://froala.com/wysiwyg-editor/docs/api/",
    "DOM": "https://froala.com/wysiwyg-editor/docs/concepts/dom/",
    "Plugins System": "https://froala.com/wysiwyg-editor/docs/plugins/",
    "Accessibility": "https://froala.com/wysiwyg-editor/docs/concepts/accessibility/",
    "Security Concepts": "https://froala.com/wysiwyg-editor/docs/concepts/security/",
    "XSS Protection": "https://froala.com/wysiwyg-editor/docs/concepts/security/",
    "Content Sanitization": "https://froala.com/wysiwyg-editor/docs/concepts/security/",
    "License": "https://froala.com/wysiwyg-editor/pricing/",
    
    # Modes
    "Inline Mode": "https://froala.com/wysiwyg-editor/inline/",
    "Iframe Mode": "https://froala.com/wysiwyg-editor/docs/options/#iframe",
    "Fullscreen Mode": "https://froala.com/wysiwyg-editor/docs/plugins/fullscreen/",
    "Code View": "https://froala.com/wysiwyg-editor/docs/plugins/code-view/",
    "Preview Mode": "https://froala.com/wysiwyg-editor/examples/preview/",
    "Document Mode": "https://froala.com/wysiwyg-editor/examples/document-ready/",
    
    # Features / Plugins
    "Toolbar": "https://froala.com/wysiwyg-editor/docs/options/#toolbarButtons",
    "Quick Insert": "https://froala.com/wysiwyg-editor/docs/plugins/quick-insert/",
    "Image Management": "https://froala.com/wysiwyg-editor/docs/plugins/image-manager/",
    "Image Upload": "https://froala.com/wysiwyg-editor/docs/concepts/image/upload/",
    "File Upload": "https://froala.com/wysiwyg-editor/docs/concepts/file/upload/",
    "Video Embed": "https://froala.com/wysiwyg-editor/docs/plugins/video/",
    "Tables": "https://froala.com/wysiwyg-editor/docs/plugins/table/",
    "Lists": "https://froala.com/wysiwyg-editor/docs/plugins/lists/",
    "Markdown Support": "https://froala.com/wysiwyg-editor/docs/plugins/markdown/",
    "Emoticons": "https://froala.com/wysiwyg-editor/docs/plugins/emoticons/",
    "Character Counter": "https://froala.com/wysiwyg-editor/docs/plugins/char-counter/",
    "Word Counter": "https://froala.com/wysiwyg-editor/docs/plugins/word-counter/",
    "Color Picker": "https://froala.com/wysiwyg-editor/docs/plugins/colors/",
    "Font Family": "https://froala.com/wysiwyg-editor/docs/plugins/font-family/",
    "Font Size": "https://froala.com/wysiwyg-editor/docs/plugins/font-size/",
    "Line Height": "https://froala.com/wysiwyg-editor/docs/plugins/line-height/",
    "Paragraph Format": "https://froala.com/wysiwyg-editor/docs/plugins/paragraph-format/",
    "Paragraph Style": "https://froala.com/wysiwyg-editor/docs/plugins/paragraph-style/",
    "Quote": "https://froala.com/wysiwyg-editor/docs/plugins/quote/",
    "Special Characters": "https://froala.com/wysiwyg-editor/docs/plugins/special-characters/",
    "Track Changes": "https://froala.com/wysiwyg-editor/docs/plugins/track-changes/",
    "Codox": "https://froala.com/wysiwyg-editor/docs/concepts/real-time-collaboration/",
    "Real-time Collaboration": "https://froala.com/wysiwyg-editor/docs/concepts/real-time-collaboration/",
    "Spell Checker": "https://froala.com/wysiwyg-editor/docs/plugins/spell-checker/",
    "Draggable Content": "https://froala.com/wysiwyg-editor/docs/plugins/draggable/",
    
    # Integrations
    "React Integration": "https://froala.com/wysiwyg-editor/docs/frameworks/react/",
    "Angular Integration": "https://froala.com/wysiwyg-editor/docs/frameworks/angular/",
    "Vue.js Integration": "https://froala.com/wysiwyg-editor/docs/frameworks/vue/",
    "Django Integration": "https://froala.com/wysiwyg-editor/docs/server/django/",
    "Ruby on Rails Integration": "https://froala.com/wysiwyg-editor/docs/server/ruby-on-rails/",
    "PHP Integration": "https://froala.com/wysiwyg-editor/docs/server/php/",
    "Node.js Integration": "https://froala.com/wysiwyg-editor/docs/server/nodejs/",
}

def fix_links():
    json_path = 'glossary_terms.json'
    if not os.path.exists(json_path):
        logger.error(f"File not found: {json_path}")
        return

    logger.info(f"Loading terms from {json_path}...")
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    terms_data = data.get('terms', [])
    updated_count = 0

    term_objects = []

    for term in terms_data:
        title = term.get('title', '')
        
        # 1. Direct Mapping
        if title in URL_MAPPING:
            term['source_urls'] = [URL_MAPPING[title]]
            updated_count += 1
            logger.info(f"Updated '{title}' -> {URL_MAPPING[title]}")
        
        # 2. Heuristic Mapping
        elif 'Plugin' in title:
             # Try to construct a plugin URL
             slug = title.lower().replace(' plugin', '').replace(' ', '-')
             url = f"https://froala.com/wysiwyg-editor/docs/plugins/{slug}/"
             term['source_urls'] = [url]
             updated_count += 1
             logger.info(f"Heuristic '{title}' -> {url}")
        
        elif 'Integration' in title:
             slug = title.lower().replace(' integration', '').replace('.', '')
             url = f"https://froala.com/wysiwyg-editor/docs/frameworks/{slug}/"
             term['source_urls'] = [url]
             updated_count += 1
             logger.info(f"Heuristic '{title}' -> {url}")

        # Convert to GlossaryTerm object for HTML generation
        # We need to handle the fields carefully to match GlossaryTerm __init__
        term_obj = GlossaryTerm(
            title=term.get('title', ''),
            category=term.get('category', 'Other'),
            description=term.get('description', ''),
            confidence=term.get('confidence', 0.8),
            source_urls=term.get('source_urls', []),
            full_content=term.get('full_content', ''),
            detailed_sections=term.get('detailed_sections', {})
        )
        # Restore related terms if they exist (GlossaryTerm might compute them, but we want to keep existing if possible)
        # The generator re-computes related terms, but that's fine.
        term_objects.append(term_obj)

    # Save updated JSON
    data['terms'] = terms_data
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    logger.info(f"Saved updated terms to {json_path}. Total updated: {updated_count}")

    # Regenerate HTML
    logger.info("Regenerating HTML pages...")
    generator = FroalaGlossaryGenerator()
    # We need to re-calculate related terms because GlossaryTerm objects were recreated without them
    generator._find_related_terms(term_objects)
    generator.generate_multi_page_html(term_objects, output_dir="glossary")
    logger.info("HTML generation complete.")

if __name__ == "__main__":
    fix_links()
