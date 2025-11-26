import zipfile
import os

def inspect_docx(file_path):
    try:
        with zipfile.ZipFile(file_path) as docx:
            # List all files
            print("Files in zip:")
            for name in docx.namelist():
                print(name)
            
            # Extract document.xml
            if 'word/document.xml' in docx.namelist():
                with open('debug_content.xml', 'wb') as f:
                    f.write(docx.read('word/document.xml'))
                print("\nExtracted word/document.xml to debug_content.xml")
            else:
                print("\nword/document.xml not found!")
                
    except Exception as e:
        print(f"Error inspecting docx: {str(e)}")

if __name__ == "__main__":
    file_path = r"c:\Users\Carl Justine Cruz\Documents\GitHub\FroalaCodes\froala_glossary\Froala Glossary Research Plan.docx"
    inspect_docx(file_path)
