"""
Froala Glossary Generator

This script queries a Qdrant vector database containing Froala documentation
and uses OpenAI embeddings and GPT to extract and generate glossary terms.
"""

import os
import json
import logging
from typing import List, Dict, Set, Optional
from dataclasses import dataclass, asdict
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests
from openai import OpenAI
from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue, SearchRequest

# Configuration
QDRANT_URL = "http://localhost:6333"
QDRANT_COLLECTION = "froala_docs_v3"
OPENAI_API_KEY = "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"
EMBEDDING_MODEL = "text-embedding-3-large"
EMBEDDING_DIMENSION = 3072
GPT_MODEL = "gpt-4o-mini"

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class GlossaryTerm:
    """Represents a glossary term with its metadata"""
    title: str
    category: str
    description: str
    source_context: Optional[str] = None
    confidence: float = 0.0
    source_urls: List[str] = None
    related_terms: List[Dict[str, str]] = None  # List of {title, description}
    full_content: Optional[str] = None
    detailed_sections: Optional[Dict[str, List[str]]] = None  # Rich content sections

    def __post_init__(self):
        if self.source_urls is None:
            self.source_urls = []
        if self.related_terms is None:
            self.related_terms = []
        if self.detailed_sections is None:
            self.detailed_sections = {}

    def __hash__(self):
        return hash(self.title.lower())

    def __eq__(self, other):
        if isinstance(other, GlossaryTerm):
            return self.title.lower() == other.title.lower()
        return False

    def to_slug(self) -> str:
        """Convert term title to URL-friendly slug"""
        import re
        slug = self.title.lower()
        slug = re.sub(r'[^\w\s-]', '', slug)
        slug = re.sub(r'[-\s]+', '-', slug)
        return slug.strip('-')


