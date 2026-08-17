import React from 'react';

interface ProductSchemaProps {
    name: string;
    description: string;
    image: string;
    price: number | string;
    url: string;
    stockStatus: string;
    sku?: string;
    brandName?: string | null; // GEO: brand for entity disambiguation
}

export const ProductSchema: React.FC<ProductSchemaProps> = ({
    name,
    description,
    image,
    price,
    url,
    stockStatus,
    sku,
    brandName,
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
        // GEO: brand field helps AI distinguish "Samsung SSD" from "Samsung TV" etc.
        ...(brandName && {
            "brand": {
                "@type": "Brand",
                "name": brandName
            }
        }),
        "offers": {
            "@type": "Offer",
            "url": url,
            "priceCurrency": "VND",
            "price": numericPrice,
            "availability": isAvailable,
            "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "seller": {
                "@type": "Organization",
                "@id": "https://maytinhlmc.vn/#organization",
                "name": "Máy Tính LMC"
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
