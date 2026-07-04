import re

files_to_fix = [
    "src/app/[slug]/page.tsx",
    "src/app/api/category-filters/route.ts",
    "src/lib/graphql/queries.ts"
]

for f in files_to_fix:
    with open(f, 'r') as file:
        content = file.read()
    
    # Replace the empty terms nodes with the one that includes logo
    new_content = content.replace(
        "slug\n                                            }",
        "slug\n                                                ... on PaThuongHieu {\n                                                    logo {\n                                                        logo {\n                                                            node { sourceUrl }\n                                                        }\n                                                    }\n                                                }\n                                            }"
    )
    # For route.ts
    new_content = new_content.replace(
        "slug\n                                    }",
        "slug\n                                        ... on PaThuongHieu {\n                                            logo {\n                                                logo {\n                                                    node { sourceUrl }\n                                                }\n                                            }\n                                        }\n                                    }"
    )
    # For queries.ts
    new_content = new_content.replace(
        "slug\n                    }",
        "slug\n                    ... on PaThuongHieu {\n                      logo {\n                        logo {\n                          node {\n                            sourceUrl\n                          }\n                        }\n                      }\n                    }\n                  }"
    )
    
    with open(f, 'w') as file:
        file.write(new_content)

print("Restored PaThuongHieu GraphQL queries")
