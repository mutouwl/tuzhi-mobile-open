// tz-filter-popup「确认按钮上方间距」这一族的机器验法（硬约束 26：一类界面偏离被点名时先补机器化验法）
//
// 跑法：node tuzi-mobile/scripts/check-filter-popup-gap.js
//       node tuzi-mobile/scripts/check-filter-popup-gap.js --selftest   （样件必须报红，见 D 节）
//
// 背景（2026-10-27 用户点名「筛选弹窗为什么没有留出下边距啊，排序选项都贴上确认按钮了」，
// 现场 pages/public/search/search?content=1：9 个类型选项换成 3 行 + 2 个排序选项）：
// 面板是 flex 列 + min-height:300px，收口只写 `.sort-confirm { margin-top: auto }`。
// 内容一旦把面板撑过 min-height（这一屏实算 ≈389px > 300），auto 间距就归零 ⇒ 最后一组选项贴住按钮。
// 三件静态门禁都看不见：sfc-check 只编译模板、ui-audit 只按正则查版式、这条是「内容高 vs 面板高」的
// 几何关系（同一份 CSS 在别的调用点内容更少时是正常的）。
//
// 钉四件事：
//   A. 面板仍是 flex 列（收口占位块这套前提成立）；
//   B. 模板里 `.sort-gap` 占位块紧挨在 `.sort-confirm` 之前（中间不许夹别的节点）；
//   C. 占位块是「可增长但有下限」：grow ≥ 1 且保底 ≥ 20px（短内容压到底、长内容不贴死）；
//   D. 收口间距只由占位块一处给：`.sort-confirm` 不许再挂 margin-top:auto，选项组也不许自带下外边距
//      （两处各给一份 = 时间那一档被叠成 40px）。
const fs = require('fs');
const path = require('path');

const COMPONENT = path.resolve(__dirname, '../src/components/tz/filter-popup.vue');

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const blockOf = (css, cls) => (css.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0];
const decl = (block, prop) => {
  const m = new RegExp('(?:^|[;{\\s])' + prop + '\\s*:\\s*([^;{}]+)').exec(block);
  return m ? m[1].replace(/\s*!important$/, '').trim() : '';
};
const pxOf = (v) => {
  const m = /^(-?[\d.]+)px$/.exec(String(v).trim());
  return m ? Number(m[1]) : NaN;
};

/** 占位块的下限：flex 简写（grow shrink basis）里的 basis，或单独写的 min-height */
function gapFloor(block) {
  const flex = decl(block, 'flex');
  const minH = pxOf(decl(block, 'min-height'));
  const grow = pxOf(decl(block, 'flex-grow'));
  if (flex) {
    const t = flex.split(/\s+/);
    const g = Number(t[0]);
    const s = t.length > 1 ? Number(t[1]) : 1;
    const b = t.length > 2 ? pxOf(t[2]) : 0;
    return {
      grow: Number.isFinite(g) ? g : 0,
      shrink: Number.isFinite(s) ? s : 1,
      basis: Number.isFinite(b) ? b : 0,
      minHeight: Number.isFinite(minH) ? minH : 0,
      note: `flex: ${flex}`,
    };
  }
  return {
    grow: Number.isFinite(grow) ? grow : 0,
    shrink: 1,
    basis: 0,
    minHeight: Number.isFinite(minH) ? minH : 0,
    note: flex ? `flex: ${flex}` : minH ? `min-height: ${minH}px` : '（没有 flex / min-height）',
  };
}

