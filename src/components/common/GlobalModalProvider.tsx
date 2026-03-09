"use client";

import React from 'react';
import { useRelatedProductsModalStore } from '@/store/useRelatedProductsModalStore';
import dynamic from 'next/dynamic';
const RelatedProductsModal = dynamic(() => import('./RelatedProductsModal').then(mod => mod.RelatedProductsModal), {
    ssr: false
});

const CompareBar = dynamic(() => import('./CompareBar').then(mod => mod.CompareBar), {
    ssr: false
});

const ToastContainer = dynamic(() => import('./ToastContainer').then(mod => mod.ToastContainer), {
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
            <CompareBar />
            <ToastContainer />
        </>
    );
}
