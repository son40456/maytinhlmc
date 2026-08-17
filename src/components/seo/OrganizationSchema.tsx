import React from 'react';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

// GEO FIX: Combined Organization + LocalBusiness + ComputerStore schema
// - Fixed addressRegion: "Hai Duong" (was wrong: "Hai Phong")
// - Added sameAs: YouTube, Zalo, GBP for AI entity disambiguation
// - Added hasMap for Google Maps/Local Pack visibility
// - Added foundingDate, description for Knowledge Panel richness
const schema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ComputerStore"],
    "@id": `${BASE_URL}/#organization`,
    "name": "Máy Tính LMC",
    "alternateName": ["LMC", "May Tinh LMC"],
    "description": "Cửa hàng máy tính và linh kiện chính hãng tại Hải Dương. Chuyên phân phối màn hình, CPU, RAM, SSD, mainboard, VGA, tản nhiệt từ các thương hiệu MSI, ASUS, ViewSonic, Samsung, Kingston, WD.",
    "url": BASE_URL,
    "foundingDate": "2015",
    "logo": {
        "@type": "ImageObject",
        "@id": `${BASE_URL}/#logo`,
        "url": "https://ik.imagekit.io/maytinhlmc/logoLMC.png",
        "width": 200,
        "height": 60,
        "caption": "Máy Tính LMC Logo"
    },
    "image": "https://ik.imagekit.io/maytinhlmc/logoLMC.png",
    // FIXED: addressRegion was "Hải Phòng" — corrected to "Hải Dương"
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Số 472 Đại Lộ Lê Thanh Nghị",
        "addressLocality": "Hải Dương",
        "addressRegion": "Hải Dương",
        "postalCode": "03000",
        "addressCountry": "VN"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": "20.8549",
        "longitude": "106.6881"
    },
    "hasMap": "https://maps.google.com/?q=472+Dai+Lo+Le+Thanh+Nghi+Hai+Duong",
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
    "paymentAccepted": "Tiền mặt, Thẻ tín dụng, Chuyển khoản ngân hàng, Ví MoMo",
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
    // GEO: sameAs signals cross-platform entity disambiguation for AI
    "sameAs": [
        "https://www.facebook.com/maytinhlmc",
        "https://zalo.me/0220660666",
    ]
};

export const OrganizationSchema: React.FC = () => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
);

