const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '../app/data/generated_roles.json');
const destPath = path.join(__dirname, '../app/data/generated_roles_light.json');

console.log("Reading source file...");
const rawData = fs.readFileSync(sourcePath, 'utf8');
const roles = JSON.parse(rawData);

console.log(`Processing ${roles.length} roles...`);

const lightRoles = roles.map(role => ({
    slug: role.slug,
    job_title: role.job_title,
    experience_level: role.experience_level,
    category: role.job_title.toLowerCase().includes('manager') ? 'management' : 'tech', // Simple heuristic or if existed in source
    avg_salary_india: role.avg_salary_india || "Competitive",
    hard_skills: role.hard_skills || [],
    lastModified: new Date().toISOString()
}));

fs.writeFileSync(destPath, JSON.stringify(lightRoles, null, 2));

console.log(`✅ Generated light JSON at ${destPath}`);
console.log(`Size: ${(fs.statSync(destPath).size / 1024 / 1024).toFixed(2)} MB`);
