const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';

// Colors for console output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

async function checkUrl(url) {
    try {
        const start = Date.now();
        const res = await fetch(url, { method: 'HEAD' });
        const time = Date.now() - start;

        if (res.status === 200) {
            console.log(`${GREEN}✓ [200] ${url} (${time}ms)${RESET}`);
            return true;
        } else {
            console.log(`${RED}✗ [${res.status}] ${url}${RESET}`);
            return false;
        }
    } catch (e) {
        console.log(`${RED}✗ [ERR] ${url} : ${e.message}${RESET}`);
        return false;
    }
}

async function main() {
    console.log(`Starting 404 check against ${BASE_URL}...\n`);

    const urlsChecklist = [
        '/',
        '/resume-builder',
        '/biodata-for-marriage',
    ];

    // Load generated roles
    try {
        const lightRolesPath = path.join(__dirname, '../app/data/generated_roles_light.json');
        const lightRoles = JSON.parse(fs.readFileSync(lightRolesPath, 'utf8'));

        console.log(`Found ${lightRoles.length} generated roles.`);

        // Pick 20 random roles
        const sampleSize = 20;
        for (let i = 0; i < sampleSize; i++) {
            const randomRole = lightRoles[Math.floor(Math.random() * lightRoles.length)];
            urlsChecklist.push(`/resume-format-for/${randomRole.slug}`);
        }

    } catch (e) {
        console.error("Could not load generated roles:", e.message);
    }

    // Load static roles sample
    try {
        const staticRolesPath = path.join(__dirname, '../app/data/job_roles.json');
        const staticRoles = JSON.parse(fs.readFileSync(staticRolesPath, 'utf8'));
        // Pick 5 random static roles
        for (let i = 0; i < 5; i++) {
            const randomRole = staticRoles[Math.floor(Math.random() * staticRoles.length)];
            urlsChecklist.push(`/resume-format-for/${randomRole.slug}`);
        }
    } catch (e) {
        console.error("Could not load static roles:", e.message);
    }

    console.log(`Checking ${urlsChecklist.length} URLs...\n`);

    let failures = 0;
    for (const p of urlsChecklist) {
        const success = await checkUrl(`${BASE_URL}${p}`);
        if (!success) failures++;
    }

    console.log(`\nDone. ${failures} failures found.`);
    if (failures > 0) process.exit(1);
}

main();
