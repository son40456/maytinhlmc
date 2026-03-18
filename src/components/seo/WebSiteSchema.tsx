import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Máy Tính LMC",
    "url": BASE_URL,
    "potentialAction": {
        "@type": "SearchAction",
        "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
        },
        "query-input": "required name=search_term_string"
    }
};

export const WebSiteSchema: React.FC = () => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
);
