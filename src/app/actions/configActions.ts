"use server";

import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

export interface HardwareGridCategory {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    level: string;
    pulse: boolean;
    link?: string;
}

export interface HardwareGridConfig {
    isEnabled: boolean;
    categories: HardwareGridCategory[];
}

const DEFAULT_HARDWARE_GRID_CONFIG: HardwareGridConfig = {
    isEnabled: true,
    categories: [
        {
            id: "1",
            title: "CPU INTEL",
            subtitle: "Extreme Performance",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_SkKTAiuzlLf5vWaiKkrm6Qj0CaQKY7ilr-NlQWuoTgMGlji0ScNQu5Hi57xoKNDQ26GPsHEnv4nxKoHfOJ1XzZ73bWrjqtH_az3c6nZ9PvsSRiHfPBNEoNF90HtD6ZCe0_b5yi_rt93M6lOFc96VW2PDHWJCmUBJ0-RKaOFTki_hZPowhmgJNay0MON0KuMf39IZaxWlI2FFpO2KBrmr9bfZVn1xp6bsOx0b5ON6XmmO8F-7cMUZ0NhaLgkueZvQGr2mkyQg0gI",
            level: "Level: Extreme",
            pulse: true,
            link: "/category/cpu-bo-vi-xu-ly?pa_thuong-hieu=intel",
        },
        {
            id: "2",
            title: "CPU AMD",
            subtitle: "Unrivaled Power",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlajHSQ6Nx560hi1PSFJzw8SCQKJ9hJ57CgdH4x4LhUR1cQg5XJXn-PdWJfrOktAEPgQzhORfNeZ7045AFMxrIy1lrujLg1QPDkYs1T5zoh2pOkXYn3LH-qMTa5Y7mqpv-RtW-UiDNJH0AEDFFSrdj9UfVX2LxTXAxV0UtRyIfNY2COVHCrqMxh9nAGhgOiR0YMh4MM5_DTCAuSbmOFdMyfA5lv2FcVm_jNcvjOUq_6D5dgrD3xVktEnNnJMriG1DP-f2B3jIYR4M",
            level: "Multicore King",
            pulse: false,
            link: "/category/cpu-bo-vi-xu-ly?pa_thuong-hieu=amd",
        },
        {
            id: "3",
            title: "CARD ĐỒ HỌA",
            subtitle: "Immersive Gaming",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBwr1N1dT9UTsYvjmTPFLSQITE2-zJyyQfAtlZ2i6chKp93B3D3oNVX2FY_VteUy-tTnf9LUIyK5tyBxGyHYXsNVm_WYr2Ju77LehrnrmvQHLRYSdhgklf2RBdwoHn7D4c7DQtBzMiabPNCz3N6c85CY2VAvzFFGR4mHoxUn56y3R6RVxU5FdqhRmHT3xya6jX1NwGXj2NiU6NERoRj6eVi0rA_Ng3yoyi6sIvZCuwpnHnZTpGjHcBrYinIR5ttboIiawZmbWrXLL8",
            level: "RDNA Architecture",
            pulse: false,
            link: "/category/vga-card-man-hinh",
        },
        {
            id: "4",
            title: "MÀN HÌNH",
            subtitle: "Fluid Motion",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRL1dd8gdpwdGcCdKhEsjRT47PCG8Z0D2BzDV_H4uMuUOWsJr2UUHQs6HB0Pr1O3KDR1MQSllVlhbirgir-SLBaqkpFUvMcdzSIENwdL7kJu5KJB5fPs_-i9Zo2gxJ2I10C9u8hhy2RDc4dMD_gCqPUgrWoXX5pp3n1YfO0JosLBGjnkdkCXLQA1PWz9GLbVdprpvfFfoHY97zLNY1cE-JQyWGOJissuk9xF9tlPVUgOQ-Vq8iEzQP3cO9ojdUXsYytv-vkbtPWnU",
            level: "Ultra High Refresh",
            pulse: false,
            link: "/category/man-hinh-may-tinh",
        },
        {
            id: "5",
            title: "TẢN NHIỆT",
            subtitle: "Cool & Quiet",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhhjx2NO3o5pa3zTgfUuiFFo38fb6ekgTe-nnAgTV3hpUHkF66dxxYnLxvRwxqa0y25rUrOvUxJI1cpZwqnQ_LIQrJDwiKKYdwF7zrRmYsLq5X4d_-lpbIOC_XLegj8s9vkAVT6d8_4-bW8NSX49iAw12IAkS4RD7ID1oAAEnaS0A6ZU_Jeo3tL2nEDWmdRRRrEFV5Mqp43ZdZ655V-qwrKvHlnrpShnCgTruvPSFNUpE5S8U4EabtaB3Ov_x6uO0C7SVF7DzExTg",
            level: "Sub-zero Cool",
            pulse: false,
            link: "/category/fan-led-tan-nhiet-may-tinh",
        },
        {
            id: "6",
            title: "Ổ CỨNG NVME",
            subtitle: "Instant Loading",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJj3VAwFGzK7GtKuZV136opPgNfdR7U5W_o22MWYGpHkLVC0ULW6DQQG3G0LrXdECa7czSjB3jqsPli10Cv8ooq5VjZ7TM0OUIOMVegUpWGDv04YozFAWq1AdCV_Zk6YkRAiZGFxTAROBOSUUSO-bNYdJcEAJL5VsngTLYMbt0_txcRVmnPtN3Dlt9KqSYze5J3QIdT2yUurZ7-dC2GXQc7XpSbyN2gHBB6EVriQ4Ips6lXUe1GVY-EiRTi-PZFklzdlnXLUCYPss",
            level: "PCIe 5.0 Ready",
            pulse: false,
            link: "/category/o-cung-ssd",
        },
        {
            id: "7",
            title: "BO MẠCH CHỦ",
            subtitle: "Core Synergy",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIIo-K8IMVFNEND5CNNQkc7KP-pPWo-Le7iC6WY2TIrpUto7LD0a10-wNpdt5XV82f_D3IktQLx2fnUEacoeByMw238-EnqfkcFzFJVOxzSSE6WXt3YVX1MT6ULiBWLKDN-_3eKKj-4oCTLqtC72K-cYdOYJV4qZffJjJELr_Ukf24tABODSl4LW9yiy1q5ONvGDBdrCTyryRds9CtGUp2kGQU0acviktCDlZM1Ec8OHCu5aVD0rXhPKL0hLs5PLKntigJYhKqlGQ",
            level: "Power Delivery",
            pulse: false,
            link: "/category/mainboard-bo-mach-chu",
        },
        {
            id: "8",
            title: "RAM MÁY TÍNH",
            subtitle: "Seamless Multitask",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuC7BQpHzPaJIsS6OhuHcVli_sY-nvQH8traJSTxYSOlQ0uuusfduUpD9ZKzyEbRXUtLlTiwciz7CsE-fZIfs_OhyHF6kowSzmprc6Dury0tqwbt09a2hGa9TQ6kGNgAHEgvdv5ET-kiREdC_JETtRH6yYbT-X6PGDu8b9DTuCGxPbJmwzgyQ0i0YYDl6sJOhHoz6c-fmNA7rPsR7NbCYdIIGn6XEqIvGS7QN5LXWZufI_Ho6m-hTFmjoyXRxW8rO8azpcuL0gSOSrI",
            level: "DDR5 Boost",
            pulse: false,
            link: "/category/ram-bo-nho-trong",
        }
    ]
};

