/**
 * PC Builder Compatibility Engine
 * Rule-based keyword matching + ACF specs parsing to detect platform, DDR type,
 * socket, and chipset compatibility.
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

// Intel socket keywords
const INTEL_SOCKETS = [
    'LGA1700', 'LGA 1700', 'LGA1200', 'LGA 1200',
    'LGA1151', 'LGA 1151', 'LGA1150', 'LGA 1150',
    'LGA1851', 'LGA 1851',
];

// AMD socket keywords
const AMD_SOCKETS = [
    'AM5', 'AM4', 'sTRX4', 'sTR4', 'TR4',
    'Socket AM5', 'Socket AM4',
];

// --- ACF Specs Parser ---

export interface ParsedSpec {
    label: string;
    value: string;
}

/**
 * Parse ACF HTML specs into key-value pairs.
 * Handles both HTML table format and p/li "key: value" format.
 */
export function parseAcfSpecs(html: string): ParsedSpec[] {
    if (!html) return [];
    const rows: ParsedSpec[] = [];

    // Match table rows: <tr><td>Label</td><td>Value</td></tr>
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(html)) !== null) {
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
            cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
        }
        if (cells.length >= 2 && cells[0]) {
            rows.push({ label: cells[0], value: cells[1] || '—' });
        }
    }

    // If no table, try parsing <p> or <li> tags as "key: value"
    if (rows.length === 0) {
        const lineRegex = /<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/gi;
        let lineMatch;
        while ((lineMatch = lineRegex.exec(html)) !== null) {
            const text = lineMatch[1].replace(/<[^>]+>/g, '').trim();
            const colonIdx = text.indexOf(':');
            if (colonIdx > 0) {
                rows.push({
                    label: text.slice(0, colonIdx).trim(),
                    value: text.slice(colonIdx + 1).trim() || '—',
                });
            }
        }
    }

    return rows;
}

/**
 * Extract socket type from ACF specs.
 */
function extractSocketFromSpecs(specs: ParsedSpec[]): string | null {
    const socketKeys = ['socket', 'cpu socket', 'hỗ trợ cpu', 'loại socket', 'đế cpu', 'support cpu', 'cpu support'];
    for (const spec of specs) {
        const labelLower = spec.label.toLowerCase();
        if (socketKeys.some(k => labelLower.includes(k))) {
            return spec.value;
        }
    }
    return null;
}

/**
 * Extract DDR type from ACF specs.
 */
function extractDdrFromSpecs(specs: ParsedSpec[]): DdrType {
    const ddrKeys = ['ram', 'memory', 'bộ nhớ', 'hỗ trợ ram', 'loại ram', 'chuẩn ram', 'khe ram'];
    for (const spec of specs) {
        const labelLower = spec.label.toLowerCase();
        const valueLower = spec.value.toLowerCase();
        if (ddrKeys.some(k => labelLower.includes(k))) {
            if (valueLower.includes('ddr5')) return 'ddr5';
            if (valueLower.includes('ddr4')) return 'ddr4';
        }
    }
    return null;
}

/**
 * Detect platform from ACF specs (socket-based).
 */
function detectPlatformFromSpecs(specs: ParsedSpec[]): Platform {
    const socket = extractSocketFromSpecs(specs);
    if (!socket) return null;
    const upper = socket.toUpperCase();

    for (const s of INTEL_SOCKETS) {
        if (upper.includes(s.toUpperCase())) return 'intel';
    }
    for (const s of AMD_SOCKETS) {
        if (upper.includes(s.toUpperCase())) return 'amd';
    }

    // Also check for Intel/AMD keywords in socket value
    if (upper.includes('INTEL') || upper.includes('LGA')) return 'intel';
    if (upper.includes('AMD') || upper.includes('AM4') || upper.includes('AM5')) return 'amd';

    return null;
}

/**
 * Detect platform from a product name (CPU or Mainboard).
 */
