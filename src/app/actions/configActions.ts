"use server";

import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

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
        if (useKV && redis) {
            const data = await redis.get('pcBuilderConfig');
            if (data) {
                const parsed = typeof data === 'string' ? JSON.parse(data) : data;
                return Array.isArray(parsed) ? parsed : Object.values(parsed);
            }
        }

        // Local Fallback 
        const dataFilePath = path.join(process.cwd(), 'src', 'data', 'pcBuilderConfig.json');

        // Return default configuration if file doesn't exist yet
        try {
            await fs.access(dataFilePath);
            const data = await fs.readFile(dataFilePath, 'utf-8');
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) ? parsed : Object.values(parsed);
        } catch {
            return [
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
            ];
        }
    } catch (error) {
        console.error('Error reading pc builder config:', error);
        return [];
    }
}
