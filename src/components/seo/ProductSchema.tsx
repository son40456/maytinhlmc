import React from 'react';

interface ProductSchemaProps {
    name: string;
    description: string;
    image: string;
    price: number | string;
    url: string;
    stockStatus: string;
    sku?: string;
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
    name,
    description,
    image,
    price,
    url,
    stockStatus,
    sku
}) => {
    const isAvailable = stockStatus === 'IN_STOCK' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

    // Clean description of HTML tags if present
    const cleanDescription = description?.replace(/<[^>]+>/g, '') || '';

    // Normalize price to a number
    const numericPrice = typeof price === 'string' ? parseFloat(price.replace(/[^\d.-]/g, '')) || 0 : price;

    const schema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": name,
        "image": image,
        "description": cleanDescription,
        ...(sku && { "sku": sku }),
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "VND",
            "price": numericPrice,
            "availability": isAvailable,
            "seller": {
                "@type": "Organization",
                "name": "LMC"
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
};