function analyze(src) {
  const styleStart = src.indexOf('<style');
  const template = src.slice(0, styleStart < 0 ? src.length : styleStart).replace(/<!--[\s\S]*?-->/g, '');
  const css = stripComments(src.slice(styleStart < 0 ? 0 : styleStart));

  const panel = blockOf(css, 'sort-popup');
  const gap = blockOf(css, 'sort-gap');
  const confirm = blockOf(css, 'sort-confirm');
  const groups = ['type-options', 'sort-options', 'time-options'].map((cls) => ({ cls, block: blockOf(css, cls) }));

  // A. 面板仍是 flex 列
  const isFlexCol = /display\s*:\s*flex/.test(panel) && /flex-direction\s*:\s*column/.test(panel);
  ok('A. .sort-popup 是 flex 列（收口占位块的前提）', isFlexCol, `.sort-popup ${isFlexCol ? '' : '不是 flex 列'}`.trim());

  // B. 占位块紧挨在确认按钮之前
  const tail = template.slice(template.lastIndexOf('sort-gap'));
  const adjacent = template.includes('sort-gap') && /class="sort-gap"[\s\S]*?<view class="sort-confirm"/.test(template) &&
    !/<view[^>]*class="(?!sort-gap|sort-confirm)/.test(tail.slice(tail.indexOf('class="sort-gap"'), tail.indexOf('class="sort-confirm"')));
  ok('B. 模板里 .sort-gap 占位块紧挨在 .sort-confirm 之前', adjacent, adjacent ? '' : '缺占位块、或两者之间夹了别的节点');

  // C. 可增长但有下限
  const f = gapFloor(gap);
  const floor = Math.max(f.basis, f.minHeight);
  ok('C. 占位块 grow ≥ 1（短内容压到底）', f.grow >= 1, f.note);
  ok('C. 占位块保底 ≥ 20px 且不可收缩（长内容不贴死）', floor >= 20 && f.shrink === 0, `保底 ${floor}px / shrink ${f.shrink}`);

  // D. 收口间距只由占位块一处给
  const autoOnConfirm = /margin-top\s*:\s*auto/.test(confirm);
  ok('D. .sort-confirm 不再挂 margin-top:auto（内容撑过 min-height 时会塌成 0）', !autoOnConfirm, autoOnConfirm ? '仍是 auto 收口' : '');
  const dup = groups.filter((g) => g.block && pxOf(decl(g.block, 'margin-bottom')) > 0);
  ok('D. 选项组不自带下外边距（否则与占位块叠成两份）', dup.length === 0, dup.map((g) => `.${g.cls} margin-bottom`).join('、'));

  return results;
}

/* ---------- 样件：先证明这套判据能红，再跑真件（D 节） ---------- */
if (process.argv.includes('--selftest')) {
  const good = `
    <view class="sort-gap"></view><view class="sort-confirm" @tap="onConfirm">确认</view>
    <style>.sort-popup{display:flex;flex-direction:column;min-height:300px}
    .sort-gap{flex:1 0 20px}.sort-confirm{padding:11px 0}
    .sort-options{display:flex;margin-top:9px}</style>`;
  const badNoGap = `
    <view class="sort-options"></view><view class="sort-confirm" @tap="onConfirm">确认</view>
    <style>.sort-popup{display:flex;flex-direction:column;min-height:300px}
    .sort-confirm{margin-top:auto;padding:11px 0}.sort-options{display:flex;margin-top:9px}</style>`;
  const badNoFloor = `
    <view class="sort-gap"></view><view class="sort-confirm">确认</view>
    <style>.sort-popup{display:flex;flex-direction:column}
    .sort-gap{flex:1}.sort-confirm{padding:11px 0}</style>`;
  const badDouble = `
    <view class="sort-gap"></view><view class="sort-confirm">确认</view>
    <style>.sort-popup{display:flex;flex-direction:column}
    .sort-gap{flex:1 0 20px}.sort-confirm{padding:11px 0}
    .time-options{display:flex;margin-bottom:20px}</style>`;

  const cases = [
    ['好样件（现行结构）必须全绿', good, true],
    ['坏样件（只剩 margin-top:auto）必须报红', badNoGap, false],
    ['坏样件（占位块 flex:1 没有下限）必须报红', badNoFloor, false],
    ['坏样件（占位块 + 选项组下外边距叠两份）必须报红', badDouble, false],
  ];
  let bad = 0;
  for (const [name, src, expectPass] of cases) {
    results.length = 0;
    analyze(src);
    const pass = results.every((r) => r.pass);
    if (pass !== expectPass) {
      bad += 1;
      console.log(`  FAIL 自检：${name}（实际 ${pass ? '全绿' : '报红'}）`);
      results.filter((r) => !r.pass).forEach((r) => console.log(`        ${r.name} ${r.note}`));
    } else {
      console.log(`  PASS 自检：${name}`);
    }
  }
  if (bad) {
    console.log(`\nFAIL 自检 ${bad} 条：判据与样件对不上，先修脚本再谈真件。`);
    process.exit(1);
  }
  console.log('\nPASS 自检四条（好样件绿、三种坏样件各自红）');
  process.exit(0);
}

const target = process.argv[2] || COMPONENT;
const src = fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
analyze(src);

const shown = path.relative(path.resolve(__dirname, '../..'), target).split(path.sep).join('/') || target;
console.log(`检查 ${shown} —— 确认按钮上方收口间距：${results.filter((r) => r.pass).length}/${results.length}`);
for (const r of results) {
  console.log(`  ${r.pass ? 'PASS' : 'FAIL'} ${r.name}${r.note ? ' —— ' + r.note : ''}`);
}
if (results.some((r) => !r.pass)) {
  console.log('修法：确认按钮前放一枚 .sort-gap { flex: 1 0 20px } 占位块，收口间距只由它给。');
  process.exit(1);
}
console.log('PASS 收口间距有下限、且只存一处');
