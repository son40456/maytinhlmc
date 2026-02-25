"use client";

import React from 'react';
import { useRelatedProductsModalStore } from '@/store/useRelatedProductsModalStore';
import { RelatedProductsModal } from './RelatedProductsModal';

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
