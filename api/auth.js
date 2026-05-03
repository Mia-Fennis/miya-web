const crypto = require('crypto');

// 从环境变量读取密码和 JWT 密钥
const BLOG_PASSWORD = process.env.BLOG_PASSWORD || 'xinwang2026';
const JWT_SECRET = process.env.JWT_SECRET || 'miaya-secret-key-change-in-production';

// 简单的 JWT 实现（避免额外依赖）
function sign(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST /api/auth — 验证密码
  if (req.method === 'POST') {
    const { password } = req.body || {};
    if (password === BLOG_PASSWORD) {
      const token = sign({ access: 'blog', iat: Date.now() });
      return res.status(200).json({ success: true, token });
    }
    return res.status(401).json({ success: false, message: '密码错误' });
  }

  // GET /api/auth — 验证 token 是否有效
  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;
    const payload = verify(token);
    if (payload?.access === 'blog') {
      return res.status(200).json({ success: true, valid: true });
    }
    return res.status(401).json({ success: false, valid: false });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
};
