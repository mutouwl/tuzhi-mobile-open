/**
 * 微信小程序产物自洽门禁（2026-10-31）
 *
 * 用户原话：「小程序编译后怎么又报这个错误呀？我们以前解决过了，它怎么老是在犯呀？」
 * 报错（开发者工具控制台，两次同形）：
 *   module 'common/main.js' is not defined, require args is './common/main.js'
 *   path `./common/main.wxss` not found from `./app.wxss`.
 *
 * 为什么单独落一条门禁：
 *  - 这个症状有**两条来路**，必须先分清，否则永远在猜：
 *    ① 产物本身是半成品（构建被 WXML/WXSS 错误中断、构建进程被别的操作撞掉）⇒ 重建构建；
 *    ② 产物完好、是开发者工具手里那份「过期清单」⇒ 清工具缓存，**不要**重建（重建还会再踩一次）。
 *  - 上一轮（2026-10-29）是 ①，这一次（2026-10-31）是 ②，两个症状一模一样，靠肉眼分不出来。
 *    本脚本把「产物到底自不自洽」变成一条命令：全 PASS ⇒ 只可能是 ②，直接去清缓存。
 *
 * 合同（全部只看 `dist/build/mp-weixin` 这份产物，不改源码、不构建）：
 *  ① 主包必需件齐全：app.js / app.json / app.wxss / common/{runtime,vendor,main}.js / common/main.wxss；
 *  ② 全树 `require("./x")` 与 `.wxss` 的 `@import "./x"` 目标都存在（断链 = 半成品构建）；
 *  ③ `app.json` 的 pages + subPackages 每一页都有 .js / .wxml / .json；
 *  ④ 全树 `usingComponents` 引用都能解析到组件 .json / .wxml（插件与内置库跳过）；
 *  ⑤ 包体口径：主包 ≤ 2048kB、全包 ≤ 20480kB（先扣 `project.config.json` 的 packOptions.ignore，
 *     与开发者工具「包体」同口径；实测与 2026-10-31 记录的主包 1964.3kB / 全包 4.30MB 逐项对齐）。
 *
 * 跑法：node tuzi-mobile/scripts/check-mp-weixin-build.js
 *       node tuzi-mobile/scripts/check-mp-weixin-build.js --selftest   （四颗坏样件必须全红）
 *       MP_WEIXIN_DIR=dist/dev/mp-weixin node tuzi-mobile/scripts/check-mp-weixin-build.js
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { MOBILE, resolveOutDir, walkFiles, relOf, measure } = require('./mp-weixin-paths');

const MAIN_LIMIT = 2048 * 1024;
const TOTAL_LIMIT = 20480 * 1024;
const REQUIRED = [
  ['app.js', '入口 app.js'],
  ['app.json', '页面注册 app.json'],
  ['app.wxss', '全局样式 app.wxss'],
  ['common/runtime.js', '公共运行时 common/runtime.js'],
  ['common/vendor.js', '公共依赖 common/vendor.js'],
  ['common/main.js', '主包业务代码 common/main.js'],
  ['common/main.wxss', '主包样式 common/main.wxss'],
];

const kb = (bytes) => (bytes / 1024).toFixed(1);

function check(outDir) {
  const pass = [];
  const fail = [];
  const info = [];
  const ok = (name) => pass.push(name);
  const no = (name, detail) => fail.push(name + (detail ? ' —— ' + detail : ''));
  const dirLabel = path.relative(MOBILE, outDir) || '.';

  if (!fs.existsSync(outDir)) {
    no('产物目录存在（' + dirLabel + '）', '目录都不存在，先跑一次构建：npm run build:mp-weixin');
    return { pass, fail, info };
  }

  // ① 主包必需文件（这一条直接对应报错里的 common/main.js / common/main.wxss）
  const missingRequired = REQUIRED
    .filter(([rel]) => !fs.existsSync(path.join(outDir, rel)))
    .map(([rel, label]) => label + '（' + rel + '）');
  if (missingRequired.length) {
    no('① 主包必需文件齐全', '缺 ' + missingRequired.join('、') + ' ⇒ 这是半成品产物，重建构建');
  } else {
    ok('① 主包必需文件齐全（app.{js,json,wxss} + common/{runtime,vendor,main}.js + common/main.wxss）');
  }

  // ② 全树 require / @import 断链
  const jsBroken = [];
  const wxssBroken = [];
  walkFiles(outDir, (abs) => {
    const rel = relOf(outDir, abs);
    if (rel.endsWith('.js')) {
      const src = fs.readFileSync(abs, 'utf8');
      const re = /require\(\s*(["'])([^"']+)\1\s*\)/g;
      let m;
      while ((m = re.exec(src))) {
        const target = m[2];
        if (target[0] !== '.') continue;
        const absTarget = path.resolve(path.dirname(abs), target);
        if (!fs.existsSync(absTarget) && !fs.existsSync(absTarget + '.js')) {
          jsBroken.push(rel + ' → ' + target);
        }
      }
    } else if (rel.endsWith('.wxss')) {
      const src = fs.readFileSync(abs, 'utf8');
      const re = /@import\s+(["'])([^"']+)\1/g;
      let m;
      while ((m = re.exec(src))) {
        const target = m[2];
        if (target[0] !== '.') continue;
        const absTarget = path.resolve(path.dirname(abs), target);
        if (!fs.existsSync(absTarget)) wxssBroken.push(rel + ' → ' + target);
      }
    }
  });
  const brief = (arr) => arr.slice(0, 5).join('；') + (arr.length > 5 ? ' 等 ' + arr.length + ' 处' : '');
  if (jsBroken.length) no('② JS 产物的 require 目标都存在', brief(jsBroken));
  else ok('② JS 产物的 require 目标都存在（全树扫描，0 断链）');
  if (wxssBroken.length) no('② WXSS 产物的 @import 目标都存在', brief(wxssBroken));
  else ok('② WXSS 产物的 @import 目标都存在（app.wxss → common/main.wxss 等 0 断链）');

  // ③ app.json 页面四件套
  let app = {};
  try {
    app = JSON.parse(fs.readFileSync(path.join(outDir, 'app.json'), 'utf8'));
  } catch (e) {
    no('③ app.json 可解析', e.message);
    app = null;
  }
  if (app) {
    const pages = [...(app.pages || [])];
    for (const sp of app.subPackages || app.subpackages || []) {
      for (const p of sp.pages || []) pages.push(sp.root + '/' + p);
    }
    const missing = [];
    for (const p of pages) {
      for (const ext of ['.js', '.wxml', '.json']) {
        if (!fs.existsSync(path.join(outDir, p + ext))) missing.push(p + ext);
      }
    }
    if (missing.length) no('③ 注册页面四件套齐全（' + pages.length + ' 页）', brief(missing));
    else ok('③ 注册页面四件套齐全（' + pages.length + ' 页 × .js/.wxml/.json）');

    // ④ usingComponents 断链
    const compBroken = [];
    let compRefs = 0;
    walkFiles(outDir, (abs) => {
      if (!abs.endsWith('.json')) return;
      const rel = relOf(outDir, abs);
      // app.json 的 usingComponents 是「全局组件」，必须一起核（app.json 那 1 处正是 bind-mobile-modal）
      if (rel === 'siteinfo.js' || rel === 'project.config.json') return;
      let json = null;
      try {
        json = JSON.parse(fs.readFileSync(abs, 'utf8'));
      } catch (e) {
        return;
      }
      const uses = json && json.usingComponents;
      if (!uses || typeof uses !== 'object') return;
      for (const [tag, value] of Object.entries(uses)) {
        if (typeof value !== 'string') continue;
        compRefs += 1;
        if (/^(plugin|ext|weui|wx):\/\//.test(value)) continue;
        if (value.startsWith('weui-miniprogram')) continue;
        const candidates = value.startsWith('.')
          ? [path.resolve(path.dirname(abs), value)]
          : [path.join(outDir, value.replace(/^\//, ''))];
        const hit = candidates.some((c) => fs.existsSync(c + '.json') || fs.existsSync(c + '.wxml'));
        if (!hit) compBroken.push(rel + ' 的 ' + tag + ' → ' + value);
      }
    });
    if (compBroken.length) no('④ usingComponents 引用可解析（' + compRefs + ' 处）', brief(compBroken));
    else ok('④ usingComponents 引用可解析（' + compRefs + ' 处，0 断链）');
  }

  // ⑤ 包体
  const { main, total, per, roots, count } = measure(outDir);
  const sizeLine = '主包 ' + kb(main) + 'kB（限 2048，余 ' + kb(Math.max(MAIN_LIMIT - main, 0)) + 'kB）'
    + ' / 全包 ' + (total / 1024 / 1024).toFixed(2) + 'MB（限 20MB） '
    + '· ' + count + ' 个文件（已扣 packOptions.ignore）';
  const detailLine = roots.map((r) => r + ' ' + kb(per[r] || 0) + 'kB').join('、');
  if (main > MAIN_LIMIT) no('⑤ 主包体积 ≤ 2048kB', sizeLine + '；' + detailLine);
  else if (total > TOTAL_LIMIT) no('⑤ 全包体积 ≤ 20MB', sizeLine + '；' + detailLine);
  else ok('⑤ 包体未超限：' + sizeLine);
  if (detailLine) info.push('分包构成：' + detailLine);

  if (!fail.length) {
    info.push('产物自洽 ⇒ 此时开发者工具若仍报 `common/main.js is not defined` / '
      + '`path \'./common/main.wxss\' not found`，那是它手里那份**过期文件清单**'
      + '（每次构建 webpack 会把产物目录整体删掉重建，目录 inode 变了，工具的监听跟着失效），'
      + '跑 `node tuzi-mobile/scripts/mp-weixin-recover.js` 清一次编译缓存即可，**不要重建构建**。');
  } else {
    info.push('产物不自洽 ⇒ 重建构建：`npm run build:mp-weixin`（构建日志里先找 WXML/WXSS 编译错误，'
      + '那类错误会让构建停在半路，产出一棵缺件的树）。');
  }
  return { pass, fail, info };
}

function report({ pass, fail, info }) {
  pass.forEach((n) => console.log('[PASS] ' + n));
  fail.forEach((n) => console.log('[FAIL] ' + n));
  info.forEach((n) => console.log('[INFO] ' + n));
  console.log('\n结果：' + (fail.length
    ? '产物不自洽（' + fail.length + ' 项不符）'
    : '产物自洽')
    + '（通过 ' + pass.length + ' 项 / 违反 ' + fail.length + ' 项）');
}

/** 四颗坏样件：把「半成品产物」的四种真实形态各造一颗，门禁必须各自报红 */
function selftest(outDir) {
  if (!fs.existsSync(path.join(outDir, 'app.json'))) {
    console.log('[FAIL] 没有产物可做自检（' + (path.relative(MOBILE, outDir) || '.') + '），先跑一次构建');
    process.exit(1);
  }
  const firstPage = JSON.parse(fs.readFileSync(path.join(outDir, 'app.json'), 'utf8')).pages[0];
  const cases = [
    {
      name: '主包样式 common/main.wxss 缺失（恰是这次报错里的那一份）',
      mutate: (dir) => fs.rmSync(path.join(dir, 'common/main.wxss')),
      expect: 'common/main.wxss',
    },
    {
      name: '主包业务代码 common/main.js 缺失（用户报错里的那一份）',
      mutate: (dir) => fs.rmSync(path.join(dir, 'common/main.js')),
      expect: 'common/main.js',
    },
    {
      name: '注册页面的 .js 缺失（半成品产物的典型形态）',
      mutate: (dir) => fs.rmSync(path.join(dir, firstPage + '.js')),
      expect: firstPage + '.js',
    },
    {
      name: 'app.js 里 require 指向一个不存在的文件（断链）',
      mutate: (dir) => fs.appendFileSync(path.join(dir, 'app.js'), '\nrequire("./common/__gate_nope__.js");\n'),
      expect: '__gate_nope__',
    },
  ];
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mp-weixin-gate-'));
  let red = 0;
  try {
    cases.forEach((c, i) => {
      const dir = path.join(tmpRoot, 'case-' + (i + 1));
      fs.cpSync(outDir, dir, { recursive: true });
      c.mutate(dir);
      const res = check(dir);
      const hit = res.fail.some((line) => line.indexOf(c.expect) >= 0);
      if (res.fail.length && hit) {
        red += 1;
        console.log('[PASS] 坏样件 ' + (i + 1) + '『' + c.name + '』报红且指向 ' + c.expect);
      } else {
        console.log('[FAIL] 坏样件 ' + (i + 1) + '『' + c.name + '』没报红（或没指向 ' + c.expect
          + '）：' + (res.fail.length ? res.fail.join('；') : '门禁全 PASS'));
      }
      fs.rmSync(dir, { recursive: true, force: true });
    });
  } finally {
    fs.rmSync(tmpRoot, { recursive: true, force: true });
  }
  console.log(red === cases.length
    ? '\nSELFTEST PASS：' + red + '/' + cases.length + ' 颗坏样件全部报红'
    : '\nSELFTEST FAIL：期望 ' + cases.length + ' 颗报红，实得 ' + red);
  process.exit(red === cases.length ? 0 : 1);
}

const outDir = resolveOutDir();
if (process.argv.includes('--selftest')) {
  selftest(outDir);
} else {
  const res = check(outDir);
  report(res);
  process.exit(res.fail.length ? 1 : 0);
}
