import { create } from 'zustand';

export interface ComponentCategory {
    id: string;
    name: string;
    slug: string;
    product: any | null; // Selected product data from GraphQL
}

interface PcBuilderState {
    components: Record<string, ComponentCategory>;
    totalPrice: number;
    selectProduct: (categoryId: string, product: any) => void;
    removeProduct: (categoryId: string) => void;
    clearAll: () => void;
}

const initialComponents: Record<string, ComponentCategory> = {
    cpu: { id: 'cpu', name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu-bo-vi-xu-ly', product: null },
    mainboard: { id: 'mainboard', name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard-bo-mach-chu', product: null },
    ram: { id: 'ram', name: 'RAM - Bộ Nhớ Trong', slug: 'ram-bo-nho-trong', product: null },
    vga: { id: 'vga', name: 'VGA - Card Màn Hình', slug: 'vga-card-man-hinh', product: null },
    ssd: { id: 'ssd', name: 'Ổ Cứng SSD', slug: 'o-cung-ssd', product: null },
    hdd: { id: 'hdd', name: 'Ổ Cứng HDD', slug: 'o-cung-hdd', product: null },
    psu: { id: 'psu', name: 'Nguồn - PSU', slug: 'psu-nguon-may-tinh', product: null },
    case: { id: 'case', name: 'Vỏ Case', slug: 'case-vo-may-tinh', product: null },
    cooler: { id: 'cooler', name: 'Tản Nhiệt', slug: 'fan-led-tan-nhiet-may-tinh', product: null },
    monitor: { id: 'monitor', name: 'Màn Hình', slug: 'man-hinh-may-tinh', product: null },
    keyboard_mouse: { id: 'keyboard_mouse', name: 'Phím Chuột', slug: 'phim-chuot-ban-ghe-gear', product: null },
    headphone: { id: 'headphone', name: 'Tai Nghe', slug: 'loa-tai-nghe-mic-webcam', product: null },
};

export const usePcBuilderStore = create<PcBuilderState>((set) => ({
    components: initialComponents,
    totalPrice: 0,
    selectProduct: (categoryId, product) => {
        set((state) => {
            const newComponents = { ...state.components };
            newComponents[categoryId] = { ...newComponents[categoryId], product };

            // Recalculate total price
            let total = 0;
            Object.values(newComponents).forEach(comp => {
                if (comp.product && (comp.product.price || comp.product.regularPrice)) {
                    const priceString = comp.product.price || comp.product.regularPrice;
                    const numPrice = parseInt(priceString.replace(/&nbsp;/g, " ").replace(/\D/g, '')) || 0;
                    total += numPrice;
                }
            });

            return { components: newComponents, totalPrice: total };
        });
    },
    removeProduct: (categoryId) => {
        set((state) => {
            const newComponents = { ...state.components };
            newComponents[categoryId] = { ...newComponents[categoryId], product: null };

            // Recalculate total price
            let total = 0;
            Object.values(newComponents).forEach(comp => {
                if (comp.product && (comp.product.price || comp.product.regularPrice)) {
                    const priceString = comp.product.price || comp.product.regularPrice;
                    const numPrice = parseInt(priceString.replace(/&nbsp;/g, " ").replace(/\D/g, '')) || 0;
                    total += numPrice;
                }
            });

            return { components: newComponents, totalPrice: total };
        });
    },
    clearAll: () => {
        set({ components: { ...initialComponents }, totalPrice: 0 });
    }
}));
