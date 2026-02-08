const fs = require('fs');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const SITEMAP_URL = `${BASE_URL}/sitemap-interview-global.xml`;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

async function checkUrl(url) {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.status === 200) {
            process.stdout.write('.');
            return { url, status: 200, success: true };
        } else {
            process.stdout.write('x'); // Visual indicator of failure
            return { url, status: res.status, success: false };
        }
    } catch (e) {
        process.stdout.write('E');
        return { url, status: 'ERR', success: false, error: e.message };
    }
}

async function main() {
    console.log(`🚀 Starting Global Interview Sitemap Checker`);
    console.log(`Target: ${SITEMAP_URL}`);

    try {
        // 1. Fetch Sitemap
        const res = await fetch(SITEMAP_URL);
        if (res.status !== 200) {
            console.error(`${RED}Failed to fetch sitemap: ${res.status}. Is the server running?${RESET}`);
            process.exit(1);
        }
        const xml = await res.text();

        // 2. Parse URLs
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        const urls = [];
        while ((match = regex.exec(xml)) !== null) {
            let url = match[1];
            // Rewrite domain to local if needed
            if (BASE_URL.includes('localhost')) {
                url = url.replace('https://resumegyani.in', BASE_URL);
            }
            urls.push(url);
        }

        console.log(`📊 Found ${urls.length} URLs in sitemap.`);

        if (urls.length === 0) {
            console.error(`${RED}No URLs found! Check sitemap format.${RESET}`);
            process.exit(1);
        }

        // 3. Smoke Test or Full Check? 
        // Let's do a smart check: First 20, Last 20, and 50 random ones.
        // Total ~100 checks is fast and statistically significant for patterns.
        // If user wants ALL, they can pass 'ALL' arg.

        const checkAll = process.argv.includes('--all');
        let urlsToCheck = [];

        if (checkAll) {
            urlsToCheck = urls;
            console.log(`${YELLOW}⚡️ Mode: FULL CHECK (${urls.length} URLs)${RESET}`);
        } else {
            console.log(`${YELLOW}⚡️ Mode: SMOKE TEST (Fast Sample)${RESET}`);
            const first20 = urls.slice(0, 20);
            const last20 = urls.slice(-20);
            const random50 = [];
            for (let i = 0; i < 50; i++) {
                random50.push(urls[Math.floor(Math.random() * urls.length)]);
            }
            // Unique
            urlsToCheck = [...new Set([...first20, ...last20, ...random50])];
            console.log(`Checking ${urlsToCheck.length} representative URLs...`);
        }

        // 4. Execution
        const results = [];
        const concurrency = 50; // High concurrency

        for (let i = 0; i < urlsToCheck.length; i += concurrency) {
            const batch = urlsToCheck.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(url => checkUrl(url)));
            results.push(...batchResults);
        }

        // 5. Report
        console.log('\n\n--- 🏁 Verification Report ---');
        const broken = results.filter(r => !r.success);
        console.log(`checked: ${results.length}`);
        console.log(`passed:  ${GREEN}${results.length - broken.length}${RESET}`);
        console.log(`failed:  ${broken.length > 0 ? RED : GREEN}${broken.length}${RESET}`);

        if (broken.length > 0) {
            console.log('\n❌ Failed URLs:');
            broken.slice(0, 20).forEach(b => console.log(`${RED}[${b.status}] ${b.url}${RESET}`));
            if (broken.length > 20) console.log(`...and ${broken.length - 20} more.`);
            process.exit(1);
        } else {
            console.log(`\n${GREEN}✅ Success! The sitemap URLs are responding correctly.${RESET}`);
            if (!checkAll) console.log(`(Run with --all to check every single URL)`);
        }

    } catch (e) {
        console.error(`${RED}Fatal Error: ${e.message}${RESET}`);
        if (e.code === 'ECONNREFUSED') {
            console.log(`${YELLOW}Hint: Make sure your Next.js server is running on port 3000.${RESET}`);
        }
        process.exit(1);
    }
}

main();
