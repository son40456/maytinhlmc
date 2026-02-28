import { create } from 'zustand';
import { getCompatibilityHints, CompatibilityHint } from '@/lib/pc-builder/compatibilityEngine';

export interface ComponentCategory {
    id: string;
    name: string;
    slug: string;
    product: any | null; // Selected product data from GraphQL
}

interface PcBuilderState {
    components: ComponentCategory[];
    totalPrice: number;
    compatibilityHints: CompatibilityHint[];
    selectProduct: (categoryId: string, product: any) => void;
    removeProduct: (categoryId: string) => void;
    clearAll: () => void;
    initComponents: (config: any) => void;
}

const initialComponents: ComponentCategory[] = [
    { id: 'mainboard', name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard-bo-mach-chu', product: null },
    { id: 'cpu', name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu-bo-vi-xu-ly', product: null },
    { id: 'ram', name: 'RAM - Bộ Nhớ Trong', slug: 'ram-bo-nho-trong', product: null },
    { id: 'vga', name: 'VGA - Card Màn Hình', slug: 'vga-card-man-hinh', product: null },
    { id: 'ssd', name: 'Ổ Cứng SSD', slug: 'o-cung-ssd', product: null },
    { id: 'hdd', name: 'Ổ Cứng HDD', slug: 'o-cung-hdd', product: null },
    { id: 'psu', name: 'Nguồn - PSU', slug: 'psu-nguon-may-tinh', product: null },
    { id: 'case', name: 'Vỏ Case', slug: 'case-vo-may-tinh', product: null },
    { id: 'cooler', name: 'Tản Nhiệt', slug: 'fan-led-tan-nhiet-may-tinh', product: null },
    { id: 'monitor', name: 'Màn Hình', slug: 'man-hinh-may-tinh', product: null },
    { id: 'keyboard_mouse', name: 'Phím Chuột', slug: 'phim-chuot-ban-ghe-gear', product: null },
    { id: 'headphone', name: 'Tai Nghe', slug: 'loa-tai-nghe-mic-webcam', product: null },
];

function calculateTotal(components: ComponentCategory[]): number {
    let total = 0;
    components.forEach(comp => {
        if (comp.product && (comp.product.price || comp.product.regularPrice)) {
            const priceString = comp.product.price || comp.product.regularPrice;
            const numPrice = parseInt(priceString.replace(/&nbsp;/g, " ").replace(/\D/g, '')) || 0;
            total += numPrice;
        }
    });
    return total;
}

export const usePcBuilderStore = create<PcBuilderState>((set) => ({
    components: initialComponents,
    totalPrice: 0,
    compatibilityHints: [],
    selectProduct: (categoryId, product) => {
        set((state) => {
            const newComponents = [...state.components];
            const idx = newComponents.findIndex(c => c.id === categoryId);
            if (idx > -1) {
                newComponents[idx] = { ...newComponents[idx], product };
            }
            return {
                components: newComponents,
                totalPrice: calculateTotal(newComponents),
                compatibilityHints: getCompatibilityHints(newComponents),
            };
        });
    },
    removeProduct: (categoryId) => {
        set((state) => {
            const newComponents = [...state.components];
            const idx = newComponents.findIndex(c => c.id === categoryId);
            if (idx > -1) {
                newComponents[idx] = { ...newComponents[idx], product: null };
            }
            return {
                components: newComponents,
                totalPrice: calculateTotal(newComponents),
                compatibilityHints: getCompatibilityHints(newComponents),
            };
        });
    },
    clearAll: () => {
        set((state) => {
            const clearedComponents = state.components.map(c => ({ ...c, product: null }));
            return { components: clearedComponents, totalPrice: 0, compatibilityHints: [] };
        });
    },
    initComponents: (config) => {
        set((state) => {
            // Normalize config to array
            let configArray: ComponentCategory[] = [];
            if (Array.isArray(config)) {
                configArray = config;
            } else if (typeof config === 'object' && config !== null) {
                configArray = Object.keys(config).map(key => ({ ...config[key], id: key }));
            }

            // Merge existing config with new config to preserve selected products if any
            const newComponents = configArray.map(c => {
                const existing = state.components.find(ex => ex.id === c.id);
                return {
                    ...c,
                    product: existing ? existing.product : null
                };
            });
            return { components: newComponents };
        });
    }
}));
