/**
 * 修复 @tdesign/uniapp 在微信小程序端的 :host 组合选择器问题。
 *
 * 背景：tdesign 组件样式使用 :host { ... } 设置宿主节点样式（如
 * tab-bar-item 的 flex: 1，用于等分 tab 项宽度），但 vue-loader scoped
 * 编译后变成 .data-v-xxxxx:host 组合选择器，微信小程序不支持类与 :host
 * 的组合写法，导致宿主节点样式失效、tab-bar 布局错乱。
 *
 * 修复：将编译产物 wxss 中 .data-v-xxxxx:host 还原为 :host
 * （微信基础库 1.7.2+ 支持单独 :host 选择器）。
 *
 * 用法：
 *   node scripts/fix-tdesign-tabbar-host.js           # 修复一次
 *   node scripts/fix-tdesign-tabbar-host.js --watch   # 监控产物被覆盖后自动修复
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const targets = [
  path.join(projectRoot, 'dist/dev/mp-weixin'),
  path.join(projectRoot, 'dist/build/mp-weixin'),
];
const hostPattern = /\.data-v-[0-9a-f]+:host/g;

function fixWxss(file) {
  if (!fs.existsSync(file)) return 0;
  const content = fs.readFileSync(file, 'utf8');
  const fixed = content.replace(hostPattern, ':host');
  if (fixed === content) return 0;
  fs.writeFileSync(file, fixed, 'utf8');
  return 1;
}

function fixAll() {
	let fixed = 0;
	for (const root of targets) {
		const tdesignDir = path.join(root, 'node-modules/@tdesign/uniapp');
		if (!fs.existsSync(tdesignDir)) continue;
		const walk = (dir) => {
			for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
				const fullPath = path.join(dir, entry.name);
				if (entry.isDirectory()) {
					walk(fullPath);
					continue;
				}
				if (entry.isFile() && entry.name.endsWith('.wxss')) {
					fixed += fixWxss(fullPath);
				}
			}
		};
		walk(tdesignDir);
	}
  if (fixed > 0) {
    console.log(`[fix-tdesign-tabbar-host] Fixed ${fixed} wxss file(s).`);
  }
}

if (process.argv.includes('--watch')) {
  console.log('[fix-tdesign-tabbar-host] Watching for tdesign wxss regeneration...');
  fixAll();
  setInterval(fixAll, 3000);
} else {
  fixAll();
}
