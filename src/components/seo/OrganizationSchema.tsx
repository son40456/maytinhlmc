import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

// H2 + H4: Combined Organization + LocalBusiness schema
// Organization signals brand entity; LocalBusiness enables Google Maps/Local rich results
const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ComputerStore"],
    "name": "Máy Tính LMC",
    "alternateName": "LMC",
    "url": BASE_URL,
    "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`,
        "width": 200,
        "height": 60,
    },
    // H2: Full PostalAddress — required for rich results & local SEO
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Số 472 Đại Lộ Lê Thanh Nghị",
        "addressLocality": "Hải Dương",
        "addressRegion": "Hải Phòng",
        "postalCode": "03000",
        "addressCountry": "VN"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": "20.8549",
        "longitude": "106.6881"
    },
    // H4: LocalBusiness fields
    "openingHoursSpecification": [
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
            "opens": "08:00",
            "closes": "21:00"
        },
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Sunday"],
            "opens": "09:00",
            "closes": "20:00"
        }
    ],
    "priceRange": "₫₫",
    "currenciesAccepted": "VND",
    "paymentAccepted": "Cash, Credit Card, Bank Transfer",
    // Multiple contact points for both hotlines
    "contactPoint": [
        {
            "@type": "ContactPoint",
            "telephone": "+842206606666",
            "contactType": "sales",
            "areaServed": "VN",
            "availableLanguage": "Vietnamese"
        },
        {
            "@type": "ContactPoint",
            "telephone": "+84985633455",
            "contactType": "customer service",
            "areaServed": "VN",
            "availableLanguage": "Vietnamese"
        }
    ],
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
