/**
 * PC Builder Compatibility Engine
 * Rule-based keyword matching to detect platform, DDR type, and chipset compatibility.
 */

// --- Platform Detection ---

export type Platform = 'intel' | 'amd' | null;
export type DdrType = 'ddr4' | 'ddr5' | null;

// Intel chipsets (motherboard names)
const INTEL_CHIPSETS = [
    'B760', 'Z790', 'H770', 'B660', 'Z690', 'H670', 'H610',
    'B560', 'Z590', 'H570', 'H510',
    'B460', 'Z490', 'H470', 'H410',
    'B365', 'Z390', 'H370', 'B360', 'H310',
];

// AMD chipsets (motherboard names)
const AMD_CHIPSETS = [
    'B650', 'X670', 'A620', 'B650E', 'X670E',
    'B550', 'X570', 'A520', 'B550M', 'X570S',
    'B450', 'X470', 'A320', 'B350', 'X370',
    'A620M', 'B650M', 'X670M',
];

// Intel CPU keywords
const INTEL_CPU_KEYWORDS = [
    'Intel', 'Core i3', 'Core i5', 'Core i7', 'Core i9',
    'Core Ultra', 'Pentium', 'Celeron', 'Xeon',
    'i3-', 'i5-', 'i7-', 'i9-',
];

// AMD CPU keywords
const AMD_CPU_KEYWORDS = [
    'Ryzen 3', 'Ryzen 5', 'Ryzen 7', 'Ryzen 9',
    'Ryzen Threadripper', 'Athlon', 'EPYC',
    'AMD Ryzen', 'Ryzen AI',
];

/**
 * Detect platform from a product name (CPU or Mainboard).
 */
export function detectPlatform(productName: string): Platform {
    if (!productName) return null;
    const upper = productName.toUpperCase();

    // Check CPU keywords
    for (const kw of INTEL_CPU_KEYWORDS) {
        if (upper.includes(kw.toUpperCase())) return 'intel';
    }
    for (const kw of AMD_CPU_KEYWORDS) {
        if (upper.includes(kw.toUpperCase())) return 'amd';
    }

    // Check chipsets (mainboard)
    for (const chipset of INTEL_CHIPSETS) {
        if (upper.includes(chipset.toUpperCase())) return 'intel';
    }
    for (const chipset of AMD_CHIPSETS) {
        if (upper.includes(chipset.toUpperCase())) return 'amd';
    }

    return null;
}

/**
 * Detect DDR type from a product name (Mainboard or RAM).
 */
export function detectDdrType(productName: string): DdrType {
    if (!productName) return null;
    const upper = productName.toUpperCase();

    if (upper.includes('DDR5')) return 'ddr5';
    if (upper.includes('DDR4')) return 'ddr4';

    return null;
}

// --- Compatibility Hints ---

export interface CompatibilityHint {
    targetCategory: string;  // Category to show hint for
    type: 'warning' | 'info' | 'success';
    message: string;
    filterKeywords?: string[];  // Keywords to auto-filter products
}

export interface SelectedComponents {
    [categoryId: string]: {
        name: string;
        product: any | null;
    };
}

/**
 * Generate compatibility hints based on currently selected components.
 */
