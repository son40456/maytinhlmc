import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // ID của biến thể hoặc sản phẩm (Global ID)
    productId: string; // Database ID của sản phẩm (số)
    databaseId: number; // Database ID thực tế
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
    slug: string;
    attributes?: { [key: string]: string }; // VD: { size: 'XL', color: 'Red' }
}

interface CartState {
    items: CartItem[];
    addItem: (item: CartItem) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getRawTotal: () => number;
    getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (item) => {
                set((state) => {
                    const existingItemIndex = state.items.findIndex((i) => i.id === item.id);

                    if (existingItemIndex > -1) {
                        // Đã có trong giỏ -> Tăng số lượng
                        const newItems = [...state.items];
                        newItems[existingItemIndex].quantity += item.quantity;
                        return { items: newItems };
                    }

                    // Chưa có thì thêm mới
                    return { items: [...state.items, item] };
                });
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                }));
            },

            updateQuantity: (id, quantity) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),

            getRawTotal: () => {
                return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            }
        }),
        {
            name: 'storenext-cart-storage', // Tên lưu trong localStorage
        }
    )
);
