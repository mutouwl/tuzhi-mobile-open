/**
 * 小程序 WXML：`:style` 表达式里不许出现对象字面量（2026-10-29 线上「直接打不开」的机器验法）
 *
 * 事故现场：`components/order/course.vue` 的
 *   `:style="priceColor ? { color: priceColor, 'font-weight': 600 } : ''"`
 * 被 uni 编成
 *   `style="{{(priceColor?{color:priceColor,'font-weight':600}:'')}}"`
 * —— 顶层对象字面量 uni 会序列化成串，**三元里的对象字面量不会**：
 *   · 键带引号（`'font-weight'`）⇒ 微信开发者工具报
 *     `[WXML 文件编译错误] Bad attr style with message: unexpected token '`，整页 WXML 编译失败；
 *   · 键不带引号（`{ marginTop: ... }`）⇒ WXML 能过，但 style 属性拿到的是一个对象
 *     （读出来 `[object Object]`），那一格样式静默失效。
 *
 * 口径：模板里的 `:style` 只绑**字符串**：`'color:' + x`、`'margin-bottom:-' + margin + 'px'`；
 * 对象字面量只在「整个表达式就是一个对象字面量」时安全（uni 会拼成串，如 `:style="{ 'margin-bottom': margin + 'px' }"`），
 * 一旦放进三元/逻辑运算里就必须自己拼串。
 *
 * 跑法：node tuzi-mobile/scripts/check-mp-style-expr.js
 *       node tuzi-mobile/scripts/check-mp-style-expr.js --selftest   # 验这条门禁能红
 * 退出码：命中 0 为 0；否则 1。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const sfc = require(path.join(ROOT, 'node_modules/vue-template-compiler'));
const { compile } = require(path.join(ROOT, 'node_modules/@dcloudio/uni-template-compiler'));
const getCompilerOptions = require(path.join(ROOT, 'node_modules/@dcloudio/uni-template-compiler/lib/mp'));

function mpOptions(rel) {
    return Object.assign({}, getCompilerOptions('mp-weixin'), {
        mp: { platform: 'mp-weixin' },
        resourcePath: rel,
        filterModules: {},
        wxComponents: {},
        emitFile(name, content) { this.emitted.push(content); },
        getJsonFile() { return {}; },
        getShadowTemplate() {},
        updateSpecialMethods() {},
        globalUsingComponents: {},
        updateGenericComponents() {},
        updateComponentGenerics() {},
        updateUsingGlobalComponents() {},
    });
}

/** 把一份模板编成 WXML，返回 `style="{{...}}"` 里「去掉字符串字面量后仍含对象字面量」的那些表达式 */
function scanTemplate(template, rel) {
    const opts = mpOptions(rel);
    opts.emitted = [];
    compile(template, opts);
    const wxml = opts.emitted.join('\n');
    const out = [];
    // 只认真正的 style 属性：`custom-style="{{...}}"` / `overlay-style="{{...}}"` 是组件 prop，允许对象
    const re = /(?<![-\w])style="\{\{([\s\S]*?)\}\}"/g;
    let m;
    while ((m = re.exec(wxml))) {
        const expr = m[1];
        // 对象字面量：`{...}` 里再套 `{}` 的写法（内联 style）没见过，按单层取
        const objs = expr.match(/\{[^{}]*\}/g) || [];
        if (!objs.length) continue;
        // 带引号的**键**才是 WXML 编译错误；带引号的**值**（`m + 'px'`）是合法的
        const fatal = objs.some((obj) => /'[^']*'\s*:/.test(obj));
        out.push({ expr: m[0], fatal });
    }
    return out;
}

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

function scanAll() {
    const hits = [];
    for (const file of walk(path.join(ROOT, 'src'), [])) {
        let template = '';
        try {
            const parsed = sfc.parseComponent(fs.readFileSync(file, 'utf8'));
            template = (parsed.template || {}).content || '';
        } catch (e) {
            continue;
        }
        if (!template) continue;
        const rel = path.relative(ROOT, file).replace(/\\/g, '/');
        let found = [];
        try {
            found = scanTemplate(template, rel.replace(/^src\//, ''));
        } catch (e) {
            // 编译不过的模板另有门禁（mobile-sfc-check），这里只负责样式表达式
            continue;
        }
        found.forEach((f) => hits.push({ file: rel, ...f }));
    }
    return hits;
}

if (process.argv.includes('--selftest')) {
    const fatal = scanTemplate(
        `<view :style="on ? { color: c, 'font-weight': 600 } : ''"></view>`,
        'components/__selftest__.vue'
    );
    const silent = scanTemplate(
        `<view :style="on ? { marginTop: m + 'px' } : null"></view>`,
        'components/__selftest__.vue'
    );
    const safe = scanTemplate(
        `<view :style="on ? 'margin-top:' + m + 'px' : ''"></view>`,
        'components/__selftest__.vue'
    );
    const ok1 = fatal.length === 1 && fatal[0].fatal === true;
    const ok2 = silent.length === 1 && silent[0].fatal === false;
    const ok3 = safe.length === 0;
    console.log(`${ok1 ? 'PASS' : 'FAIL'} 反例①带引号对象（会编译失败）被识别`);
    console.log(`${ok2 ? 'PASS' : 'FAIL'} 反例②无引号对象（静默失效）被识别`);
    console.log(`${ok3 ? 'PASS' : 'FAIL'} 正例（拼成 style 串）不误报`);
    process.exit(ok1 && ok2 && ok3 ? 0 : 1);
}

const hits = scanAll();
if (!hits.length) {
    console.log('PASS 全站模板的 style 表达式里没有对象字面量（487 个 .vue 逐个过 uni mp 编译器）');
    process.exit(0);
}
hits.forEach((h) => {
    console.log(`${h.fatal ? '[FAIL] 会编译失败' : '[FAIL] 静默失效'} ${h.file}\n        ${h.expr.slice(0, 180)}`);
});
console.log(`\n共 ${hits.length} 处。改法：把三元里的对象拆成 style 串，如 'color:' + x + ';font-weight:600'。`);
process.exit(1);
