import { create } from 'zustand';
import { getCompatibilityHints, CompatibilityHint, parseAcfSpecs } from '@/lib/pc-builder/compatibilityEngine';

export interface ComponentCategory {
    id: string;
    name: string;
    slug: string;
    product: any | null; // Selected product data from GraphQL
}

interface AiAnalysisResult {
    analyses: {
        categoryId: string;
        platform: 'intel' | 'amd' | null;
        socket: string | null;
        ddrType: 'ddr4' | 'ddr5' | null;
        formFactor: string | null;
    }[];
    warnings: string[];
    suggestions: string[];
}

interface PcBuilderState {
    components: ComponentCategory[];
    totalPrice: number;
    compatibilityHints: CompatibilityHint[];
    aiAnalysis: AiAnalysisResult | null;
    aiLoading: boolean;
    aiError: string | null;
    selectProduct: (categoryId: string, product: any) => void;
    removeProduct: (categoryId: string) => void;
    clearAll: () => void;
    initComponents: (config: any) => void;
    triggerAiAnalysis: () => Promise<void>;
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

/**
 * Strip HTML tags from ACF specs for sending to AI.
 */
function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export const usePcBuilderStore = create<PcBuilderState>((set, get) => ({
    components: initialComponents,
    totalPrice: 0,
    compatibilityHints: [],
    aiAnalysis: null,
    aiLoading: false,
    aiError: null,
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

        // Trigger AI analysis after selecting key components
        const keyCategories = ['mainboard', 'cpu', 'ram'];
        if (keyCategories.includes(categoryId)) {
            // Small delay to batch multiple selections
            setTimeout(() => get().triggerAiAnalysis(), 300);
        }
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
                aiAnalysis: null, // Clear AI analysis on removal
            };
        });
    },
    clearAll: () => {
        set((state) => {
            const clearedComponents = state.components.map(c => ({ ...c, product: null }));
            return {
                components: clearedComponents,
                totalPrice: 0,
                compatibilityHints: [],
                aiAnalysis: null,
                aiLoading: false,
                aiError: null,
            };
        });
    },
    initComponents: (config) => {
        set((state) => {
            let configArray: ComponentCategory[] = [];
            if (Array.isArray(config)) {
                configArray = config;
            } else if (typeof config === 'object' && config !== null) {
                configArray = Object.keys(config).map(key => ({ ...config[key], id: key }));
            }

            const newComponents = configArray.map(c => {
                const existing = state.components.find(ex => ex.id === c.id);
                return {
                    ...c,
                    product: existing ? existing.product : null
                };
            });
            return { components: newComponents };
        });
    },
    triggerAiAnalysis: async () => {
        const state = get();
        const selectedProducts = state.components.filter(c => c.product !== null);

        // Need at least 2 selected products (one being mainboard/cpu/ram) to analyze
        const keySelected = selectedProducts.filter(p =>
            ['mainboard', 'cpu', 'ram'].includes(p.id)
        );
        if (keySelected.length < 1) return;

        set({ aiLoading: true, aiError: null });

        try {
            const products = selectedProducts.map(c => ({
                categoryId: c.id,
                name: c.product.name,
                specs: stripHtml(c.product?.thongsokythuatsonbn?.thongsochitiet || ''),
            }));

            const response = await fetch('/api/pc-builder/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products }),
            });

            if (!response.ok) {
                throw new Error('AI analysis failed');
            }

            const result: AiAnalysisResult = await response.json();
            set({ aiAnalysis: result, aiLoading: false });
        } catch (error: any) {
            console.error('AI analysis error:', error);
            set({ aiLoading: false, aiError: error.message });
        }
    },
}));
