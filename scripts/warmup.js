#!/usr/bin/env node
/**
 * scripts/warmup.js
 *
 * Chạy sau khi deploy lên Vercel để tự động warm-up (ISR cache) toàn bộ trang sản phẩm & danh mục.
 *
 * Cách dùng:
 *   node scripts/warmup.js --url https://maytinhlmc.vn --secret YOUR_WARMUP_SECRET
 *
 * Hoặc đặt biến môi trường:
 *   PRODUCTION_URL=https://maytinhlmc.vn WARMUP_SECRET=xxx node scripts/warmup.js
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// ---- Cấu hình ----
const args = process.argv.slice(2);
const getArg = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const BASE_URL = getArg('--url') || process.env.PRODUCTION_URL || 'https://maytinhlmc.vn';
const SECRET = getArg('--secret') || process.env.WARMUP_SECRET || '';
const CONCURRENCY = parseInt(getArg('--concurrency') || process.env.WARMUP_CONCURRENCY || '10');
const TIMEOUT_MS = parseInt(getArg('--timeout') || process.env.WARMUP_TIMEOUT || '30000');

if (!SECRET) {
    console.error('❌ Cần cung cấp WARMUP_SECRET. Dùng --secret hoặc WARMUP_SECRET env var.');
    process.exit(1);
}

// ---- Helpers ----
function fetchJSON(url) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url);
        const lib = parsed.protocol === 'https:' ? https : http;
        const req = lib.get(url, { timeout: TIMEOUT_MS }, (res) => {
            let data = '';
            res.on('data', chunk => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch { reject(new Error('Invalid JSON')); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

function fetchPage(url) {
    return new Promise((resolve) => {
        const parsed = new URL(url);
        const lib = parsed.protocol === 'https:' ? https : http;
        const req = lib.get(url, { timeout: TIMEOUT_MS }, (res) => {
            res.resume(); // Bỏ qua body, chỉ cần trigger render
            res.on('end', () => resolve({ ok: res.statusCode < 400, status: res.statusCode }));
        });
        req.on('error', (err) => resolve({ ok: false, status: 0, err: err.message }));
        req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, err: 'timeout' }); });
    });
}

// Chạy tasks với giới hạn concurrency
async function runWithConcurrency(tasks, concurrency) {
    let index = 0;
    let done = 0;
    const total = tasks.length;

    async function worker() {
        while (index < total) {
            const i = index++;
            await tasks[i]();
            done++;
            if (done % 50 === 0 || done === total) {
                process.stdout.write(`\r  🔥 ${done}/${total} (${Math.round(done / total * 100)}%)`);
            }
        }
    }

    const workers = Array.from({ length: Math.min(concurrency, total) }, worker);
    await Promise.all(workers);
    console.log(''); // Newline sau progress bar
}

// ---- Main ----
async function main() {
    console.log(`\n🚀 LMC Warm-up Script`);
    console.log(`   Base URL    : ${BASE_URL}`);
    console.log(`   Concurrency : ${CONCURRENCY} requests song song`);
    console.log(`   Timeout     : ${TIMEOUT_MS}ms\n`);

    // 1. Lấy danh sách slugs từ API
    console.log('📋 Đang lấy danh sách slugs...');
    const slugsUrl = `${BASE_URL}/api/warmup/slugs?secret=${encodeURIComponent(SECRET)}`;
    let slugs;
    try {
        const json = await fetchJSON(slugsUrl);
        if (!json.slugs) throw new Error(json.error || 'No slugs returned');
        slugs = json.slugs;
        console.log(`   ✅ Tìm thấy ${slugs.length} trang cần warm-up\n`);
    } catch (err) {
        console.error(`   ❌ Lỗi lấy slugs: ${err.message}`);
        process.exit(1);
    }

    // 2. Visit từng trang để trigger ISR cache
    console.log(`🔥 Bắt đầu warm-up ${slugs.length} trang (${CONCURRENCY} requests song song)...`);
    const startTime = Date.now();

    let success = 0, failed = 0;
    const failedSlugs = [];

    const tasks = slugs.map(slug => async () => {
        const url = `${BASE_URL}/${slug}`;
        const result = await fetchPage(url);
        if (result.ok) {
            success++;
        } else {
            failed++;
            failedSlugs.push({ slug, status: result.status, err: result.err });
        }
    });

    await runWithConcurrency(tasks, CONCURRENCY);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    // 3. Kết quả
    console.log(`\n✅ Warm-up hoàn tất trong ${elapsed}s`);
    console.log(`   ✓ Thành công : ${success} trang`);
    console.log(`   ✗ Thất bại   : ${failed} trang`);

    if (failedSlugs.length > 0) {
        console.log('\n❌ Các trang lỗi:');
        failedSlugs.slice(0, 20).forEach(({ slug, status, err }) => {
            console.log(`   /${slug} → ${status || err}`);
        });
        if (failedSlugs.length > 20) {
            console.log(`   ... và ${failedSlugs.length - 20} trang khác`);
        }
    }

    console.log('\n🎉 Done! Tất cả trang đã được cache bởi ISR và sẽ load tức thì.\n');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
