interface CategorySchemaProps {
    name: string;
    description?: string;
    url: string;
}

export function CategorySchema({ name, description, url }: CategorySchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": name,
        "description": description || `Danh mục sản phẩm ${name} chính hãng tại LMC`,
        "url": url,
        "publisher": {
            "@type": "Organization",
            "name": "LMC",
            "logo": {
                "@type": "ImageObject",
                "url": "https://lmc.vn/logo.png"
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
