/**
 * 微信小程序构建产物的公共路径 / 遍历工具（2026-10-31）
 *
 * 只有一处解析规则：产物目录 = `dist/build/mp-weixin`（开发态 `dist/dev/mp-weixin`），
 * 可用 `MP_WEIXIN_DIR` 覆盖。被下面两只脚本共用，别在脚本里各写一份：
 *   - `check-mp-weixin-build.js`  产物自洽门禁（构建后硬门）
 *   - `mp-weixin-recover.js`      开发者工具那份过期清单的一键恢复
 */
const fs = require('fs');
const path = require('path');

/** tuzi-mobile 根（本文件在 scripts/ 下） */
const MOBILE = path.resolve(__dirname, '..');
const CANDIDATES = ['dist/build/mp-weixin', 'dist/dev/mp-weixin'];

/** 解析当前产物目录（存在 app.json 的那个；都不存在时回落到 build 那一档） */
function resolveOutDir() {
  if (process.env.MP_WEIXIN_DIR) return path.resolve(MOBILE, process.env.MP_WEIXIN_DIR);
  for (const rel of CANDIDATES) {
    const abs = path.join(MOBILE, rel);
    if (fs.existsSync(path.join(abs, 'app.json'))) return abs;
  }
  return path.join(MOBILE, CANDIDATES[0]);
}

/** 递归遍历（跳过 .DS_Store；回调拿到绝对路径） */
function walkFiles(dir, onFile) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(abs, onFile);
    else if (entry.name !== '.DS_Store') onFile(abs);
  }
}

/** 相对产物目录的 posix 路径（报告里统一用 /，不受平台影响） */
function relOf(outDir, abs) {
  return path.relative(outDir, abs).split(path.sep).join('/');
}

/** `project.config.json` 里 packOptions.ignore 的命中判定（folder / file / suffix 三型） */
function makeIgnoreMatcher(outDir) {
  let ignore = [];
  const cfg = path.join(outDir, 'project.config.json');
  if (fs.existsSync(cfg)) {
    try {
      const json = JSON.parse(fs.readFileSync(cfg, 'utf8'));
      ignore = (json.packOptions && json.packOptions.ignore) || [];
    } catch (e) {
      ignore = [];
    }
  }
  return function ignored(rel) {
    for (const item of ignore) {
      const value = String(item.value || '').replace(/^\.\//, '').replace(/\/+$/, '');
      if (!value) continue;
      if (item.type === 'folder' && (rel === value || rel.startsWith(value + '/'))) return true;
      if (item.type === 'file' && rel === value) return true;
      if (item.type === 'suffix' && rel.endsWith(value)) return true;
    }
    return false;
  };
}

/** 体积配比：主包 / 各分包 / 全包（与开发者工具「包体」同口径：先扣 packOptions.ignore，再按分包根归堆） */
function measure(outDir) {
  const ignored = makeIgnoreMatcher(outDir);
  let app = { subPackages: [] };
  try {
    app = JSON.parse(fs.readFileSync(path.join(outDir, 'app.json'), 'utf8'));
  } catch (e) {
    app = { subPackages: [] };
  }
  const roots = ((app.subPackages || app.subpackages || []).map((s) => s.root)).filter(Boolean);
  const per = {};
  let main = 0;
  let total = 0;
  let count = 0;
  walkFiles(outDir, (abs) => {
    const rel = relOf(outDir, abs);
    if (ignored(rel)) return;
    let size = 0;
    try {
      size = fs.statSync(abs).size;
    } catch (e) {
      return;
    }
    count += 1;
    total += size;
    const root = roots.find((r) => rel === r || rel.startsWith(r + '/'));
    if (root) per[root] = (per[root] || 0) + size;
    else main += size;
  });
  return { main, total, per, roots, count };
}

module.exports = { MOBILE, resolveOutDir, walkFiles, relOf, makeIgnoreMatcher, measure };