export function getCompatibilityHints(components: { id: string; name: string; product: any | null }[]): CompatibilityHint[] {
    const hints: CompatibilityHint[] = [];

    const mainboard = components.find(c => c.id === 'mainboard');
    const cpu = components.find(c => c.id === 'cpu');
    const ram = components.find(c => c.id === 'ram');

    const mainboardName = mainboard?.product?.name || '';
    const cpuName = cpu?.product?.name || '';
    const ramName = ram?.product?.name || '';

    const mainboardPlatform = detectPlatform(mainboardName);
    const cpuPlatform = detectPlatform(cpuName);
    const mainboardDdr = detectDdrType(mainboardName);
    const ramDdr = detectDdrType(ramName);

    // === Mainboard → CPU compatibility ===
    if (mainboard?.product && cpu?.product) {
        // Both selected: check compatibility
        if (mainboardPlatform && cpuPlatform && mainboardPlatform !== cpuPlatform) {
            hints.push({
                targetCategory: 'cpu',
                type: 'warning',
                message: `⚠️ CPU ${cpuPlatform === 'intel' ? 'Intel' : 'AMD'} không tương thích với Mainboard ${mainboardPlatform === 'intel' ? 'Intel' : 'AMD'}!`,
            });
            hints.push({
                targetCategory: 'mainboard',
                type: 'warning',
                message: `⚠️ Mainboard ${mainboardPlatform === 'intel' ? 'Intel' : 'AMD'} không tương thích với CPU ${cpuPlatform === 'intel' ? 'Intel' : 'AMD'}!`,
            });
        } else if (mainboardPlatform && cpuPlatform && mainboardPlatform === cpuPlatform) {
            hints.push({
                targetCategory: 'cpu',
                type: 'success',
                message: `✅ CPU tương thích với Mainboard (${mainboardPlatform === 'intel' ? 'Intel' : 'AMD'})`,
            });
        }
    } else if (mainboard?.product && !cpu?.product && mainboardPlatform) {
        // Mainboard selected, no CPU: suggest compatible CPU
        const platformLabel = mainboardPlatform === 'intel' ? 'Intel' : 'AMD';
        hints.push({
            targetCategory: 'cpu',
            type: 'info',
            message: `💡 Gợi ý: Chọn CPU ${platformLabel} để tương thích với Mainboard`,
            filterKeywords: mainboardPlatform === 'intel' ? INTEL_CPU_KEYWORDS.slice(0, 5) : AMD_CPU_KEYWORDS.slice(0, 5),
        });
    }

    // === Mainboard → RAM compatibility (DDR) ===
    if (mainboard?.product && ram?.product) {
        if (mainboardDdr && ramDdr && mainboardDdr !== ramDdr) {
            hints.push({
                targetCategory: 'ram',
                type: 'warning',
                message: `⚠️ RAM ${ramDdr.toUpperCase()} không tương thích với Mainboard ${mainboardDdr.toUpperCase()}!`,
            });
        } else if (mainboardDdr && ramDdr && mainboardDdr === ramDdr) {
            hints.push({
                targetCategory: 'ram',
                type: 'success',
                message: `✅ RAM tương thích với Mainboard (${mainboardDdr.toUpperCase()})`,
            });
        }
    } else if (mainboard?.product && !ram?.product && mainboardDdr) {
        hints.push({
            targetCategory: 'ram',
            type: 'info',
            message: `💡 Gợi ý: Chọn RAM ${mainboardDdr.toUpperCase()} để tương thích với Mainboard`,
            filterKeywords: [mainboardDdr.toUpperCase()],
        });
    }

    return hints;
}

/**
 * Get auto-filter keywords when opening modal for a target category.
 * Returns keywords to pre-filter products, or null if no filter applies.
 */
export function getAutoFilterForCategory(
    targetCategoryId: string,
    components: { id: string; product: any | null }[]
): { keywords: string[]; label: string } | null {
    const mainboard = components.find(c => c.id === 'mainboard');
    const mainboardName = mainboard?.product?.name || '';
    const mainboardPlatform = detectPlatform(mainboardName);
    const mainboardDdr = detectDdrType(mainboardName);

    if (targetCategoryId === 'cpu' && mainboard?.product && mainboardPlatform) {
        const platformLabel = mainboardPlatform === 'intel' ? 'Intel' : 'AMD';
        const keywords = mainboardPlatform === 'intel'
            ? ['Intel', 'Core i']
            : ['AMD', 'Ryzen'];
        return { keywords, label: `Lọc theo Mainboard ${platformLabel}` };
    }

    if (targetCategoryId === 'ram' && mainboard?.product && mainboardDdr) {
        return {
            keywords: [mainboardDdr.toUpperCase()],
            label: `Lọc theo ${mainboardDdr.toUpperCase()} (Mainboard)`,
        };
    }

    return null;
}
