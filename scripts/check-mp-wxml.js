/**
 * 微信小程序 WXML 全量编译门禁（2026-10-29「老是报错打不开」的收口）
 *
 * 为什么需要它：`mobile-sfc-check` 只验 Vue 模板语法，`ui-audit` 只按正则查版式，
 * **两者都看不见 WXML 表达式合不合法**。而 uni-app 会把模板表达式原样编进
 * `attr="{{...}}"`，微信的 WXML 解析器比 Vue 严格得多，典型地雷：
 *   · `:activity="activity || {}"`（**空对象字面量**）→ `{{activity||{}}}` ⇒
 *     `Bad attr activity ... unexpected token $`，整页 wxml 编译失败；
 *   · `:alt="(item.goods || {}).name"`（同上）；
 *   · `:style="c ? { 'font-weight': 600 } : ''"`（三元里的对象字面量、键带引号）⇒
 *     `Bad attr style ... unexpected token '`（见 check-mp-style-expr.js）；
 *   · 空对象、带引号键、其它 WXML 不认的 token —— 只有真编译器能一网打尽。
 *
 * 做法：把 `src/**\/*.vue` 逐个过 uni 的 mp 编译器生成 WXML，再交给**微信开发者工具自带的
 * `wcc`**（与 DevTools 同一个编译器）编一遍，任一文件报错即退出 1。
 * `wcc` 默认取 macOS 开发者工具内置路径，可用 `WCC_BIN=/path/to/wcc` 覆盖；
 * 找不到 wcc 时打印 SKIP、退出 0（不让别的机器/CI 因缺编译器而红）。
 *
 * 跑法：node tuzi-mobile/scripts/check-mp-wxml.js
 *       node tuzi-mobile/scripts/check-mp-wxml.js --selftest
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const sfc = require(path.join(ROOT, 'node_modules/vue-template-compiler'));
const { compile } = require(path.join(ROOT, 'node_modules/@dcloudio/uni-template-compiler'));
const getCompilerOptions = require(path.join(ROOT, 'node_modules/@dcloudio/uni-template-compiler/lib/mp'));

const WCC = process.env.WCC_BIN
    || '/Applications/wechatwebdevtools.app/Contents/Resources/app.asar.unpacked/node_modules/wcc-exec/wcc';

function walk(dir, acc) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) {
            if (/node_modules|uview-ui|uni_modules/.test(p)) continue;
            walk(p, acc);
        } else if (e.name.endsWith('.vue')) {
            acc.push(p);
        }
    }
    return acc;
}

/** 一个 .vue 的模板 → WXML 文本（编不出来返回空串，交给 sfc-check 报） */
function toWxml(template, rel) {
    const emitted = [];
    const opts = Object.assign({}, getCompilerOptions('mp-weixin'), {
        mp: { platform: 'mp-weixin' },
        resourcePath: rel,
        filterModules: {},
        wxComponents: {},
        emitFile(name, content) { emitted.push(content); },
        getJsonFile() { return {}; },
        getShadowTemplate() {},
        updateSpecialMethods() {},
        globalUsingComponents: {},
        updateGenericComponents() {},
        updateComponentGenerics() {},
        updateUsingGlobalComponents() {},
    });
    try {
        compile(template, opts);
    } catch (e) {
        return '';
    }
    return emitted.join('\n');
}

function wccCheck(wxml, file) {
    execFileSync(WCC, [file], { stdio: ['ignore', 'ignore', 'pipe'] });
}

if (!fs.existsSync(WCC)) {
    console.log(`SKIP 未找到 wcc（${WCC}），跳过 WXML 真编译；设 WCC_BIN 指向开发者工具内置 wcc 可启用`);
    process.exit(0);
}

if (process.argv.includes('--selftest')) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wxml-selftest-'));
    const bad = path.join(dir, 'bad.wxml');
    const good = path.join(dir, 'good.wxml');
    fs.writeFileSync(bad, '<view activity="{{activity||{}}}"></view>');
    fs.writeFileSync(good, '<view activity="{{activity}}"></view>');
    let badRed = false;
    try { wccCheck('', bad); } catch (e) { badRed = true; }
    let goodGreen = true;
    try { wccCheck('', good); } catch (e) { goodGreen = false; }
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`${badRed ? 'PASS' : 'FAIL'} 反例（空对象字面量）被 wcc 判红`);
    console.log(`${goodGreen ? 'PASS' : 'FAIL'} 正例（变量引用）通过`);
    process.exit(badRed && goodGreen ? 0 : 1);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'wxml-check-'));
const files = walk(path.join(ROOT, 'src'), []);
let templated = 0;
let checked = 0;
const errors = [];

for (const file of files) {
    let template = '';
    try {
        const parsed = sfc.parseComponent(fs.readFileSync(file, 'utf8'));
        template = (parsed.template || {}).content || '';
    } catch (e) {
        continue;
    }
    if (!template) continue;
    templated += 1;
    const rel = path.relative(ROOT, file).replace(/\\/g, '/').replace(/^src\//, '');
    const wxml = toWxml(template, rel);
    if (!wxml) continue;
    const tmp = path.join(dir, rel.replace(/[\/]/g, '__') + '.wxml');
    fs.writeFileSync(tmp, wxml);
    try {
        wccCheck(wxml, tmp);
        checked += 1;
    } catch (e) {
        const raw = (e.stderr || '').toString().trim().split('\n')[0] || '未知错误';
        errors.push({ file: rel, msg: raw.replace(tmp, '').slice(0, 220) });
    }
}

fs.rmSync(dir, { recursive: true, force: true });

if (!errors.length) {
    console.log(`PASS ${checked} 个含模板的 .vue 逐个过 wcc（微信 WXML 编译器），0 报错`);
    process.exit(0);
}
errors.forEach((e) => console.log(`[FAIL] ${e.file}\n        ${e.msg}`));
console.log(`\n共 ${errors.length} 个文件 WXML 编译失败（含模板 ${templated} 个）。`);
process.exit(1);