export async function getHomepageConfig() {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        if (useKV && redis) {
            const data = await redis.get('homepageConfig');
            if (data) {
                return typeof data === 'string' ? JSON.parse(data) : data;
            }
        }

        // Local Fallback 
        const dataFilePath = path.join(process.cwd(), 'src', 'data', 'homepageConfig.json');
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading homepage config:', error);
        return [];
    }
}

export async function getPcBuilderConfig() {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        const processData = (parsed: any) => {
            if (Array.isArray(parsed)) return { components: parsed, companyInfo: {} };
            // Legacy Object format (before object was used for companyInfo)
            if (parsed && typeof parsed === 'object' && !('components' in parsed)) {
                // check if it looks like the old dictionary
                const isOldDict = Object.values(parsed).some(v => typeof v === 'object' && v !== null && 'id' in v);
                if (isOldDict) {
                    return { components: Object.values(parsed), companyInfo: {} };
                }
            }
            return {
                components: parsed?.components || [],
                companyInfo: parsed?.companyInfo || {}
            };
        };

        if (useKV && redis) {
            const data = await redis.get('pcBuilderConfig');
            if (data) {
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                return processData(parsed);
            }
        }

        // Local Fallback 
        const dataFilePath = path.join(process.cwd(), 'src', 'data', 'pcBuilderConfig.json');

        // Return default configuration if file doesn't exist yet
        try {
            await fs.access(dataFilePath);
            const data = await fs.readFile(dataFilePath, 'utf-8');
            const parsed = JSON.parse(data);
            return processData(parsed);
        } catch {
            return {
                components: [
                    { id: 'cpu', name: 'CPU - Bộ Vi Xử Lý', slug: 'cpu-bo-vi-xu-ly' },
                    { id: 'mainboard', name: 'Mainboard - Bo Mạch Chủ', slug: 'mainboard-bo-mach-chu' },
                    { id: 'ram', name: 'RAM - Bộ Nhớ Trong', slug: 'ram-bo-nho-trong' },
                    { id: 'vga', name: 'VGA - Card Màn Hình', slug: 'vga-card-man-hinh' },
                    { id: 'ssd', name: 'Ổ Cứng SSD', slug: 'o-cung-ssd' },
                    { id: 'hdd', name: 'Ổ Cứng HDD', slug: 'o-cung-hdd' },
                    { id: 'psu', name: 'Nguồn - PSU', slug: 'psu-nguon-may-tinh' },
                    { id: 'case', name: 'Vỏ Case', slug: 'case-vo-may-tinh' },
                    { id: 'cooler', name: 'Tản Nhiệt', slug: 'fan-led-tan-nhiet-may-tinh' },
                    { id: 'monitor', name: 'Màn Hình', slug: 'man-hinh-may-tinh' },
                    { id: 'keyboard_mouse', name: 'Phím Chuột', slug: 'phim-chuot-ban-ghe-gear' },
                    { id: 'headphone', name: 'Tai Nghe', slug: 'loa-tai-nghe-mic-webcam' },
                ],
                companyInfo: {}
            };
        }
    } catch (error) {
        console.error('Error reading pc builder config:', error);
        return { components: [], companyInfo: {} };
    }
}

