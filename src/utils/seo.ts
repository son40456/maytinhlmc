// src/utils/seo.ts

export const SITE_NAME = "LMC";
export const SITE_URL = "https://maytinhlmc.vn";

function cleanText(text?: string) {
    if (!text) return "";

    return text
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function truncate(text: string, length = 155) {
    if (text.length <= length) return text;
    return text.slice(0, length).trim() + "...";
}

/* =============================
PRODUCT SEO
============================= */

export function generateProductSEO(
    productName: string,
    slug: string,
    shortDescription?: string,
    image?: string,
    price?: string
) {
    const title = `Mua ${productName} chính hãng | Giá tốt tại ${SITE_NAME}`;

    const baseDesc = `Mua ${productName} chính hãng tại ${SITE_NAME}. Trả góp 0%, giao hàng toàn quốc, bảo hành uy tín.`;

    const excerpt = truncate(cleanText(shortDescription), 80);

    const description = truncate(`${baseDesc} ${excerpt}`);

    const url = `${SITE_URL}/${slug}`;

    // Next.js Metadata API format
    return {
        title,
        description,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description,
            url,
            siteName: SITE_NAME,
            type: "product",
            images: image
                ? [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                    },
                ]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: image ? [image] : undefined,
        },
        // Schema dữ liệu ngầm (JSON-LD) map vào riêng để render component Script
        jsonLd: {
            "@context": "https://schema.org/",
            "@type": "Product",
            name: productName,
            image: image ? [image] : [],
            description: description,
            brand: {
                "@type": "Brand",
                name: SITE_NAME,
            },
            offers: price
                ? {
                    "@type": "Offer",
                    priceCurrency: "VND",
                    price: price,
                    availability: "https://schema.org/InStock",
                    url: url,
                }
                : undefined,
        },
    };
}

/* =============================
CATEGORY SEO
============================= */

export function generateCategorySEO(
    categoryName: string,
    slug: string,
    description?: string
) {
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const title = `${categoryName} chính hãng | Bảng giá ${month}/${year} - ${SITE_NAME}`;

    const desc =
        description ||
        `Tổng hợp các dòng ${categoryName} chính hãng, cấu hình mạnh, giá tốt nhất. Xem bảng giá mới nhất tại ${SITE_NAME}.`;

    const finalDesc = truncate(cleanText(desc));

    const url = `${SITE_URL}/${slug}`;

    return {
        title,
        description: finalDesc,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description: finalDesc,
            url,
            siteName: SITE_NAME,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: finalDesc,
        },
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: categoryName,
            description: finalDesc,
            url: url,
        },
    };
}

/* =============================
POST SEO
============================= */

export function generatePostSEO(
    postTitle: string,
    slug: string,
    excerpt?: string,
    image?: string
) {
    const title = `${postTitle} | ${SITE_NAME}`;

    const desc = truncate(cleanText(excerpt || postTitle));

    const url = `${SITE_URL}/${slug}`;

    return {
        title,
        description: desc,
        alternates: {
            canonical: url,
        },
        openGraph: {
            title,
            description: desc,
            url,
            siteName: SITE_NAME,
            type: "article",
            images: image
                ? [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                    },
                ]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: desc,
            images: image ? [image] : undefined,
        },
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: postTitle,
            image: image ? [image] : [],
            description: desc,
            publisher: {
                "@type": "Organization",
                name: SITE_NAME,
            },
        },
    };
}

/* =============================
BREADCRUMB SCHEMA
============================= */

export function generateBreadcrumbSchema(items: {
    name: string;
    url: string;
}[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };
}
