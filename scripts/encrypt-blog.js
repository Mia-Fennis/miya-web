const fs = require('fs');
const path = require('path');

// ===== 配置 =====
const BLOG_PASSWORD = process.env.BLOG_PASSWORD || '广莫野人';
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const ENCRYPTED_DIR = path.join(__dirname, '..', 'blog', 'encrypted');

// 确保加密目录存在
if (!fs.existsSync(ENCRYPTED_DIR)) {
  fs.mkdirSync(ENCRYPTED_DIR, { recursive: true });
}

// 简单编码：base64 + 字符反转（防直接点开阅读，有密码才能解码）
function encode(content, password) {
  // 用密码作为 salt 做简单混淆
  const mixed = password + '::' + content;
  const base64 = Buffer.from(mixed, 'utf-8').toString('base64');
  // 反转字符串，增加一点难度
  return base64.split('').reverse().join('');
}

// 扫描所有 .md 文件
function findMarkdownFiles(dir, relative = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relative ? path.join(relative, entry.name) : entry.name;
    
    if (entry.isDirectory() && entry.name !== 'encrypted') {
      files.push(...findMarkdownFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push({ fullPath, relPath });
    }
  }
  
  return files;
}

// 编码所有博客文件
function encryptAll() {
  const files = findMarkdownFiles(BLOG_DIR);
  let count = 0;
  
  for (const { fullPath, relPath } of files) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const encoded = encode(content, BLOG_PASSWORD);
    
    // 输出到 encrypted 目录，保持目录结构
    const outputPath = path.join(ENCRYPTED_DIR, relPath.replace(/\.md$/, '.data'));
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, encoded, 'utf-8');
    count++;
    console.log(`🔐 ${relPath} → blog/encrypted/${relPath.replace(/\.md$/, '.data')}`);
  }
  
  console.log(`\n✅ 完成！${count} 个文件已加密`);
  console.log(`🔑 当前密码: ${BLOG_PASSWORD}`);
  console.log(`💡 更换密码后重新运行: node scripts/encrypt-blog.js`);
}

// 主程序
if (require.main === module) {
  encryptAll();
}

module.exports = { encode };
