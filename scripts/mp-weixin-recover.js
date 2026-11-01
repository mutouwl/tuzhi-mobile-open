/**
 * 微信开发者工具「过期文件清单」一键恢复（2026-10-31）
 *
 * 症状（两次同形，2026-10-29 / 2026-10-31）：
 *   module 'common/main.js' is not defined, require args is './common/main.js'
 *   path `./common/main.wxss` not found from `./app.wxss`
 *   —— 而 `node tuzi-mobile/scripts/check-mp-weixin-build.js` 全 PASS（磁盘上的产物是好的）。
 *
 * 原因：每次构建，webpack 会把 `dist/build/mp-weixin` 整体删掉重建（`common/` 目录的 inode
 * 都会变）。开发者工具若在这个窗口内建立/持有文件清单与目录监听，旧清单就永不刷新：
 * 之后它一直认为 `common/main.js`、`common/main.wxss` 不存在 ⇒ app.js 里的 require 落空。
 * 所以这不是代码问题、也不是产物问题，**重建构建只会再原子地踩一遍**。
 *
 * 恢复办法：让开发者工具把编译缓存与文件清单丢掉重建
 *   = `cli cache --clean compile`（只清编译缓存，不动 storage / 登录态）。
 *
 * 跑法：node tuzi-mobile/scripts/mp-weixin-recover.js            （开发者工具在跑才动手）
 *       node tuzi-mobile/scripts/mp-weixin-recover.js --check    （只诊断，不改任何东西）
 *       node tuzi-mobile/scripts/mp-weixin-recover.js --quiet    （构建链里用：只打一行结论）
 *       node tuzi-mobile/scripts/mp-weixin-recover.js --force    （没检测到 IDE 也尝试）
 *       node tuzi-mobile/scripts/mp-weixin-recover.js --strict   （没修成时 exit 1）
 * 环境变量：MP_WEIXIN_DIR 指定产物目录；WECHAT_DEVTOOLS_CLI 指定 cli 路径。
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { MOBILE, resolveOutDir } = require('./mp-weixin-paths');

const ARGS = process.argv.slice(2);
const QUIET = ARGS.includes('--quiet');
const CHECK_ONLY = ARGS.includes('--check');
const FORCE = ARGS.includes('--force');
const STRICT = ARGS.includes('--strict');

const DEFAULT_CLI = {
  darwin: '/Applications/wechatwebdevtools.app/Contents/MacOS/cli',
  win32: 'C:\\Program Files (x86)\\Tencent\\微信web开发者工具\\cli.bat',
  linux: '/opt/wechat-devtools/bin/cli',
};
const CLI = process.env.WECHAT_DEVTOOLS_CLI || DEFAULT_CLI[process.platform] || '';
const IDE_PROCESS = {
  darwin: 'wechatwebdevtools.app/Contents/MacOS/Electron',
  win32: 'wechatdevtools.exe',
};

const log = (msg) => { if (!QUIET) console.log(msg); };
const out = (msg) => console.log(msg);

function ideRunning() {
  const pattern = IDE_PROCESS[process.platform];
  try {
    if (process.platform === 'darwin') {
      const r = spawnSync('pgrep', ['-f', pattern], { encoding: 'utf8' });
      return r.status === 0 && String(r.stdout || '').trim() !== '';
    }
    if (process.platform === 'win32') {
      const r = spawnSync('tasklist', [], { encoding: 'utf8' });
      return r.status === 0 && String(r.stdout || '').toLowerCase().includes('wechat');
    }
    const r = spawnSync('pgrep', ['-f', 'wechat-devtools|wechatwebdevtools'], { encoding: 'utf8' });
    return r.status === 0 && String(r.stdout || '').trim() !== '';
  } catch (e) {
    return false;
  }
}

function manualSteps() {
  out('');
  out('手动修法（任选其一，都不必重建构建）：');
  out('  1) 工具里点「编译」（⌘B / Ctrl+B）；');
  out('  2) 工具栏「清缓存」→「清除编译缓存」；');
  out('  3) 关掉这个项目窗口再重新打开（会重建目录监听，最彻底）。');
  out('  注：CLI 走不通时多半是「设置 → 安全设置 → 服务端口」没开，开启后重跑本脚本即可。');
}

if (process.env.MP_NO_RECOVER === '1' && !FORCE) {
  log('[SKIP] MP_NO_RECOVER=1，跳过开发者工具编译缓存清理。');
  process.exit(0);
}

const outDir = resolveOutDir();
const relOut = path.relative(MOBILE, outDir) || '.';
const gateFiles = ['app.js', 'app.json', 'common/main.js', 'common/main.wxss'];
const missing = gateFiles.filter((rel) => !fs.existsSync(path.join(outDir, rel)));

if (CHECK_ONLY) {
  out('产物目录：' + relOut + (fs.existsSync(outDir) ? '' : '（不存在）'));
  out('产物必需件：' + (missing.length ? '缺 ' + missing.join('、') + ' ⇒ 该重建构建，不是工具缓存问题' : '齐全'));
  out('开发者工具在运行：' + (ideRunning() ? '是' : '否'));
  out('CLI：' + (CLI && fs.existsSync(CLI) ? CLI : '没找到（' + (CLI || '未配置') + '）'));
  process.exit(0);
}

if (missing.length) {
  out('[SKIP] 产物缺 ' + missing.join('、') + ' ⇒ 这是半成品构建（' + relOut + '），'
    + '清工具缓存没用，请先 `npm run build:mp-weixin` 重建。');
  process.exit(STRICT ? 1 : 0);
}

if (!ideRunning() && !FORCE) {
  log('[SKIP] 微信开发者工具没在运行，无需清编译缓存；打开工具后若仍报 '
    + '`common/main.js is not defined`，再跑一次本脚本。');
  process.exit(0);
}

if (!CLI || !fs.existsSync(CLI)) {
  out('[FAIL] 找不到微信开发者工具 CLI（' + (CLI || '未配置') + '），'
    + '可用 WECHAT_DEVTOOLS_CLI 指定路径。');
  manualSteps();
  process.exit(STRICT ? 1 : 0);
}

log('[..] 清编译缓存：cli cache --clean compile --project ' + relOut);
const r = spawnSync(CLI, ['cache', '--clean', 'compile', '--project', outDir], {
  encoding: 'utf8',
  timeout: 180000,
});

if (r.status === 0) {
  out('[OK] 已清掉开发者工具的编译缓存（' + relOut + '）。'
    + '工具会自动重编一次；若窗口还停在报错页，点一下「编译」（⌘B / Ctrl+B）。');
  process.exit(0);
}

out('[FAIL] 清缓存失败（exit ' + (r.status === null ? r.signal || 'timeout' : r.status) + '）。');
const detail = [r.stdout, r.stderr].filter(Boolean).join('\n').trim();
if (detail) out(String(detail).split('\n').slice(-6).join('\n'));
manualSteps();
process.exit(STRICT ? 1 : 0);
