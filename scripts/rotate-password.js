const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const PROJECT_DIR = path.join(__dirname, '..');
const BLOG_DIR = path.join(PROJECT_DIR, 'blog');
const ENCRYPTED_DIR = path.join(BLOG_DIR, 'encrypted');

// 从 .git-credentials 读取 GitHub Token
function getToken() {
  const credPath = path.join(PROJECT_DIR, '.git-credentials');
  if (!fs.existsSync(credPath)) {
    console.error('❌ .git-credentials 不存在');
    return null;
  }
  const content = fs.readFileSync(credPath, 'utf-8').trim();
  const match = content.match(/https:\/\/(ghp_[a-zA-Z0-9]{36,})/);
  if (!match) {
    console.error('❌ 无法从 .git-credentials 解析 Token');
    return null;
  }
  return match[1];
}

// 生成随机密码：mia- + 6位随机字符
function generatePassword() {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = 'mia-';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// GitHub API：获取文件 SHA
function getFileSha(token, owner, repo, filePath) {
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${filePath}`,
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'MiaRotator/1.0'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.sha || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// GitHub API：上传/更新文件
async function uploadFile(token, owner, repo, filePath, localPath, message) {
  const content = fs.readFileSync(localPath);
  const base64Content = content.toString('base64');
  const sha = await getFileSha(token, owner, repo, filePath);

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      message,
      content: base64Content,
      branch: 'main',
      ...(sha ? { sha } : {})
    });

    const req = https.request({
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}/contents/${filePath}`,
      method: 'PUT',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'MiaRotator/1.0',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 扫描所有加密文件
function findEncryptedFiles(dir, relative = '') {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = relative ? path.join(relative, entry.name) : entry.name;
    if (entry.isDirectory()) {
      files.push(...findEncryptedFiles(fullPath, relPath));
    } else if (entry.isFile() && entry.name.endsWith('.data')) {
      files.push({ fullPath, relPath });
    }
  }
  return files;
}

// 主流程
async function main() {
  const token = getToken();
  if (!token) {
    process.exit(1);
  }

  // 生成新密码
  const newPassword = generatePassword();
  const today = new Date().toISOString().split('T')[0];
  console.log(`🔑 新密码: ${newPassword}`);

  // 保存密码记录
  const passwordFile = path.join(PROJECT_DIR, 'memory', 'blog-password.txt');
  if (!fs.existsSync(path.dirname(passwordFile))) {
    fs.mkdirSync(path.dirname(passwordFile), { recursive: true });
  }
  fs.writeFileSync(passwordFile, `${today}: ${newPassword}\n`, { flag: 'a' });
  console.log(`💾 密码已记录到: ${passwordFile}`);

  // 重新加密博客
  console.log('\n🔐 重新加密博客文件...');
  try {
    execSync(`BLOG_PASSWORD="${newPassword}" node scripts/encrypt-blog.js`, {
      cwd: PROJECT_DIR,
      stdio: 'inherit'
    });
  } catch (e) {
    console.error('❌ 加密失败:', e.message);
    process.exit(1);
  }

  // 推送加密文件到 GitHub
  console.log('\n🚀 推送到 GitHub...');
  const encryptedFiles = findEncryptedFiles(ENCRYPTED_DIR);

  for (const { fullPath, relPath } of encryptedFiles) {
    const repoPath = `blog/encrypted/${relPath}`;
    const result = await uploadFile(token, 'Mia-Fennis', 'miya-web', repoPath, fullPath, `security: 每日密码轮换 (${today})`);
    if (result.status === 200 || result.status === 201) {
      console.log(`✅ ${repoPath}`);
    } else {
      console.log(`❌ ${repoPath}: ${JSON.stringify(result.data)}`);
    }
  }

  console.log(`\n🎉 密码轮换完成！`);
  console.log(`📅 日期: ${today}`);
  console.log(`🔑 新密码: ${newPassword}`);
  console.log(`🌐 网站: https://mia-fennis.github.io/miya-web/`);
  console.log(`\n💡 提示：密码已保存到 memory/blog-password.txt`);
  console.log(`   也可通过 Kimi Group Chat 向米娅查询当前密码`);
}

main().catch(err => {
  console.error('❌ 错误:', err);
  process.exit(1);
});
