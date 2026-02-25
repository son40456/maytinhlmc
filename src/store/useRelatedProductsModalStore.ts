import { create } from 'zustand';

interface RelatedProduct {
    id: string;
    name: string;
    price: string;
    image: string;
}

interface ModalState {
    isOpen: boolean;
    relatedProducts: RelatedProduct[];
    openModal: (products?: RelatedProduct[]) => void;
    closeModal: () => void;
}

export const useRelatedProductsModalStore = create<ModalState>((set) => ({
    isOpen: false,
    relatedProducts: [],
    openModal: (products = []) => set({ isOpen: true, relatedProducts: products }),
    closeModal: () => set({ isOpen: false, relatedProducts: [] }),
}));
