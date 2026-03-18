import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Máy Tính LMC",
    "alternateName": "LMC",
    "url": BASE_URL,
    "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
        "width": 200,
        "height": 60,
    },
    "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+84985633455",
        "contactType": "customer service",
        "areaServed": "VN",
        "availableLanguage": "Vietnamese"
    },
    "address": {
        "@type": "PostalAddress",
        "addressCountry": "VN"
    },
    "sameAs": [
        "https://www.facebook.com/maytinhlmc",
    ]
};

export const OrganizationSchema: React.FC = () => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
);
