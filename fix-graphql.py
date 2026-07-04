import re
import glob

files_to_fix = [
    "src/app/api/category-filters/route.ts",
    "src/lib/graphql/queries.ts"
]

pattern = re.compile(r'\s*\.\.\.\s*on\s*PaThuongHieu\s*\{\s*logo\s*\{\s*logo\s*\{\s*node\s*\{\s*sourceUrl\s*\}\s*\}\s*\}\s*\}')

for f in files_to_fix:
    with open(f, 'r') as file:
        content = file.read()
    
    new_content = pattern.sub('', content)
    
    with open(f, 'w') as file:
        file.write(new_content)

print("Fixed GraphQL PaThuongHieu queries")