export function detectPlatform(productName: string, acfHtml?: string): Platform {
    if (!productName) return null;

    // 1. First try ACF specs (more reliable)
    if (acfHtml) {
        const specs = parseAcfSpecs(acfHtml);
        const platformFromSpecs = detectPlatformFromSpecs(specs);
        if (platformFromSpecs) return platformFromSpecs;
    }

    // 2. Fallback to product name keyword matching
    const upper = productName.toUpperCase();

    for (const kw of INTEL_CPU_KEYWORDS) {
        if (upper.includes(kw.toUpperCase())) return 'intel';
    }
    for (const kw of AMD_CPU_KEYWORDS) {
        if (upper.includes(kw.toUpperCase())) return 'amd';
    }
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
export function detectDdrType(productName: string, acfHtml?: string): DdrType {
    if (!productName) return null;

    // 1. First try ACF specs
    if (acfHtml) {
        const specs = parseAcfSpecs(acfHtml);
        const ddrFromSpecs = extractDdrFromSpecs(specs);
        if (ddrFromSpecs) return ddrFromSpecs;
    }

    // 2. Fallback to product name
    const upper = productName.toUpperCase();
    if (upper.includes('DDR5')) return 'ddr5';
    if (upper.includes('DDR4')) return 'ddr4';

    return null;
}

/**
 * Extract socket info as a string for display.
 */
export function extractSocket(productName: string, acfHtml?: string): string | null {
    // From ACF specs
    if (acfHtml) {
        const specs = parseAcfSpecs(acfHtml);
        const socket = extractSocketFromSpecs(specs);
        if (socket && socket !== '—') return socket;
    }

    // From product name
    const upper = productName.toUpperCase();
    for (const s of [...INTEL_SOCKETS, ...AMD_SOCKETS]) {
        if (upper.includes(s.toUpperCase())) return s;
    }

    return null;
}

// --- Compatibility Hints ---

export interface CompatibilityHint {
    targetCategory: string;
    type: 'warning' | 'info' | 'success';
    message: string;
    filterKeywords?: string[];
}

/**
 * Get the ACF HTML from a product (if available).
 */
function getAcfHtml(product: any): string {
    return product?.thongsokythuatsonbn?.thongsochitiet || '';
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

    const mainboardAcf = getAcfHtml(mainboard?.product);
    const cpuAcf = getAcfHtml(cpu?.product);
    const ramAcf = getAcfHtml(ram?.product);

    const mainboardPlatform = detectPlatform(mainboardName, mainboardAcf);
    const cpuPlatform = detectPlatform(cpuName, cpuAcf);
    const mainboardDdr = detectDdrType(mainboardName, mainboardAcf);
    const ramDdr = detectDdrType(ramName, ramAcf);

    // Socket info for more detailed messages
    const mainboardSocket = extractSocket(mainboardName, mainboardAcf);
    const cpuSocket = extractSocket(cpuName, cpuAcf);

    // === Mainboard → CPU compatibility ===
    if (mainboard?.product && cpu?.product) {
        if (mainboardPlatform && cpuPlatform && mainboardPlatform !== cpuPlatform) {
            const socketDetail = mainboardSocket ? ` (Socket: ${mainboardSocket})` : '';
            hints.push({
                targetCategory: 'cpu',
                type: 'warning',
                message: `⚠️ CPU ${cpuPlatform === 'intel' ? 'Intel' : 'AMD'} không tương thích với Mainboard ${mainboardPlatform === 'intel' ? 'Intel' : 'AMD'}${socketDetail}!`,
            });
            hints.push({
                targetCategory: 'mainboard',
                type: 'warning',
                message: `⚠️ Mainboard ${mainboardPlatform === 'intel' ? 'Intel' : 'AMD'} không tương thích với CPU ${cpuPlatform === 'intel' ? 'Intel' : 'AMD'}!`,
            });
        } else if (mainboardPlatform && cpuPlatform && mainboardPlatform === cpuPlatform) {
            const socketInfo = mainboardSocket ? ` — Socket: ${mainboardSocket}` : '';
            hints.push({
                targetCategory: 'cpu',
                type: 'success',
                message: `✅ CPU tương thích với Mainboard (${mainboardPlatform === 'intel' ? 'Intel' : 'AMD'}${socketInfo})`,
            });
        }
    } else if (mainboard?.product && !cpu?.product && mainboardPlatform) {
        const platformLabel = mainboardPlatform === 'intel' ? 'Intel' : 'AMD';
        const socketInfo = mainboardSocket ? ` — Socket: ${mainboardSocket}` : '';
        hints.push({
            targetCategory: 'cpu',
            type: 'info',
            message: `💡 Gợi ý: Chọn CPU ${platformLabel} để tương thích với Mainboard${socketInfo}`,
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
    const mainboardAcf = getAcfHtml(mainboard?.product);
    const mainboardPlatform = detectPlatform(mainboardName, mainboardAcf);
    const mainboardDdr = detectDdrType(mainboardName, mainboardAcf);
    const mainboardSocket = extractSocket(mainboardName, mainboardAcf);

    if (targetCategoryId === 'cpu' && mainboard?.product && mainboardPlatform) {
        const platformLabel = mainboardPlatform === 'intel' ? 'Intel' : 'AMD';
        const socketLabel = mainboardSocket ? ` (${mainboardSocket})` : '';
        const keywords = mainboardPlatform === 'intel'
            ? ['Intel', 'Core i']
            : ['AMD', 'Ryzen'];
        return { keywords, label: `Lọc CPU ${platformLabel}${socketLabel} tương thích Mainboard` };
    }

    if (targetCategoryId === 'ram' && mainboard?.product && mainboardDdr) {
        return {
            keywords: [mainboardDdr.toUpperCase()],
            label: `Lọc RAM ${mainboardDdr.toUpperCase()} tương thích Mainboard`,
        };
    }

    return null;
}
