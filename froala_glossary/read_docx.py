import zipfile
import re
import os

def read_docx_debug(file_path):
    try:
        with zipfile.ZipFile(file_path) as docx:
            xml_content = docx.read('word/document.xml').decode('utf-8')
            
            # Debug: print start of XML
            print("--- XML START ---")
            print(xml_content[:1000])
            print("--- XML END ---")
            
            # Regex to extract text
            # <w:t>Text</w:t> or <w:t xml:space="preserve">Text</w:t>
            text_parts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', xml_content)
            return '\n'.join(text_parts)
    except Exception as e:
        return f"Error reading docx: {str(e)}"

if __name__ == "__main__":
    file_path = r"c:\Users\Carl Justine Cruz\Documents\GitHub\FroalaCodes\froala_glossary\Froala Glossary Research Plan.docx"
    if os.path.exists(file_path):
        print(read_docx_debug(file_path))
    else:
        print(f"File not found: {file_path}")