class FroalaGlossaryGenerator:
    """Main class for generating Froala glossary from vector database"""

    def __init__(self):
        """Initialize connections to Qdrant and OpenAI"""
        logger.info("Initializing Froala Glossary Generator...")

        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=OPENAI_API_KEY)

        # Initialize Qdrant client
        try:
            self.qdrant_client = QdrantClient(url=QDRANT_URL)
            logger.info(f"Connected to Qdrant at {QDRANT_URL}")

            # Verify collection exists
            collections = self.qdrant_client.get_collections()
            collection_names = [c.name for c in collections.collections]
            if QDRANT_COLLECTION not in collection_names:
                raise ValueError(f"Collection '{QDRANT_COLLECTION}' not found in Qdrant")

            logger.info(f"Found collection: {QDRANT_COLLECTION}")

        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {e}")
            raise

    def _should_exclude_url(self, url: str) -> bool:
        """
        Check if URL should be excluded from glossary

        Args:
            url: Source URL to check

        Returns:
            True if URL should be excluded, False otherwise
        """
        url_lower = url.lower()

        # Exclude patterns
        exclude_patterns = [
            'migrate',           # Migration guides
            'whitepapers',       # Whitepapers
            'tutorial',          # Tutorial pages
            '/guide/',           # Guide pages
            '/how-to',           # How-to pages
            '/getting-started',  # Getting started pages
        ]

        for pattern in exclude_patterns:
            if pattern in url_lower:
                logger.debug(f"Excluding URL (contains '{pattern}'): {url}")
                return True

        return False

    def get_embedding(self, text: str) -> List[float]:
        """Generate embedding for text using OpenAI"""
        try:
            response = self.openai_client.embeddings.create(
                model=EMBEDDING_MODEL,
                input=text,
                dimensions=EMBEDDING_DIMENSION
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Failed to generate embedding: {e}")
            raise

    def search_documentation(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Search the vector database for relevant documentation chunks

        Args:
            query: Search query text
            limit: Maximum number of results to return

        Returns:
            List of search results with text and metadata
        """
        logger.info(f"Searching for: '{query}' (limit={limit})")

        # Generate embedding for the query
        query_vector = self.get_embedding(query)

        # Search in Qdrant
        search_results = self.qdrant_client.search(
            collection_name=QDRANT_COLLECTION,
            query_vector=query_vector,
            limit=limit,
            with_payload=True
        )

        results = []
        for i, hit in enumerate(search_results):
            # Debug: Log payload structure for first result
            if i == 0:
                logger.info(f"Sample payload keys: {list(hit.payload.keys())}")
                logger.info(f"Sample payload: {hit.payload}")

            # Try different possible field names for text content
            text = (
                hit.payload.get('text') or
                hit.payload.get('content') or
                hit.payload.get('page_content') or
                hit.payload.get('document') or
                hit.payload.get('body') or
                str(hit.payload)
            )

            # Extract source URL from metadata or payload
            source_url = (
                hit.payload.get('url') or
                hit.payload.get('source') or
                hit.payload.get('source_url') or
                hit.payload.get('metadata', {}).get('url') or
                hit.payload.get('metadata', {}).get('source') or
                ''
            )

            # Filter out unwanted URLs
            if source_url and self._should_exclude_url(source_url):
                continue

            results.append({
                'text': text if text else '',
                'metadata': hit.payload.get('metadata', {}),
                'score': hit.score,
                'source_url': source_url,
                'payload': hit.payload  # Keep full payload for debugging
            })

        logger.info(f"Found {len(results)} results")
        return results

    def extract_terms_with_gpt(self, context_chunks: List[str],
                              source_urls: List[str] = None) -> List[GlossaryTerm]:
        """
        Use GPT to extract glossary terms from documentation chunks

        Args:
            context_chunks: List of text chunks from documentation
            source_urls: List of source URLs corresponding to each chunk

        Returns:
            List of extracted glossary terms
        """
        logger.info(f"Extracting terms from {len(context_chunks)} chunks using GPT...")

        if source_urls is None:
            source_urls = [''] * len(context_chunks)

        # Combine chunks        if not context_chunks:
            return []

        # Prepare context with source IDs
        numbered_chunks = []
        for i, chunk in enumerate(context_chunks):
            numbered_chunks.append(f"[Source {i}] {chunk}")
        
        combined_context = "\n\n---\n\n".join(numbered_chunks)
        
        prompt = f"""You are analyzing Froala Editor documentation to create a comprehensive technical glossary.

CRITICAL: Focus on CORE CONCEPTS, FUNDAMENTAL TERMS, and SIGNIFICANT FEATURES that users need to understand, NOT individual configuration options.

GLOSSARY-WORTHY TERMS (PRIORITIZE THESE):

✓ Core concepts: "WYSIWYG Editor", "Rich Text Editing", "Content Editor", "Editor Instance"

✓ Web technologies: "HTML", "CSS", "JavaScript", "DOM", "Browser", "Web Application", "Frontend Development"

✓ Major features: "Toolbar", "Plugins System", "Image Management", "File Upload", "Formatting", "Tables", "Lists"

✓ Architecture concepts: "API", "Events System", "Initialization", "Configuration", "Lifecycle"

✓ Platform integrations: "CMS", "Content Management System", "LMS", "Learning Management System", "Framework Integration"

✓ Content formats: "Markdown", "HTML Content", "Plain Text", "Code Blocks"

✓ UI components: "Buttons", "Dropdowns", "Modals", "Popups", "Quick Insert"

✓ Important method categories: "Content Methods", "Selection Methods", "Event Methods", "Initialization Methods"

✓ Key editing concepts: "Inline Mode", "Fullscreen Mode", "Code View", "Source Code", "Preview Mode"

✓ Security concepts: "XSS Protection", "Content Sanitization", "HTML Validation", "Input Filtering"

✓ Content operations: "Copy/Paste", "Undo/Redo", "Content Manipulation", "Selection API"

✓ Media handling: "Image Upload", "Video Embed", "File Attachment", "Media Management"

✓ Formatting concepts: "Inline Styles", "Block Elements", "Custom Classes", "HTML Tags"

✓ Accessibility: "ARIA", "Keyboard Navigation", "Screen Reader Support"

✓ Plugin categories: "Image Plugin", "Table Plugin", "Special Characters", "Emoticons"

NOT GLOSSARY-WORTHY (EXCLUDE THESE):

✗ Specific configuration option names like "pluginsEnabled: ['image', 'table']"

✗ Individual CSS class names or IDs used internally

✗ Minor utility functions that are rarely used

✗ Specific URL endpoints or file paths

✗ Version-specific changelog details

INCLUDE IF:

- It's a concept developers need to understand to use Froala effectively

- It has multiple related features or use cases

- It's mentioned frequently across documentation

- It represents a distinct category of functionality

- Users would reasonably search for this term

For each term, provide:

1. **Title**: The exact term name (e.g., "WYSIWYG Editor", "Image Management", "Events System")

2. **Category**: One of: Core Concept, Feature, API, Architecture, UI Component, Method Category, Event, Security, Processing, Web Technology, Integration, Content Format, Programming Language, Accessibility, Other

3. **Description**: A detailed 1-2 sentence overview explaining what it is and why it matters (150-250 characters)

4. **Sections**: An object with 4-6 detailed subsections. Each section MUST have 3-6 substantive bullet points with specific details.

REQUIRED Section Types (choose 4-6 that best fit each term):

- **Key Features**: Specific capabilities and characteristics

- **Implementation**: How to use it, configuration steps, code patterns

- **Use Cases**: Real-world scenarios where this is used

- **Best Practices**: Recommendations, tips, and optimal usage patterns
I will provide multiple text chunks, each labeled with [Source ID].
Your task is to extract glossary terms and identify WHICH source they came from.

Criteria for glossary terms:
1. MUST be a specific technical term, feature, API method, or concept related to Froala Editor or web development.
2. MUST be explained in the provided text.
3. DO NOT include generic English words unless they have a specific technical meaning here.
4. DO NOT include individual configuration options (like 'imageUploadURL') unless they represent a major concept.
5. DO NOT include internal constants or CSS classes.

Good terms: "WYSIWYG Editor", "Toolbar", "Image Manager", "Init Event", "XSS Protection", "DOM", "Plugin"
Bad terms: "options", "configuration", "setting", "example", "fr-toolbar", "imageUploadURL"

Return ONLY a JSON array with this structure:
[
  {{
    "title": "Term Name",
    "category": "Category Name",
    "description": "Detailed 150-250 char description explaining what it is and why it matters.",
    "source_id": 0,  // The integer ID of the source text where this term is defined (e.g., 0 for [Source 0])
    "sections": {{
      "Section Title 1": ["Detailed point 1", "Detailed point 2", "Detailed point 3", "Detailed point 4"],
      "Section Title 2": ["Detailed point 1", "Detailed point 2", "Detailed point 3"],
      "Section Title 3": ["Detailed point 1", "Detailed point 2", "Detailed point 3", "Detailed point 4"],
      "Section Title 4": ["Detailed point 1", "Detailed point 2", "Detailed point 3"]
    }}
  }}
]

Documentation excerpts:
{combined_context}

Extract 20-30 most important terms covering CORE CONCEPTS, MAJOR FEATURES, and FUNDAMENTAL TECHNOLOGIES from this batch. Focus on unique terms not already covered in previous batches. Return only valid JSON, no markdown formatting."""

        try:
            response = self.openai_client.chat.completions.create(
                model=GPT_MODEL,
                messages=[
                    {"role": "system", "content": "You are a technical documentation expert who creates comprehensive glossary terms. You focus on CORE CONCEPTS, FUNDAMENTAL TERMS, and SIGNIFICANT FEATURES that users need to understand, NOT individual configuration options. Prioritize terms like 'WYSIWYG Editor', 'HTML', 'CSS', 'JavaScript', 'CMS', 'LMS', 'Markdown', 'Toolbar', 'Plugins System', 'Image Management', 'Tables', 'Lists', 'Copy/Paste', 'Undo/Redo' over terms like 'pluginsEnabled' or 'imageUploadURL'. Include web technologies, platform integrations, UI components, and common operations."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=8000  # Balanced for 20-30 terms per batch with detailed sections
            )

            content = response.choices[0].message.content.strip()

            # Remove markdown code blocks if present
            if content.startswith("```"):
                content = content.split("```")[1]
                if content.startswith("json"):
                    content = content[4:]
                content = content.strip()

            # Parse JSON response
            terms_data = json.loads(content)

            terms = []
            for item in terms_data:
                # Determine source URL based on source_id
                term_source_urls = []
                source_id = item.get('source_id')
                
                if source_id is not None and isinstance(source_id, int) and 0 <= source_id < len(source_urls):
                    if source_urls[source_id]:
                        term_source_urls.append(source_urls[source_id])
                        logger.debug(f"Term '{item.get('title')}' linked to Source {source_id}: {source_urls[source_id]}")
                
                # Fallback: if no valid source_id, use the first available URL from the batch (better than nothing)
                if not term_source_urls and source_urls:
                    term_source_urls = [url for url in source_urls if url]
                    logger.debug(f"Term '{item.get('title')}' fallback to first URL: {term_source_urls[0]}")

                term = GlossaryTerm(
                    title=item.get('title', ''),
                    category=item.get('category', 'Other'),
                    description=item.get('description', ''),
                    confidence=0.8,  # Base confidence for GPT-extracted terms
                    source_urls=term_source_urls,
                    full_content=combined_context[:1000],  # Store first 1000 chars
                    detailed_sections=item.get('sections', {})
                )
                terms.append(term)

            logger.info(f"Extracted {len(terms)} terms from GPT")
            return terms

        except Exception as e:
            logger.error(f"Failed to extract terms with GPT: {e}")
            return []

    def generate_glossary(self, num_queries: int = 5, results_per_query: int = 30,
                         batch_size: int = 15) -> List[GlossaryTerm]:
        """
        Generate glossary by querying the vector database with multiple search queries

        Args:
            num_queries: Number of different search queries to use
            results_per_query: Number of results to retrieve per query from Qdrant
            batch_size: Number of chunks to process with GPT at once

        Returns:
            List of unique glossary terms
        """
        logger.info(f"Starting glossary generation with {num_queries} queries, "
                   f"{results_per_query} results per query, batch size {batch_size}...")

        # Define search queries to find core concepts and important terms
        # Expanded to include HTML, CMS, LMS, and general web editing concepts
        search_queries = [
            "What is WYSIWYG editor and rich text editing",
            "Froala editor core concepts and architecture",
            "Froala editor main features and capabilities",
            "Froala editor plugins system and extensibility",
            "Froala editor API and methods overview",
            "Froala editor events system and event handling",
            "Froala editor toolbar and user interface",
            "Froala editor content editing and formatting",
            "Froala editor file and image management",
            "Froala editor initialization and configuration concepts",
            "HTML HyperText Markup Language web development",
            "Content Management System CMS integration",
            "Learning Management System LMS integration",
            "Markdown editor and markdown support",
            "JavaScript editor integration and framework",
            "Text editor content creation and editing",
            "Web editor browser-based editing",
            "Rich text formatting and styling",
            "Content creation and authoring tools",
            "Document editor and document management",
            "HTML editor and HTML editing capabilities",
            "Web content management and editing",
            "Editor configuration and customization",
            "Content sanitization and security",
            "Editor integration with web applications",
            # New queries from Research Plan
            "Froala initialization modes iframe inline popup document",
            "Froala event lifecycle initialized contentChanged image events",
            "Froala image manager vs upload blob s3",
            "Froala enterprise features track changes real-time collaboration codox",
            "Froala design blocks and page builder",
            "Froala security compliance XSS sanitization section 508 WCAG",
            "Froala licensing perpetual saas oem ignition"
        ]

        all_terms = []
        all_contexts = []
        context_sources = []  # Track source URLs for each context

        # Execute searches
        for i, query in enumerate(search_queries[:num_queries], 1):
            logger.info(f"Query {i}/{num_queries}: {query}")

            results = self.search_documentation(query, limit=results_per_query)

            # Collect text chunks and their sources
            for result in results:
                text = result['text']
                if text and len(text) > 50:  # Filter out very short chunks
                    all_contexts.append(text)
                    context_sources.append(result.get('source_url', ''))

        logger.info(f"Collected {len(all_contexts)} context chunks")

        # Extract terms from contexts using GPT in batches
        # Limit total processing to avoid excessive runtime
        max_batches = 20  # Limit to 20 batches max
        max_total_contexts = max_batches * batch_size
        
        if all_contexts:
            # Limit contexts to process
            contexts_to_process = all_contexts[:max_total_contexts]
            sources_to_process = context_sources[:max_total_contexts]
            
            logger.info(f"Processing {len(contexts_to_process)} contexts in batches of {batch_size} (max {max_batches} batches)...")
            
            # Process in batches to handle more content
            # Process in batches to handle more content
            # Use parallel processing to speed up GPT extraction
            max_workers = 5  # Avoid hitting rate limits
            
            with ThreadPoolExecutor(max_workers=max_workers) as executor:
                future_to_batch = {}
                
                for batch_num in range(0, len(contexts_to_process), batch_size):
                    batch = contexts_to_process[batch_num:batch_num + batch_size]
                    batch_sources = sources_to_process[batch_num:batch_num + batch_size]
                    
                    logger.info(f"Submitting batch {batch_num//batch_size + 1} for processing...")
                    future = executor.submit(self.extract_terms_with_gpt, batch, batch_sources)
                    future_to_batch[future] = batch_num

                # Collect results as they complete
                for future in as_completed(future_to_batch):
                    batch_num = future_to_batch[future]
                    try:
                        terms = future.result()
                        all_terms.extend(terms)
                        logger.info(f"Batch {batch_num//batch_size + 1} completed. Extracted {len(terms)} terms (total so far: {len(all_terms)})")
                    except Exception as e:
                        logger.error(f"Batch {batch_num//batch_size + 1} generated an exception: {e}")

                    # Early stopping check (optional, but might be tricky with parallelism)
                    # We'll skip strict early stopping to ensure better coverage since we're running in parallel anyway

        # Deduplicate terms and merge sources
        unique_terms = self._deduplicate_terms(all_terms)

        # Filter out low-value terms (individual config options, etc.)
        logger.info("Filtering low-value terms...")
        filtered_terms = self._filter_glossary_terms(unique_terms)
        logger.info(f"Filtered {len(unique_terms)} terms down to {len(filtered_terms)} high-quality terms")

        # Ensure core terms are included
        logger.info("Ensuring core terms are included...")
        filtered_terms = self._ensure_core_terms(filtered_terms, all_contexts, context_sources)

        # Find related terms for each term
        logger.info("Finding related terms...")
        self._find_related_terms(filtered_terms)

        logger.info(f"Generated {len(filtered_terms)} unique glossary terms")
        return filtered_terms

    def _deduplicate_terms(self, terms: List[GlossaryTerm]) -> List[GlossaryTerm]:
        """
        Remove duplicate terms (case-insensitive) and merge source URLs
        Also remove semantic duplicates (same concept, different wording)

        Args:
            terms: List of glossary terms

        Returns:
            Deduplicated list of terms
        """
        import re

        seen_titles = {}
        unique_terms = []

        for term in terms:
            title_lower = term.title.lower()

            # Normalize title for better duplicate detection
            normalized_title = re.sub(r'[^\w\s]', '', title_lower)
            normalized_title = ' '.join(normalized_title.split())

            # Check for exact match
            if title_lower in seen_titles:
                # Merge source URLs
                existing = seen_titles[title_lower]
                existing.source_urls.extend(term.source_urls)
                existing.source_urls = list(set(existing.source_urls))

                # Keep the one with higher confidence or more detailed sections
                if term.confidence > existing.confidence or \
                   len(term.detailed_sections) > len(existing.detailed_sections):
                    merged_sources = existing.source_urls
                    unique_terms.remove(existing)
                    term.source_urls = merged_sources
                    unique_terms.append(term)
                    seen_titles[title_lower] = term
                continue

            # Check for semantic duplicates (similar titles)
            is_duplicate = False
            for existing_title, existing_term in seen_titles.items():
                if self._is_semantic_duplicate(normalized_title, existing_title):
                    logger.info(
                        f"Found semantic duplicate: "
                        f"'{term.title}' ~ '{existing_term.title}'"
                    )
                    # Merge into existing
                    existing_term.source_urls.extend(term.source_urls)
                    existing_term.source_urls = list(set(
                        existing_term.source_urls
                    ))
                    is_duplicate = True
                    break

            if not is_duplicate:
                seen_titles[title_lower] = term
                unique_terms.append(term)

        logger.info(f"Removed {len(terms) - len(unique_terms)} duplicate terms")
        return unique_terms

    def _is_semantic_duplicate(self, title1: str, title2: str) -> bool:
        """
        Check if two titles represent the same concept

        Args:
            title1: First normalized title
            title2: Second normalized title

        Returns:
            True if they are semantic duplicates
        """
        import re

        # Normalize both titles
        norm1 = re.sub(r'[^\w\s]', '', title1.lower()).split()
        norm2 = re.sub(r'[^\w\s]', '', title2.lower()).split()

        # Remove common words
        common_words = {
            'the', 'a', 'an', 'and', 'or', 'for', 'with',
            'integration', 'editor'
        }
        norm1 = [w for w in norm1 if w not in common_words]
        norm2 = [w for w in norm2 if w not in common_words]

        # Check if one is a subset of the other
        # e.g., "Gatsby Integration" vs "Gatsby JS Integration"
        set1 = set(norm1)
        set2 = set(norm2)

        if set1.issubset(set2) or set2.issubset(set1):
            # Check if the difference is minimal (just 1-2 words)
            diff = set1.symmetric_difference(set2)
            if len(diff) <= 2:
                return True

        # Check if 80%+ overlap
        if len(set1) > 0 and len(set2) > 0:
            overlap = len(set1.intersection(set2))
            similarity = overlap / max(len(set1), len(set2))
            if similarity >= 0.8:
                return True

        return False

    def _filter_glossary_terms(self, terms: List[GlossaryTerm]) -> List[GlossaryTerm]:
        """
        Filter out terms that are not glossary-worthy (e.g., individual config options)

        Args:
            terms: List of glossary terms

        Returns:
            Filtered list of high-quality glossary terms
        """
        import re

        # Terms to exclude patterns (low-value terms)
        exclude_patterns = [
            r'^[a-z][a-zA-Z]*$',  # camelCase single words (likely config options)
            r'URL$',  # Ends with URL (likely config option)
            r'^[a-z]+[A-Z]',  # camelCase starting with lowercase (config options)
        ]

        # Terms that should definitely be excluded (common config options)
        exclude_exact = {
            'pluginsEnabled', 'imageUploadURL', 'toolbarButtons', 'requestWithCORS',
            'htmlAllowedAttrs', 'htmlAllowedTags', 'htmlAllowedEmptyTags',
            'htmlDoNotWrapTags', 'htmlUntouched', 'htmlSimpleAmpersand',
            'iframe', 'iframeStyle', 'iframeDefaultWidth', 'iframeDefaultHeight',
            'pastePlain', 'pasteDeniedTags', 'pasteDeniedAttrs', 'pasteKeepQuotes',
            'charCounterCount', 'charCounterMax', 'charCounterType',
            'heightMax', 'heightMin', 'zIndex', 'tabSpaces', 'tabIndex',
            'toolbarSticky', 'toolbarVisibleWithoutSelection', 'toolbarInline',
            'toolbarContainer', 'toolbarButtonsMD', 'toolbarButtonsSM', 'toolbarButtonsXS',
            'quickInsertButtons', 'quickInsertEnabled', 'quickInsertTags',
            'fontFamily', 'fontFamilySelection', 'fontSize', 'fontSizeSelection',
            'lineHeight', 'lineHeightSelection', 'colors', 'colorsText', 'colorsBackground',
            'paragraphFormat', 'paragraphFormatSelection', 'paragraphDefaultSelection',
            'paragraphStyles', 'textAlign', 'textAlignSelection',
            'linkAlwaysBlank', 'linkAlwaysNoFollow', 'linkAlwaysShowProtocol',
            'linkEditButtons', 'linkInsertButtons', 'linkList', 'linkNoFollowDefault',
            'linkText', 'linkUpload', 'linkUploadToS3', 'linkUploadParams',
            'imageDefaultWidth', 'imageDefaultDisplay', 'imageDefaultAlign',
            'imageEditButtons', 'imageInsertButtons', 'imageManagerDeleteURL',
            'imageManagerLoadURL', 'imageManagerPreloader', 'imageMaxSize',
            'imageMinWidth', 'imageMinHeight', 'imageOutputSize', 'imagePaste',
            'imageResize', 'imageResizeWithPercent', 'imageRoundPercent',
            'imageUpload', 'imageUploadMethod', 'imageUploadParam', 'imageUploadParams',
            'imageUploadToS3', 'imageUploadURL', 'imageUseImageManager',
            'videoDefaultWidth', 'videoDefaultHeight', 'videoDefaultAlign',
            'videoEditButtons', 'videoInsertButtons', 'videoMaxSize', 'videoOutputSize',
            'videoResize', 'videoUpload', 'videoUploadMethod', 'videoUploadParam',
            'videoUploadParams', 'videoUploadToS3', 'videoUploadURL',
            'fileUpload', 'fileUploadMethod', 'fileUploadParam', 'fileUploadParams',
            'fileUploadToS3', 'fileUploadURL', 'fileMaxSize',
            'tableDefaultWidth', 'tableEditButtons', 'tableInsertButtons',
            'tableResizer', 'tableResizerOffset', 'tableResizerLimit',
            'tableDefaultStyles', 'tableCellStyles', 'tableColors',
            'codeBeautifier', 'codeBeautifierOptions', 'codeViewKeepActiveButton',
            'codeMirror', 'codeMirrorOptions', 'emoticonsSet', 'emoticonsButtons',
            'emoticonsStep', 'entities', 'entitiesStep', 'fullPage',
        }

        # Important terms that should NEVER be filtered out
        important_terms_whitelist = {
            'HTML', 'HyperText Markup Language', 'CSS', 'JavaScript', 'DOM', 'Browser', 'Web Application', 'Frontend Development',
            'CMS', 'Content Management System', 'LMS', 'Learning Management System', 'Framework Integration',
            'Markdown', 'HTML Content', 'Plain Text', 'Code Blocks',
            'WYSIWYG', 'WYSIWYG Editor', 'Rich Text Editor', 'Rich Text Editing',
            'Froala Editor', 'Web Editor', 'Text Editor', 'Content Editor', 'Editor Instance',
            'API', 'Events System', 'Initialization', 'Configuration', 'Lifecycle',
            'Toolbar', 'Plugins System', 'Image Management', 'Image Upload', 'File Upload', 'File Management',
            'Formatting', 'Tables', 'Lists', 'Buttons', 'Dropdowns', 'Modals', 'Popups', 'Quick Insert',
            'Content Methods', 'Selection Methods', 'Event Methods', 'Initialization Methods',
            'Inline Mode', 'Fullscreen Mode', 'Code View', 'Source Code', 'Preview Mode',
            'Security', 'XSS Protection', 'Content Sanitization', 'HTML Validation', 'Input Filtering',
            'Copy/Paste', 'Undo/Redo', 'Content Manipulation', 'Selection API',
            'Video Embed', 'File Attachment', 'Media Management',
            'Inline Styles', 'Block Elements', 'Custom Classes', 'HTML Tags',
            'ARIA', 'Keyboard Navigation', 'Screen Reader Support',
            'Image Plugin', 'Table Plugin', 'Special Characters', 'Emoticons',
            'Content Creation', 'Content Authoring', 'Document Management', 'Web Content',
            'API Integration',
            # New whitelist terms from Research Plan
            'Standard Mode', 'Iframe Mode', 'Edit-in-Popup', 'Document Mode',
            'Options Object', 'toolbarButtons', 'pluginsEnabled', 'pluginsDisabled', 'toolbarSticky', 'charCounterMax', 'initOnClick',
            'initialized', 'contentChanged', 'image.beforeUpload', 'image.uploaded', 'image.inserted', 'image.error', 'getHTML', 'events',
            'Selector', 'Instance Object', 'Plugin Architecture', 'Custom Button',
            'Image Manager', 'File Manager', 'Blob Storage', 'S3 Uploads',
            'Track Changes', 'Real-Time Collaboration', 'Codox', 'Markdown Support',
            'Design Blocks', 'Design Builder',
            'Sanitization', 'XSS', 'HTMLAllowedTags', 'Section 508', 'WCAG 2.0', 'Lazy Loading',
            'Perpetual License', 'SaaS', 'OEM', 'Ignition Discount'
        }

        filtered_terms = []
        excluded_count = 0

        for term in terms:
            title_lower = term.title.lower()
            title = term.title

            # Always keep important terms
            if title in important_terms_whitelist or title_lower in {t.lower() for t in important_terms_whitelist}:
                filtered_terms.append(term)
                continue

            # Check exact exclusions
            if title in exclude_exact:
                excluded_count += 1
                logger.debug(f"Excluding exact match: {title}")
                continue

            # Check pattern exclusions
            should_exclude = False
            for pattern in exclude_patterns:
                if re.match(pattern, title):
                    should_exclude = True
                    break

            if should_exclude:
                excluded_count += 1
                logger.debug(f"Excluding pattern match: {title}")
                continue

            # Keep terms that are:
            # - Multiple words (concepts, not config options) OR
            # - Proper nouns or capitalized terms (like "WYSIWYG Editor") OR
            # - Have significant description length (>100 chars) OR
            # - Are in important categories
            word_count = len(title.split())
            is_capitalized = title[0].isupper() if title else False
            has_good_description = len(term.description) > 100
            is_important_category = term.category in ['Core Concept', 'Feature', 'API', 'Architecture', 'UI Component', 'Method', 'Event']

            # Keep if it meets any of the quality criteria
            if (word_count > 1 or is_capitalized or has_good_description or is_important_category):
                filtered_terms.append(term)
            else:
                excluded_count += 1
                logger.debug(f"Excluding low-value term: {title} (words: {word_count}, capitalized: {is_capitalized}, desc_len: {len(term.description)}, category: {term.category})")

        logger.info(f"Excluded {excluded_count} low-value terms")
        return filtered_terms

    def _ensure_core_terms(self, terms: List[GlossaryTerm], all_contexts: List[str],
                           context_sources: List[str]) -> List[GlossaryTerm]:
        """
        Ensure core terms like "WYSIWYG Editor" are included in the glossary

        Args:
            terms: Current list of terms
            all_contexts: All context chunks from documentation
            context_sources: Source URLs for each context

        Returns:
            List of terms with core terms ensured
        """
        # Core terms that must be in the glossary
        core_terms_required = [
            'WYSIWYG Editor',
            'WYSIWYG',
            'Rich Text Editor',
            'Rich Text Editing',
            # Research Plan Terms
            'Standard Mode', 'Iframe Mode', 'Inline Mode', 'Edit-in-Popup', 'Document Mode',
            'Options Object', 'toolbarButtons', 'pluginsEnabled', 'pluginsDisabled', 'toolbarSticky', 'charCounterMax', 'initOnClick',
            'initialized', 'contentChanged', 'image.beforeUpload', 'image.uploaded', 'image.inserted', 'image.error', 'getHTML', 'events',
            'DOM', 'Selector', 'Instance Object', 'Plugin Architecture', 'Custom Button',
            'Image Manager', 'File Manager', 'Blob Storage', 'S3 Uploads', 'Quick Insert',
            'Track Changes', 'Real-Time Collaboration', 'Codox', 'Markdown Support',
            'Design Blocks', 'Design Builder',
            'Sanitization', 'XSS', 'HTMLAllowedTags', 'Section 508', 'WCAG 2.0', 'Lazy Loading',
            'Perpetual License', 'SaaS', 'OEM', 'Ignition Discount'
            'Froala Editor',
            'HTML',
            'HyperText Markup Language',
            'CSS',
            'JavaScript',
            'DOM',
            'Browser',
            'Web Application',
            'Frontend Development',
            'CMS',
            'Content Management System',
            'LMS',
            'Learning Management System',
            'Framework Integration',
            'Markdown',
            'HTML Content',
            'Plain Text',
            'Code Blocks',
            'Toolbar',
            'Plugins System',
            'Image Management',
            'File Upload',
            'Formatting',
            'Tables',
            'Lists',
            'API',
            'Events System',
            'Initialization',
            'Configuration',
            'Lifecycle',
            'Buttons',
            'Dropdowns',
            'Modals',
            'Popups',
            'Quick Insert',
            'Content Methods',
            'Selection Methods',
            'Event Methods',
            'Initialization Methods',
            'Inline Mode',
            'Fullscreen Mode',
            'Code View',
            'Source Code',
            'Preview Mode',
            'XSS Protection',
            'Content Sanitization',
            'HTML Validation',
            'Input Filtering',
            'Copy/Paste',
            'Undo/Redo',
            'Content Manipulation',
            'Selection API',
            'Image Upload',
            'Video Embed',
            'File Attachment',
            'Media Management',
            'Inline Styles',
            'Block Elements',
            'Custom Classes',
            'HTML Tags',
            'ARIA',
            'Keyboard Navigation',
            'Screen Reader Support',
            'Image Plugin',
            'Table Plugin',
            'Special Characters',
            'Emoticons',
        ]

        # Check which core terms are missing
        existing_titles = {term.title.lower() for term in terms}
        missing_core_terms = []

        for core_term in core_terms_required:
            if core_term.lower() not in existing_titles:
                # Check for variations
                found_variation = False
                for existing_title in existing_titles:
                    if core_term.lower() in existing_title or existing_title in core_term.lower():
                        found_variation = True
                        break
                if not found_variation:
                    missing_core_terms.append(core_term)

        if missing_core_terms:
            logger.info(f"Missing core terms detected: {missing_core_terms}")
            logger.info("Attempting to extract core terms from documentation (in parallel)...")

            # Search for core terms in contexts
            # Prepare context with source IDs
            numbered_chunks = []
            # Use first 10 contexts for core term search
            search_contexts = all_contexts[:10]
            search_sources = context_sources[:10]
            
            for i, chunk in enumerate(search_contexts):
                numbered_chunks.append(f"[Source {i}] {chunk}")
            
            combined_context = "\n\n---\n\n".join(numbered_chunks)

            def fetch_core_term(term_name):
                # Try to extract this core term
                core_prompt = f"""Extract information about "{term_name}" from the following documentation.
I have provided text chunks labeled with [Source ID].
You MUST identify which source ID best defines this term.

Documentation:
{combined_context}

Return a JSON object with this structure:
{{
  "title": "{term_name}",
  "category": "Core Concept",
  "description": "A detailed 150-250 character description of what {term_name} is and why it matters.",
  "source_id": 0,  // The integer ID of the source text where this term is defined
  "sections": {{
    "Key Features": ["Feature 1", "Feature 2", "Feature 3"],
    "Use Cases": ["Use case 1", "Use case 2", "Use case 3"],
    "Implementation": ["Implementation detail 1", "Implementation detail 2"],
    "Best Practices": ["Best practice 1", "Best practice 2"]
  }}
}}

Return only valid JSON, no markdown formatting."""

                try:
                    response = self.openai_client.chat.completions.create(
                        model=GPT_MODEL,
                        messages=[
                            {"role": "system", "content": "You are a technical documentation expert."},
                            {"role": "user", "content": core_prompt}
                        ],
                        temperature=0.3,
                        max_tokens=2000
                    )

                    content = response.choices[0].message.content.strip()
                    if content.startswith("```"):
                        content = content.split("```")[1]
                        if content.startswith("json"):
                            content = content[4:]
                        content = content.strip()

                    term_data = json.loads(content)
                    
                    # Determine source URL based on source_id
                    term_source_urls = []
                    source_id = term_data.get('source_id')
                    
                    if source_id is not None and isinstance(source_id, int) and 0 <= source_id < len(search_sources):
                        if search_sources[source_id]:
                            term_source_urls.append(search_sources[source_id])
                            logger.debug(f"Core term '{term_name}' linked to Source {source_id}: {search_sources[source_id]}")
                    
                    # Fallback
                    if not term_source_urls and search_sources:
                        term_source_urls = [search_sources[0]]
                        logger.debug(f"Core term '{term_name}' fallback to first URL")

                    core_term_obj = GlossaryTerm(
                        title=term_data.get('title', term_name),
                        category=term_data.get('category', 'Core Concept'),
                        description=term_data.get('description', ''),
                        confidence=0.9,  # High confidence for core terms
                        source_urls=term_source_urls,
                        detailed_sections=term_data.get('sections', {})
                    )
                    return core_term_obj
                except Exception as e:
                    logger.warning(f"Failed to extract core term '{term_name}': {e}")
                    return None

            # Use ThreadPoolExecutor to fetch terms in parallel
            with ThreadPoolExecutor(max_workers=5) as executor:
                future_to_term = {executor.submit(fetch_core_term, term): term for term in missing_core_terms}
                
                for future in as_completed(future_to_term):
                    term_name = future_to_term[future]
                    try:
                        result = future.result()
                        if result:
                            terms.append(result)
                            logger.info(f"Added core term: {term_name}")
                    except Exception as e:
                        logger.error(f"Error fetching core term {term_name}: {e}")

        return terms

    def _find_related_terms(self, terms: List[GlossaryTerm]) -> None:
        """
        Find related terms for each term based on category and keyword overlap

        Args:
            terms: List of glossary terms (modified in place)
        """
        import re

        for term in terms:
            related = []
            term_words = set(re.findall(r'\w+', term.title.lower()))

            for other in terms:
                if term == other:
                    continue

                # Terms in same category are related
                if other.category == term.category:
                    related.append({
                        'title': other.title,
                        'description': other.description
                    })
                    if len(related) >= 5:  # Limit to 5 related terms
                        break

                # Terms with overlapping keywords are related
                other_words = set(re.findall(r'\w+', other.title.lower()))
                if term_words & other_words:  # If there's any overlap
                    if not any(r['title'] == other.title for r in related):
                        related.append({
                            'title': other.title,
                            'description': other.description
                        })
                        if len(related) >= 5:
                            break

            term.related_terms = related[:5]  # Keep top 5

    def save_to_json(self, terms: List[GlossaryTerm], filename: str = "glossary_terms.json"):
        """Save glossary terms to JSON file"""
        output_path = os.path.join(os.path.dirname(__file__), filename)

        data = {
            "total_terms": len(terms),
            "terms": [asdict(term) for term in terms]
        }

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        logger.info(f"Saved {len(terms)} terms to {output_path}")

    def save_to_csv(self, terms: List[GlossaryTerm], filename: str = "glossary_terms.csv"):
        """Save glossary terms to CSV file"""
        import csv

        output_path = os.path.join(os.path.dirname(__file__), filename)

        with open(output_path, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['Title', 'Category', 'Description'])

            for term in sorted(terms, key=lambda t: t.title.lower()):
                writer.writerow([term.title, term.category, term.description])

        logger.info(f"Saved {len(terms)} terms to {output_path}")

    def generate_multi_page_html(self, terms: List[GlossaryTerm], output_dir: str = "glossary"):
        """
        Generate multi-page HTML glossary with individual pages for each term

        Args:
            terms: List of glossary terms
            output_dir: Directory to output HTML files
        """
        import os

        # Create output directory
        base_path = os.path.dirname(__file__)
        glossary_dir = os.path.join(base_path, output_dir)
        terms_dir = os.path.join(glossary_dir, "terms")

        os.makedirs(terms_dir, exist_ok=True)

        logger.info(f"Generating multi-page glossary in {glossary_dir}")

        # Generate individual term pages
        for term in terms:
            self._generate_term_page(term, terms, terms_dir)

        # Generate main index page
        self._generate_index_page(terms, glossary_dir)

        logger.info(f"Generated {len(terms)} term pages and index at {glossary_dir}")

    def _generate_term_page(self, term: GlossaryTerm, all_terms: List[GlossaryTerm],
                           output_dir: str) -> None:
        """Generate individual HTML page for a term"""
        slug = term.to_slug()
        filename = os.path.join(output_dir, f"{slug}.html")

        # Create term-to-slug mapping for links
        term_slugs = {t.title: t.to_slug() for t in all_terms}

        html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{self._escape_html(term.title)} - Froala Glossary</title>
    <style>
        * {{ box-sizing: border-box; margin: 0; padding: 0; }}
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
               line-height: 1.6; color: #333; background: #f9fafb; }}
        .container {{ max-width: 1100px; margin: 0 auto; padding: 20px; }}
        .search-bar {{ background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px;
                      box-shadow: 0 1px 3px rgba(0,0,0,0.1); }}
        .search-input {{ width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px;
                        font-size: 14px; }}
        .main-content {{ background: #fff; padding: 40px; border-radius: 8px; border-left: 4px solid #0098F7;
                        box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 20px; }}
        h1 {{ color: #2c3e50; font-size: 2.2em; margin-bottom: 15px; }}
        .category-badge {{ display: inline-block; background: #0098F7; color: white; padding: 6px 18px;
                          border-radius: 4px; font-size: 0.85em; font-weight: 600; margin-bottom: 20px; }}
        .description {{ font-size: 1.05em; color: #555; line-height: 1.7; margin-bottom: 30px; }}

        .detail-section {{ margin: 35px 0; }}
        .detail-section h2 {{ color: #2c3e50; font-size: 1.4em; margin-bottom: 15px; font-weight: 600; }}
        .detail-section ul {{ list-style: none; padding: 0; margin: 0; }}
        .detail-section li {{ padding: 8px 0 8px 25px; position: relative; color: #34495e;
                             line-height: 1.6; }}
        .detail-section li:before {{ content: "•"; position: absolute; left: 8px; color: #0098F7;
                                     font-weight: bold; font-size: 1.2em; }}

        .doc-link-section {{ background: #e6f4ff; padding: 25px; border-radius: 8px; margin: 30px 0;
                            border-left: 4px solid #0098F7; }}
        .doc-link-section h3 {{ color: #2c3e50; font-size: 1.1em; margin-bottom: 10px; }}
        .doc-link-section p {{ color: #555; margin-bottom: 15px; font-size: 0.95em; }}
        .doc-button {{ display: inline-block; background: #0098F7; color: white; padding: 12px 24px;
                      text-decoration: none; border-radius: 5px; font-weight: 600; font-size: 0.95em;
                      transition: all 0.3s; }}
        .doc-button:hover {{ background: #0077C2; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,152,247,0.3); }}
        .doc-button:before {{ content: "🔗 "; }}

        .related-section {{ margin: 40px 0; }}
        .related-section h2 {{ color: #2c3e50; font-size: 1.6em; margin-bottom: 20px; font-weight: 600; }}
        .related-grid {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 20px; margin-top: 20px; }}
        .related-card {{ background: #f8f9fa; padding: 20px; border-radius: 8px; text-decoration: none;
                        display: block; transition: all 0.3s; border: 2px solid transparent; }}
        .related-card:hover {{ border-color: #0098F7; box-shadow: 0 4px 12px rgba(0,152,247,0.2);
                              transform: translateY(-3px); }}
        .related-card h3 {{ color: #2c3e50; font-size: 1.15em; margin-bottom: 8px; font-weight: 600; }}
        .related-card p {{ color: #7f8c8d; font-size: 0.9em; line-height: 1.5; margin: 0; }}

        .back-button {{ display: inline-block; margin-top: 30px; padding: 12px 30px; background: #0098F7;
                       color: white; text-decoration: none; border-radius: 5px; font-weight: 600;
                       transition: all 0.3s; }}
        .back-button:hover {{ background: #0077C2; }}
        .back-button:before {{ content: "← "; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="search-bar">
            <input type="text" class="search-input" placeholder="Search terms..."
                   onclick="window.location.href='../index.html'">
        </div>

        <div class="main-content">
            <h1>{self._escape_html(term.title)}</h1>
            <span class="category-badge">{self._escape_html(term.category)}</span>

            <div class="description">
                {self._escape_html(term.description)}
            </div>

            {self._generate_detailed_sections(term)}

            {self._generate_documentation_link_section(term)}
        </div>

        {self._generate_related_terms_cards(term, term_slugs)}

        <a href="../index.html" class="back-button">Back to All Terms</a>
    </div>
</body>
</html>'''

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)

    def _generate_detailed_sections(self, term: GlossaryTerm) -> str:
        """Generate detailed content sections with bullet points"""
        if not term.detailed_sections:
            return ''

        sections_html = []
        for section_title, bullet_points in term.detailed_sections.items():
            if bullet_points:
                bullets_html = '\n'.join([
                    f'                    <li>{self._escape_html(point)}</li>'
                    for point in bullet_points
                ])
                sections_html.append(f'''
            <div class="detail-section">
                <h2>{self._escape_html(section_title)}</h2>
                <ul>
{bullets_html}
                </ul>
            </div>''')

        return ''.join(sections_html)

    def _generate_documentation_link_section(self, term: GlossaryTerm) -> str:
        """Generate Froala documentation link section"""
        if not term.source_urls:
            return ''

        # Use first source URL as the primary documentation link
        doc_url = term.source_urls[0]

        return f'''
            <div class="doc-link-section">
                <h3>📚 Froala Documentation</h3>
                <p>Learn more about {self._escape_html(term.title)} in the official Froala documentation:</p>
                <a href="{self._escape_html(doc_url)}" target="_blank" class="doc-button">View Official Documentation</a>
            </div>'''

    def _generate_related_terms_cards(self, term: GlossaryTerm,
                                     term_slugs: Dict[str, str]) -> str:
        """Generate related terms as cards with descriptions"""
        if not term.related_terms:
            return ''

        cards_html = []
        for related in term.related_terms:
            title = related.get('title', '')
            description = related.get('description', '')
            slug = term_slugs.get(title, '')

            if slug and title:
                cards_html.append(f'''
                <a href="{slug}.html" class="related-card">
                    <h3>{self._escape_html(title)}</h3>
                    <p>{self._escape_html(description)}</p>
                </a>''')

        if not cards_html:
            return ''

        return f'''
        <div class="related-section">
            <h2>Related Terms</h2>
            <div class="related-grid">
{''.join(cards_html)}
            </div>
        </div>'''

    def _generate_index_page(self, terms: List[GlossaryTerm], output_dir: str) -> None:
        """Generate main glossary index page"""
        filename = os.path.join(output_dir, "index.html")

        # Group terms by letter
        terms_by_letter = defaultdict(list)
        for term in sorted(terms, key=lambda t: t.title.lower()):
            first_letter = term.title[0].upper()
            if first_letter.isalpha():
                terms_by_letter[first_letter].append(term)
            else:
                terms_by_letter['#'].append(term)

        html_parts = ['''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Froala Editor Glossary</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
               line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { background: #fff; padding: 30px 0; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #2c3e50; font-size: 2.5em; }
        .search-box { margin: 30px 0; text-align: center; }
        .search-input { width: 100%; max-width: 600px; padding: 15px 20px; font-size: 16px;
                        border: 2px solid #ddd; border-radius: 8px; }
        .search-input:focus { outline: none; border-color: #3498db; }
        .letter-section { background: #fff; margin-bottom: 20px; border-radius: 8px; padding: 20px;
                         box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .letter-header { font-size: 2em; color: #3498db; border-bottom: 3px solid #3498db;
                        padding-bottom: 10px; margin-bottom: 20px; }
        .glossary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .glossary-item { padding: 20px; border: 2px solid #e0e0e0; border-radius: 8px;
                        transition: all 0.3s; cursor: pointer; text-decoration: none; display: block; }
        .glossary-item:hover { border-color: #3498db; box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                              transform: translateY(-2px); }
        .term-title { font-size: 1.3em; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
        .term-category { font-size: 0.9em; color: #7f8c8d; margin-bottom: 10px; font-weight: 500; }
        .term-description { color: #555; font-size: 0.95em; }
        .stats { text-align: center; margin: 20px 0; color: #7f8c8d; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Froala Editor Glossary</h1>
            <div class="stats">Total Terms: <strong>''' + str(len(terms)) + '''</strong></div>
        </div>
    </header>

    <div class="container">
        <div class="search-box">
            <input type="text" class="search-input" id="searchInput" placeholder="Search terms, categories, or descriptions...">
        </div>

''']

        # Generate sections for each letter
        for letter in sorted(terms_by_letter.keys()):
            letter_terms = terms_by_letter[letter]

            html_parts.append(f'''        <div class="letter-section" data-letter="{letter}">
            <div class="letter-header">{letter}</div>
            <div class="glossary-grid">
''')

            for term in letter_terms:
                slug = term.to_slug()
                html_parts.append(f'''                <a href="terms/{slug}.html" class="glossary-item">
                    <div class="term-title">{self._escape_html(term.title)}</div>
                    <div class="term-category">{self._escape_html(term.category)}</div>
                    <div class="term-description">{self._escape_html(term.description)}</div>
                </a>
''')

            html_parts.append('''            </div>
        </div>

''')

        # Add JavaScript for search functionality
        html_parts.append('''    </div>

    <script>
        const searchInput = document.getElementById('searchInput');
        const letterSections = document.querySelectorAll('.letter-section');

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            letterSections.forEach(section => {
                const items = section.querySelectorAll('.glossary-item');
                let hasVisibleItems = false;

                items.forEach(item => {
                    const title = item.querySelector('.term-title')?.textContent.toLowerCase() || '';
                    const category = item.querySelector('.term-category')?.textContent.toLowerCase() || '';
                    const description = item.querySelector('.term-description')?.textContent.toLowerCase() || '';

                    if (title.includes(searchTerm) || category.includes(searchTerm) || description.includes(searchTerm)) {
                        item.style.display = 'block';
                        hasVisibleItems = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                section.style.display = hasVisibleItems ? 'block' : 'none';
            });
        });
    </script>
</body>
</html>''')

        html_content = ''.join(html_parts)

        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html_content)

    def generate_html(self, terms: List[GlossaryTerm], filename: str = "froala_glossary.html"):
        """Generate HTML glossary page similar to reference.html"""
        output_path = os.path.join(os.path.dirname(__file__), filename)

        # Group terms by first letter
        terms_by_letter = defaultdict(list)
        for term in sorted(terms, key=lambda t: t.title.lower()):
            first_letter = term.title[0].upper()
            if first_letter.isalpha():
                terms_by_letter[first_letter].append(term)
            else:
                terms_by_letter['#'].append(term)

        # Generate HTML
        html_parts = ['''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Froala Editor Glossary</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        header { background: #fff; padding: 30px 0; margin-bottom: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #2c3e50; font-size: 2.5em; }
        .search-box { margin: 30px 0; text-align: center; }
        .search-input { width: 100%; max-width: 600px; padding: 15px 20px; font-size: 16px; border: 2px solid #ddd; border-radius: 8px; }
        .search-input:focus { outline: none; border-color: #3498db; }
        .letter-section { background: #fff; margin-bottom: 20px; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .letter-header { font-size: 2em; color: #3498db; border-bottom: 3px solid #3498db; padding-bottom: 10px; margin-bottom: 20px; }
        .glossary-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .glossary-item { padding: 20px; border: 2px solid #e0e0e0; border-radius: 8px; transition: all 0.3s; cursor: pointer; }
        .glossary-item:hover { border-color: #3498db; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transform: translateY(-2px); }
        .term-title { font-size: 1.3em; font-weight: 600; color: #2c3e50; margin-bottom: 8px; }
        .term-category { font-size: 0.9em; color: #7f8c8d; margin-bottom: 10px; font-weight: 500; }
        .term-description { color: #555; font-size: 0.95em; }
        .stats { text-align: center; margin: 20px 0; color: #7f8c8d; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <h1>Froala Editor Glossary</h1>
            <div class="stats">Total Terms: <strong>''' + str(len(terms)) + '''</strong></div>
        </div>
    </header>

    <div class="container">
        <div class="search-box">
            <input type="text" class="search-input" id="searchInput" placeholder="Search terms, categories, or descriptions...">
        </div>

''']

        # Generate sections for each letter
        for letter in sorted(terms_by_letter.keys()):
            letter_terms = terms_by_letter[letter]

            html_parts.append(f'''        <div class="letter-section" data-letter="{letter}">
            <div class="letter-header">{letter}</div>
            <div class="glossary-grid">
''')

            for term in letter_terms:
                html_parts.append(f'''                <div class="glossary-item">
                    <div class="term-title">{self._escape_html(term.title)}</div>
                    <div class="term-category">{self._escape_html(term.category)}</div>
                    <div class="term-description">{self._escape_html(term.description)}</div>
                </div>
''')

            html_parts.append('''            </div>
        </div>

''')

        # Add JavaScript for search functionality
        html_parts.append('''    </div>

    <script>
        const searchInput = document.getElementById('searchInput');
        const letterSections = document.querySelectorAll('.letter-section');

        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            letterSections.forEach(section => {
                const items = section.querySelectorAll('.glossary-item');
                let hasVisibleItems = false;

                items.forEach(item => {
                    const title = item.querySelector('.term-title')?.textContent.toLowerCase() || '';
                    const category = item.querySelector('.term-category')?.textContent.toLowerCase() || '';
                    const description = item.querySelector('.term-description')?.textContent.toLowerCase() || '';

                    if (title.includes(searchTerm) || category.includes(searchTerm) || description.includes(searchTerm)) {
                        item.style.display = 'block';
                        hasVisibleItems = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                section.style.display = hasVisibleItems ? 'block' : 'none';
            });
        });
    </script>
</body>
</html>''')

        html_content = ''.join(html_parts)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html_content)

        logger.info(f"Generated HTML glossary at {output_path}")

    def _escape_html(self, text: str) -> str:
        """Escape HTML special characters"""
        return (text
                .replace('&', '&amp;')
                .replace('<', '&lt;')
                .replace('>', '&gt;')
                .replace('"', '&quot;')
                .replace("'", '&#39;'))


def main():
    """Main execution function"""
    logger.info("=" * 60)
    logger.info("Froala Glossary Generator")
    logger.info("=" * 60)

    try:
        # Initialize generator
        generator = FroalaGlossaryGenerator()

        # Generate glossary
        # Balanced configuration for reasonable runtime while getting comprehensive coverage
        terms = generator.generate_glossary(
            num_queries=35,           # Increased to cover all queries including new research plan ones
            results_per_query=30,     # Get 30 results per query
            batch_size=15             # Process 15 chunks at a time
        )

        if not terms:
            logger.warning("No terms were generated!")
            return

        # Display sample terms
        logger.info("\n" + "=" * 60)
        logger.info("Sample Generated Terms:")
        logger.info("=" * 60)
        for term in terms[:5]:
            logger.info(f"\nTitle: {term.title}")
            logger.info(f"Category: {term.category}")
            logger.info(f"Description: {term.description}")

        # Save outputs
        logger.info("\n" + "=" * 60)
        logger.info("Saving outputs...")
        logger.info("=" * 60)

        generator.save_to_json(terms)
        generator.save_to_csv(terms)

        # Generate multi-page HTML structure with individual term pages
        generator.generate_multi_page_html(terms, output_dir="glossary")

        # Also generate single-page version for backward compatibility
        generator.generate_html(terms)

        logger.info("\n" + "=" * 60)
        logger.info("Glossary generation complete!")
        logger.info(f"Total terms generated: {len(terms)}")
        logger.info("Check the 'glossary/' directory for individual term pages")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"Error during glossary generation: {e}", exc_info=True)
        raise


if __name__ == "__main__":
    main()
