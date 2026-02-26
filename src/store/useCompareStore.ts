import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareItem {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
    sku?: string;
}

interface CompareState {
    items: CompareItem[];
    addItem: (item: CompareItem) => boolean; // returns false if full
    removeItem: (id: string) => void;
    clearAll: () => void;
    hasItem: (id: string) => boolean;
}

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const state = get();
                if (state.items.length >= MAX_COMPARE_ITEMS) {
                    return false;
                }
                if (state.items.some(i => i.id === item.id)) {
                    return true; // already exists
                }
                set({ items: [...state.items, item] });
                return true;
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            clearAll: () => set({ items: [] }),

            hasItem: (id) => {
                return get().items.some(i => i.id === id);
            },
        }),
        {
            name: 'storenext-compare-storage',
        }
    )
);
