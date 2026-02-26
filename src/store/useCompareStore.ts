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
    category?: string; // danh mục chính của sản phẩm
}

type AddResult = 'ok' | 'already' | 'full' | 'wrong_category';

interface CompareState {
    items: CompareItem[];
    addItem: (item: CompareItem) => AddResult;
    removeItem: (id: string) => void;
    clearAll: () => void;
    hasItem: (id: string) => boolean;
    getCategory: () => string | null;
}

const MAX_COMPARE_ITEMS = 4;

export const useCompareStore = create<CompareState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                const state = get();
                if (state.items.some(i => i.id === item.id)) {
                    return 'already';
                }
                if (state.items.length >= MAX_COMPARE_ITEMS) {
                    return 'full';
                }
                // Kiểm tra cùng danh mục
                if (state.items.length > 0 && item.category) {
                    const currentCat = state.items[0].category;
                    if (currentCat && item.category !== currentCat) {
                        return 'wrong_category';
                    }
                }
                set({ items: [...state.items, item] });
                return 'ok';
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

            getCategory: () => {
                const state = get();
                return state.items.length > 0 ? (state.items[0].category || null) : null;
            },
        }),
        {
            name: 'storenext-compare-storage',
        }
    )
);
