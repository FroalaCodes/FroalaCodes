from qdrant_client import QdrantClient
from openai import OpenAI
import re
from pathlib import Path

# Get API key
glossary_script = Path('froala_glossary/generate_glossary.py')
with open(glossary_script, 'r', encoding='utf-8') as f:
    content = f.read()
    match = re.search(r'OPENAI_API_KEY\s*=\s*["\']([^"\']+)["\']', content)
    api_key = match.group(1)

# Test query
client = QdrantClient(host='localhost', port=6333)
openai_client = OpenAI(api_key=api_key)

embedding = openai_client.embeddings.create(
    model='text-embedding-3-large',
    input='accessibility features for users with disabilities'
).data[0].embedding

results = client.search(
    collection_name='froala_docs_v3',
    query_vector=embedding,
    limit=3
)

print(f"Found {len(results)} results\n")
for i, result in enumerate(results, 1):
    print(f"Result {i}:")
    print(f"  Score: {result.score}")
    print(f"  Payload keys: {result.payload.keys() if hasattr(result, 'payload') else 'No payload'}")
    if hasattr(result, 'payload'):
        print(f"  Payload: {result.payload}")
    print()
