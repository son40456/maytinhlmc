"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

interface StickyBuyBarProps {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
    stockStatus: string;
}

export function StickyBuyBar({ id, databaseId, name, price, imageUrl, slug, stockStatus }: StickyBuyBarProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Hiển thị khi cuộn quá 600px (thường là qua phần hero)
            if (window.scrollY > 600) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-50 transform transition-transform duration-300 animate-in slide-in-from-bottom-full">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-12 h-12 rounded-lg border border-gray-100 bg-white flex-shrink-0 overflow-hidden hidden sm:block">
                        <Image src={imageUrl} alt={name} fill className="object-contain p-1" />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-bold text-gray-900 truncate max-w-[200px] sm:max-w-[400px]">{name}</h4>
                        <p className="text-red-600 font-bold text-sm tracking-tight">{price}</p>
                    </div>
                </div>

                <div className="flex-shrink-0">
                    <AddToCartButton
                        id={id}
                        databaseId={databaseId}
                        name={name}
                        price={price}
                        imageUrl={imageUrl}
                        slug={slug}
                        stockStatus={stockStatus}
                        size="sm"
                    />
                </div>
            </div>
        </div>
    );
}