export async function getHardwareGridConfig(): Promise<HardwareGridConfig> {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        if (useKV && redis) {
            const data = await redis.get('hardwareGridConfig');
            if (data) {
                return typeof data === 'string' ? JSON.parse(data) : (data as HardwareGridConfig);
            }
        }
    } catch (error) {
        console.error('Error reading Hardware Grid config:', error);
    }

    return DEFAULT_HARDWARE_GRID_CONFIG;
}

export interface SiteSettings {
    logo?: string;
    favicon?: string;
    siteName?: string;
    contactEmail?: string;
    contactPhone?: string;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {};

export async function getSiteSettings(): Promise<SiteSettings> {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        if (useKV && redis) {
            const data = await redis.get('siteSettings');
            if (data) {
                return typeof data === 'string' ? JSON.parse(data) : (data as SiteSettings);
            }
        }
    } catch (error) {
        console.error('Error reading site settings:', error);
    }

    return DEFAULT_SITE_SETTINGS;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<{ success: boolean }> {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        if (useKV && redis) {
            await redis.set('siteSettings', JSON.stringify(settings));
            return { success: true };
        }
        return { success: false };
    } catch (error) {
        console.error('Error saving site settings:', error);
        return { success: false };
    }
}

// --------------------------------------------------------------------------------
// Banner Config
// --------------------------------------------------------------------------------

export interface BannerItem {
    id: string;
    image: string;
    link: string;
}

export interface BannerConfig {
    mainBanners: BannerItem[];
    smallBanners: BannerItem[];
    showSmallBanners?: boolean;
}

const DEFAULT_BANNER_CONFIG: BannerConfig = {
    mainBanners: [],
    smallBanners: [],
    showSmallBanners: true
};

const bannerConfigPath = path.join(process.cwd(), 'src', 'data', 'bannerConfig.json');

export async function getBannerConfig(): Promise<BannerConfig> {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        if (useKV && redis) {
            const data = await redis.get('bannerConfig');
            if (data) {
                return (typeof data === 'string' ? JSON.parse(data) : data) as BannerConfig;
            }
        }

        const data = await fs.readFile(bannerConfigPath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading banner config:', error);
        return DEFAULT_BANNER_CONFIG;
    }
}
