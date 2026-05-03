const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'miaya-secret-key-change-in-production';

function verify(token) {
  try {
    const [header, body, signature] = token.split('.');
    const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expected) return null;
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  // 验证 token
  const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
  const payload = verify(token);
  if (payload?.access !== 'blog') {
    return res.status(401).json({ success: false, message: '请先验证密码' });
  }

  // 读取博客内容
  const { slug } = req.query;
  if (!slug) {
    return res.status(400).json({ success: false, message: '缺少 slug 参数' });
  }

  // 安全校验：slug 只能包含字母数字和中划线/斜杠
  if (!/^[a-zA-Z0-9\-_/]+$/.test(slug)) {
    return res.status(400).json({ success: false, message: '无效的 slug' });
  }

  const filePath = path.join(__dirname, '..', 'blog', `${slug}.md`);
  const resolvedPath = path.resolve(filePath);
  const blogDir = path.resolve(__dirname, '..', 'blog');

  // 确保在 blog 目录范围内（防目录遍历）
  if (!resolvedPath.startsWith(blogDir)) {
    return res.status(403).json({ success: false, message: '访问被拒绝' });
  }

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return res.status(200).json({ success: true, content });
  } catch (err) {
    return res.status(404).json({ success: false, message: '文章未找到' });
  }
};
