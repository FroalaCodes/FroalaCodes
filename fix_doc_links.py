import os
import re
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from openai import OpenAI

def extract_term_from_filename(filename):
    """Convert filename to term (e.g., 'image-manager.html' -> 'image manager')"""
    return filename.replace('.html', '').replace('-', ' ')

def get_term_info(html_file):
    """Extract term title and description from HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title
    title_match = re.search(r'<h1>([^<]+)</h1>', content)
    title = title_match.group(1) if title_match else None

    # Extract description
    desc_match = re.search(r'<div class="definition">\s*<p>([^<]+)</p>', content)
    description = desc_match.group(1) if desc_match else None

    return title, description

def get_embedding(text, openai_client):
    """Get embedding vector for text using OpenAI."""
    response = openai_client.embeddings.create(
        model="text-embedding-3-large",
        input=text
    )
    return response.data[0].embedding

def search_qdrant_for_url(client, openai_client, term, description):
    """Search Qdrant for the most relevant documentation URL."""
    try:
        # Search using the term and description
        search_text = f"{term} {description}" if description else term

        # Get embedding vector
        query_vector = get_embedding(search_text, openai_client)

        results = client.search(
            collection_name="froala_docs_v3",
            query_vector=query_vector,
            limit=5
        )

        if results:
            # Get URLs from top results and find the most specific one
            urls = []
            for result in results:
                if hasattr(result, 'payload') and 'url' in result.payload:
                    url = result.payload['url']

                    # Accept any froala.com URL
                    if url and 'froala.com' in url:
                        urls.append({
                            'url': url,
                            'score': result.score,
                            'title': result.payload.get('title', ''),
                            'text': result.payload.get('chunk_content', '')[:200]
                        })

            if urls:
                # Return the best scoring URL
                return urls[0]['url'], urls

        return None, []
    except Exception as e:
        print(f"Error searching for '{term}': {e}")
        return None, []

def update_html_link(html_file, new_url):
    """Update the documentation link in the HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the href in "View Official Documentation" link
    # Try both doc-button and cta-button classes
    pattern = r'(<a href=")[^"]+(" [^>]*class="(?:doc-button|cta-button)"[^>]*>View Official Documentation</a>)'
    replacement = r'\g<1>' + new_url + r'\g<2>'

    new_content = re.sub(pattern, replacement, content)

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(new_content)

def get_api_key():
    """Get OpenAI API key from generate_glossary.py"""
    glossary_script = Path(__file__).parent / 'froala_glossary' / 'generate_glossary.py'
    if glossary_script.exists():
        with open(glossary_script, 'r', encoding='utf-8') as f:
            content = f.read()
            match = re.search(r'OPENAI_API_KEY\s*=\s*["\']([^"\']+)["\']', content)
            if match:
                return match.group(1)
    return os.getenv('OPENAI_API_KEY')

def main():
    # Connect to Qdrant and OpenAI
    client = QdrantClient(host="localhost", port=6333)

    # Get OpenAI API key
    api_key = get_api_key()
    if not api_key:
        print("Error: OPENAI_API_KEY not found")
        print("Please set the OPENAI_API_KEY environment variable or add it to generate_glossary.py")
        return

    openai_client = OpenAI(api_key=api_key)

    terms_dir = Path(r'c:\Users\Carl Justine Cruz\Documents\GitHub\FroalaCodes\froala_glossary\glossary\terms')

    # List of problematic files
    problematic_files = [
        'accessibility.html', 'api.html', 'blob-storage.html', 'block-elements.html',
        'buttons.html', 'character-counter.html', 'charcountermax.html', 'code-view.html',
        'configuration.html', 'content-manipulation.html', 'content-methods.html',
        'content-sanitization.html', 'cross-browser-compatibility.html', 'custom-button.html',
        'custom-classes.html', 'design-blocks.html', 'dropdowns.html', 'edit-in-popup.html',
        'editor-instance.html', 'emoticons.html', 'file-manager.html', 'frontend-development.html',
        'fullscreen-mode.html', 'gethtml.html', 'htmlallowedtags.html', 'iframe-mode.html',
        'image-manager.html', 'imagebeforeupload.html', 'imageerror.html', 'imageinserted.html',
        'imageuploaded.html', 'initialized.html', 'initonclick.html', 'inline-mode.html',
        'inline-styles.html', 'keyboard-navigation.html', 'lifecycle.html', 'lists.html',
        'modals.html', 'oem.html', 'plugin-architecture.html', 'pluginsdisabled.html',
        'pluginsenabled.html', 'preview-mode.html', 'quick-insert.html', 'real-time-editing.html',
        's3-uploads.html', 'screen-reader-support.html', 'selection-methods.html', 'selector.html',
        'source-code.html', 'standard-mode.html', 'table-management.html', 'table-plugin.html',
        'tables.html', 'toolbar.html', 'undoredo.html', 'video-embed.html', 'wcag-20.html',
        'wysiwyg-editor.html', 'xss-protection.html'
    ]

    print(f"Processing {len(problematic_files)} files...\n")

    updates = []
    no_match = []

    for filename in problematic_files:
        html_file = terms_dir / filename
        if not html_file.exists():
            continue

        term, description = get_term_info(html_file)
        if not term:
            term = extract_term_from_filename(filename)

        print(f"Searching for: {term}")

        new_url, all_results = search_qdrant_for_url(client, openai_client, term, description)

        if new_url:
            print(f"  Found: {new_url}")
            updates.append({
                'file': filename,
                'term': term,
                'new_url': new_url,
                'all_results': all_results
            })
            update_html_link(html_file, new_url)
        else:
            print(f"  No match found")
            no_match.append({
                'file': filename,
                'term': term
            })

        print()

    print(f"\n{'='*80}")
    print(f"Summary:")
    print(f"  Updated: {len(updates)} files")
    print(f"  No match: {len(no_match)} files")

    if no_match:
        print(f"\nFiles without matches:")
        for item in no_match:
            print(f"  - {item['file']}: {item['term']}")

if __name__ == '__main__':
    main()
