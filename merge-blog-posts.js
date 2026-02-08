const fs = require('fs');

console.log('🔄 Merging new blog posts into blogdata.json...\n');

try {
  // Read existing blog data
  const blogDataPath = './app/blogdata/blogdata.json';
  const blogData = JSON.parse(fs.readFileSync(blogDataPath, 'utf8'));
  
  // Read new blog posts
  const newPostsPath = './new_blog_posts.json';
  const newPosts = JSON.parse(fs.readFileSync(newPostsPath, 'utf8'));
  
  // Create backup
  const backupPath = `${blogDataPath}.backup-${Date.now()}`;
  fs.writeFileSync(backupPath, JSON.stringify(blogData, null, 2));
  console.log(`✅ Backup created: ${backupPath}`);
  
  // Get current highest ID
  const currentMaxId = Math.max(...blogData.blogs.map(b => b.id));
  console.log(`📊 Current highest blog ID: ${currentMaxId}`);
  console.log(`📊 Current blog count: ${blogData.blogs.length}`);
  
  // Update IDs if needed
  newPosts.forEach((post, index) => {
    post.id = currentMaxId + index + 1;
  });
  
  // Add new posts
  blogData.blogs.push(...newPosts);
  
  // Write updated data
  fs.writeFileSync(blogDataPath, JSON.stringify(blogData, null, 2));
  
  console.log(`\n✅ Successfully added ${newPosts.length} new blog posts!`);
  console.log(`📊 New blog count: ${blogData.blogs.length}`);
  console.log(`📊 New blog IDs: ${newPosts.map(p => p.id).join(', ')}`);
  console.log(`\n📝 New blog URLs:`);
  newPosts.forEach(post => {
    console.log(`   - https://resumegyani.in/blog/${post.slug}`);
  });
  
  console.log(`\n🎉 Done! Your blog posts are ready.`);
  console.log(`\n⚠️  Next step: Run 'npm run build' to test`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

