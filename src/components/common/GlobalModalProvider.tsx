"use client";

import React from 'react';
import { useRelatedProductsModalStore } from '@/store/useRelatedProductsModalStore';
import dynamic from 'next/dynamic';
const RelatedProductsModal = dynamic(() => import('./RelatedProductsModal').then(mod => mod.RelatedProductsModal), {
    ssr: false
});

export function GlobalModalProvider({ children }: { children: React.ReactNode }) {
    const { isOpen, closeModal, relatedProducts } = useRelatedProductsModalStore();

    return (
        <>
            {children}
            <RelatedProductsModal
                isOpen={isOpen}
                onClose={closeModal}
                relatedProducts={relatedProducts}
            />
        </>
    );
}
