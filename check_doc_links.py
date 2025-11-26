import os
import re
from pathlib import Path

def extract_doc_link(html_file):
    """Extract the 'View Official Documentation' link from an HTML file."""
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Look for "View Official Documentation" link
    pattern = r'<a href="([^"]+)"[^>]*>View Official Documentation</a>'
    match = re.search(pattern, content)

    if match:
        return match.group(1)
    return None

def check_all_links():
    """Check all HTML files in the terms directory."""
    terms_dir = Path(r'c:\Users\Carl Justine Cruz\Documents\GitHub\FroalaCodes\froala_glossary\glossary\terms')

    issues = []

    for html_file in sorted(terms_dir.glob('*.html')):
        link = extract_doc_link(html_file)

        if link:
            # Check if link points to /features/ or just froala.com
            if '/features/' in link or link == 'https://froala.com' or link.endswith('froala.com/'):
                issues.append({
                    'file': html_file.name,
                    'link': link,
                    'reason': 'Generic /features/ or froala.com link'
                })

    return issues

if __name__ == '__main__':
    print("Checking all documentation links...\n")
    issues = check_all_links()

    if issues:
        print(f"Found {len(issues)} files with problematic links:\n")
        for issue in issues:
            print(f"File: {issue['file']}")
            print(f"  Current Link: {issue['link']}")
            print(f"  Issue: {issue['reason']}")
            print()
    else:
        print("No issues found!")
