// 测试加密/解密流程（完全模拟浏览器环境）
const fs = require('fs');
const path = require('path');

// 模拟浏览器 atob（Node 的 atob 和浏览器行为一致）
function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
}

// 完全复制自 app.js 的 decodeContent 逻辑（用 atob，不用 Buffer）
function decodeContent(encoded, password) {
  try {
    const reversed = encoded.split('').reverse().join('');
    const binary = atob(reversed);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8').decode(bytes);
    const prefix = password + '::';
    if (decoded.startsWith(prefix)) {
      return decoded.slice(prefix.length);
    }
    return null;
  } catch (e) {
    console.error('Decode error:', e.message);
    return null;
  }
}

// 复制自 encrypt-blog.js 的 encode 逻辑
function encode(content, password) {
  const mixed = password + '::' + content;
  const base64 = Buffer.from(mixed, 'utf-8').toString('base64');
  return base64.split('').reverse().join('');
}

// 测试用已知密码
const testPassword = 'mia-TEST99';

// 1. 测试简单中文内容
const chineseContent = '# 测试标题\n\n这是一个测试，包含中文：弱监督语义分割。';
const encoded = encode(chineseContent, testPassword);
const decoded = decodeContent(encoded, testPassword);
console.log('=== 简单中文测试 ===');
console.log('Original:', chineseContent.substring(0, 50));
console.log('Decoded:', decoded ? decoded.substring(0, 50) : 'NULL');
console.log('Match:', decoded === chineseContent ? '✅ PASS' : '❌ FAIL');
console.log('');

// 2. 测试实际日记文件
const diaryPath = path.join(__dirname, '../blog/encrypted/diary/hello-world.data');
const diaryEncoded = fs.readFileSync(diaryPath, 'utf-8');

// 尝试常见密码
const passwordsToTry = [
  '广莫野人',
  'mia-1R2931',
  'mia-TEST99',
  'mia-',
];

console.log('=== 日记文件密码探测 ===');
for (const pwd of passwordsToTry) {
  const result = decodeContent(diaryEncoded, pwd);
  if (result) {
    console.log(`✅ 密码 "${pwd}" 成功！前50字:`, result.substring(0, 50));
  } else {
    console.log(`❌ 密码 "${pwd}" 失败`);
  }
}

// 3. 测试实际技术博客文件
const techPath = path.join(__dirname, '../blog/encrypted/tech/wsss-survey.data');
const techEncoded = fs.readFileSync(techPath, 'utf-8');

console.log('');
console.log('=== 技术博客密码探测 ===');
for (const pwd of passwordsToTry) {
  const result = decodeContent(techEncoded, pwd);
  if (result) {
    console.log(`✅ 密码 "${pwd}" 成功！前50字:`, result.substring(0, 50));
  } else {
    console.log(`❌ 密码 "${pwd}" 失败`);
  }
}
