const fs = require('fs');

const BASE_URL = 'http://localhost:3000';
const SITEMAP_URL = `${BASE_URL}/sitemap.xml`;

const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

async function checkUrl(url) {
    try {
        const res = await fetch(url, { method: 'HEAD' });
        if (res.status === 200) {
            // console.log(`${GREEN}✓ [200] ${url}${RESET}`); // specialized logging to avoid noise
            process.stdout.write('.');
            return { url, status: 200, success: true };
        } else {
            console.log(`\n${RED}✗ [${res.status}] ${url}${RESET}`);
            return { url, status: res.status, success: false };
        }
    } catch (e) {
        console.log(`\n${RED}✗ [ERR] ${url} : ${e.message}${RESET}`);
        return { url, status: 'ERR', success: false };
    }
}

async function main() {
    console.log(`Fetching sitemap from ${SITEMAP_URL}...`);
    try {
        const res = await fetch(SITEMAP_URL);
        if (res.status !== 200) {
            console.error(`${RED}Failed to fetch sitemap: ${res.status}${RESET}`);
            process.exit(1);
        }
        const xml = await res.text();

        // Simple regex to extract URLs
        const regex = /<loc>(.*?)<\/loc>/g;
        let match;
        const urls = [];
        while ((match = regex.exec(xml)) !== null) {
            let url = match[1];
            // Rewrite to localhost
            url = url.replace('https://expertresume.us', BASE_URL);
            urls.push(url);
        }

        console.log(`Found ${urls.length} URLs in sitemap.`);

        const results = [];
        const concurrency = 10;

        for (let i = 0; i < urls.length; i += concurrency) {
            const batch = urls.slice(i, i + concurrency);
            const batchResults = await Promise.all(batch.map(url => checkUrl(url)));
            results.push(...batchResults);
        }

        console.log('\n\n--- Summary ---');
        const broken = results.filter(r => !r.success);
        console.log(`Total Checked: ${results.length}`);
        console.log(`Success: ${results.length - broken.length}`);
        console.log(`Broken: ${broken.length}`);

        if (broken.length > 0) {
            console.log('\nBroken URLs:');
            broken.forEach(b => console.log(`${RED}[${b.status}] ${b.url}${RESET}`));
            process.exit(1);
        } else {
            console.log(`${GREEN}All URLs are valid!${RESET}`);
        }

    } catch (e) {
        console.error(`${RED}Error: ${e.message}${RESET}`);
        process.exit(1);
    }
}

main();
