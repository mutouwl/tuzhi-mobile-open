/**
 * uni-app 编译 mp-weixin 时，@tdesign/uniapp 组件的编译资源
 * 生成到 node-modules/@tdesign/uniapp/dist/ 下，但页面 index.json 引用的是
 * node-modules/@tdesign/uniapp/（不带 dist/）路径。
 * 此脚本将缺失的 .wxml/.json/.js/.wxss 复制到对应位置。
 * 用法：node scripts/fix-tdesign-mp.js [build|dev]（默认 build）。
 */
const fs = require('fs');
const path = require('path');

const outputType = process.argv[2] || 'build';
const outputDir = path.resolve(__dirname, '../dist', outputType, 'mp-weixin');
const distDir = path.join(outputDir, 'node-modules/@tdesign/uniapp/dist');
const targetDir = path.join(outputDir, 'node-modules/@tdesign/uniapp');

if (!fs.existsSync(distDir)) {
  console.log('[fix-tdesign-mp] dist directory not found, skipping.');
  process.exit(0);
}

let copied = 0;
const entries = fs.readdirSync(distDir, { withFileTypes: true });
for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  const name = entry.name;
  const targetComponentDir = path.join(targetDir, name);
  if (!fs.existsSync(targetComponentDir)) continue;

  const sourceComponentDir = path.join(distDir, name);
  for (const file of fs.readdirSync(sourceComponentDir)) {
    if (!['.wxml', '.json', '.js', '.wxss'].includes(path.extname(file).toLowerCase())) continue;
    const src = path.join(sourceComponentDir, file);
    const dst = path.join(targetComponentDir, file);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      copied++;
    }
  }
}

console.log(`[fix-tdesign-mp] Copied ${copied} missing file(s).`);
