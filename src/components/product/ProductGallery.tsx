"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
    mainImage: {
        sourceUrl: string;
        altText?: string;
    };
    galleryNodes: Array<{
        sourceUrl: string;
        altText?: string;
    }>;
    name: string;
}

export function ProductGallery({ mainImage, galleryNodes, name }: ProductGalleryProps) {
    const allImages = [mainImage, ...galleryNodes].filter(img => img?.sourceUrl);
    const [activeImage, setActiveImage] = useState(allImages[0]);

    if (!activeImage?.sourceUrl) {
        return (
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-200 shadow-inner">
                Không có hình ảnh
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm group">
                <Image
                    src={activeImage.sourceUrl}
                    alt={activeImage.altText || name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                />
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                    {allImages.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveImage(img)}
                            className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white ${activeImage.sourceUrl === img.sourceUrl
                                    ? "border-blue-600 ring-2 ring-blue-100"
                                    : "border-gray-100 hover:border-blue-300"
                                }`}
                        >
                            <Image
                                src={img.sourceUrl}
                                alt={img.altText || `${name} thumbnail ${idx}`}
                                fill
                                className="object-cover p-1"
                                sizes="100px"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
