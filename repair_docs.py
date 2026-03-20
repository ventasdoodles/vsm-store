import re

path = r'c:\Users\dgcar\OneDrive\Desktop\VSM pwa\vsm-store\AI_CONTEXT.md'

with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix double bars: │   ││ -> │   │
content = content.replace('│   ││', '│   │')

# Fix triple bars if any: │   │││ -> │   │
content = content.replace('│   │││', '│   │')

# Fix malformed pages/admin indentation (5 spaces -> 4 spaces)
content = re.sub(r'^     │   ├── admin/', r'        ├── admin/', content, flags=re.MULTILINE)
content = re.sub(r'^    │   ├── \(23', r'        ├── (23', content, flags=re.MULTILINE)
content = re.sub(r'^    │   ├── auth/', r'        ├── auth/', content, flags=re.MULTILINE)
content = re.sub(r'^    │   ├── legal/', r'        ├── legal/', content, flags=re.MULTILINE)
content = re.sub(r'^    │   └── user/', r'        ├── user/', content, flags=re.MULTILINE)

# Final sweep of encoding artifacts
content = content.replace('â€”', '—')
content = content.replace('Â§', '§')
content = content.replace('Â¿', '¿')
content = content.replace('Ã³', 'ó')
content = content.replace('Ã­', 'í')
content = content.replace('Ã¡', 'á')
content = content.replace('Ã©', 'é')
content = content.replace('Ãº', 'ú')
content = content.replace('Ã±', 'ñ')
content = content.replace('Ã«', 'ë')
content = content.replace('â€“', '–')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Repair completed.")
