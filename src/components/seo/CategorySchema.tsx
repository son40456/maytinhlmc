import React from 'react';

const BASE_URL = 'https://maytinhlmc.vn';

interface ProductItem {
    slug: string;
    name: string;
    image?: { sourceUrl?: string };
}

interface CategorySchemaProps {
    products: ProductItem[];
    categoryName: string;
    categorySlug: string;
    categoryDescription?: string;
}

/**
 * GEO: ItemList schema for category pages.
 * Helps AI engines (Google AI Mode, ChatGPT, Perplexity) understand
 * the page as a structured product list, increasing citability when
 * users ask "where to buy [product]" or "best [product] in Vietnam".
 */
export const CategorySchema: React.FC<CategorySchemaProps> = ({
    products,
    categoryName,
    categorySlug,
    categoryDescription,
}) => {
    const categoryUrl = `${BASE_URL}/${categorySlug}`;

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${categoryUrl}/#itemlist`,
        "name": categoryName,
        "url": categoryUrl,
        ...(categoryDescription && { "description": categoryDescription }),
        "numberOfItems": products.length,
        "itemListElement": products.slice(0, 12).map((product, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "url": `${BASE_URL}/${product.slug}`,
            "name": product.name,
            ...(product.image?.sourceUrl && {
                "image": product.image.sourceUrl,
            }),
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
