const fs = require('fs');
const data = JSON.parse(fs.readFileSync('app/blogdata/blogdata.json', 'utf8'));
data.blogs.forEach(b => console.log(`${b.id}: ${b.title}`));
