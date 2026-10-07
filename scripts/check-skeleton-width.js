// 骨架屏占位条宽度自检（不构建、不开浏览器）
//
// 为什么要钉这一条：uview 的 u-skeleton 把「百分比宽度」当成 nvue 的特殊情况处理——它先延时查一次
// 自身容器宽度（$uGetRect），再用 width × 百分比 算出 px。那次查询在小程序端查不到节点时既不
// resolve 也不 reject，width 永久停在 0 ⇒ 所有百分比占位条算成 0px，用户读出来就是
// 「骨架屏显示不完整、没有动态效果、部分区域空白」（只有页面里手写的 #e5e6eb 静态块还在）。
// H5 端 mounted 时 DOM 已就绪，量得到宽度，所以两端不一致、只有小程序犯病。
//
// 修法：非 nvue 端把百分比原样交给 CSS，整条链不再依赖那次 DOM 查询；nvue 那一支保持原样。
//
// 用法：node tuzi-mobile/scripts/check-skeleton-width.js
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, '../src/components/uview-ui/components/u-skeleton/u-skeleton.vue');
const src = fs.readFileSync(file, 'utf8');
const script = src.slice(src.indexOf('<script>') + 8, src.lastIndexOf('</script>'));

let fail = 0;
const ok = (name, cond) => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}`);
  if (!cond) fail += 1;
};

/** 按 uni-app 条件编译的口径剥分支：keep = 'mp' 丢 APP-NVUE 支（小程序/H5 实际吃的代码），
 *  keep = 'nvue' 反过来只留 APP-NVUE 支 */
function stripIfdef(code, keep) {
  const re = /\/\/\s*#(ifdef|ifndef)\s+([^\n]*)\n([\s\S]*?)\/\/\s*#endif[^\n]*\n/g;
  return code.replace(re, (all, kind, cond, body) => {
    const isNvueBranch = (kind === 'ifdef') === /APP-NVUE/.test(cond);
    const isKept = keep === 'nvue' ? isNvueBranch : !isNvueBranch;
    return isKept ? body : '';
  });
}

/** 把 computed 里的两个函数取出来实跑，返回值即模板上 width / style 里的那一份 */
function runComputed(keep, data) {
  const code = stripIfdef(script, keep);
  const grab = (name) => {
    const start = code.indexOf(`\t\t\t${name}() {`);
    if (start < 0) throw new Error(`取不到 computed: ${name}`);
    const head = code.slice(start).trimStart();
    let i = head.indexOf('{'), depth = 0;
    for (let j = i; j < head.length; j += 1) {
      if (head[j] === '{') depth += 1;
      else if (head[j] === '}' && (depth -= 1) === 0) return head.slice(0, j + 1);
    }
    throw new Error(`${name} 括号不成对`);
  };
  const $u = {
    // 与 libs/function/index.js 的 addUnit 同口径：纯数值补单位，带单位/百分号的原样返回
    addUnit: (value = 'auto', unit = 'px') => {
      const v = String(value);
      return /^-?(\d+\.?\d*|\.\d+)$/.test(v) ? `${v}${unit}` : v;
    },
    test: { array: (v) => Array.isArray(v) },
    error: () => {},
  };
  const ctx = Object.assign({}, data);
  const body = `
    const o = { ${grab('rowsArray')}, ${grab('uTitleWidth')} };
    return { rowsArray: o.rowsArray.call(ctx), uTitleWidth: o.uTitleWidth.call(ctx) };
  `;
  // eslint-disable-next-line no-new-func
  return new Function('ctx', 'uni', body)(ctx, { $u });
}

// ① 小程序/H5 吃的那一支：容器宽度量不到（width=0，正是犯病的那一档）也要给出真实百分比
const mp = runComputed('mp', {
  width: 0, rows: 2, rowsWidth: ['92%', '64%'], rowsHeight: '14',
  title: true, titleWidth: '38%', titleHeight: 15,
});
ok('小程序端：rowsWidth 数组的百分比原样交给 CSS，不再被算成 0px',
  JSON.stringify(mp.rowsArray.map((r) => r.width)) === JSON.stringify(['92%', '64%']));
ok('小程序端：titleWidth 的百分比同样原样交给 CSS', mp.uTitleWidth === '38%');
ok('小程序端：行高仍按数值补 px（rows-height 传的是数字）',
  mp.rowsArray.every((r) => /px$/.test(r.height)) && mp.rowsArray[0].height === '14px');

// ② 末行回落档：数组只给一行时，第二行不能变成 undefined（M16 要求 rows-width 传数组就是为控这一档）
const lastRow = runComputed('mp', {
  width: 0, rows: 2, rowsWidth: ['80%'], rowsHeight: '12', title: false, titleWidth: '50%', titleHeight: 18,
});
ok('小程序端：rows-width 少给一档时末行按 100% 兜底而不是空值',
  lastRow.rowsArray.map((r) => r.width).join(',') === '80%,100%');

// ③ nvue 那一支保持原样（nvue 不吃百分比，必须继续按量到的容器宽换算 px）
const nvue = runComputed('nvue', {
  width: 300, rows: 1, rowsWidth: ['50%'], rowsHeight: '12', title: true, titleWidth: '40%', titleHeight: 16,
});
ok('nvue 端：百分比仍换算成 px（width 300 × 50% = 150px）',
  nvue.rowsArray[0].width === '150px' && nvue.uTitleWidth === '120px');

// ④ 非 nvue 端不得再去查那次 DOM（查不到就永不 resolve，width 停在 0 是整条链的病根）
const mpCode = stripIfdef(script, 'mp');
ok('小程序端不再用 $uGetRect 量自身容器宽（getComponentWidth 整段收进 APP-NVUE）',
  mpCode.indexOf('this.$uGetRect(') < 0 && mpCode.indexOf('u-skeleton__wrapper__content') < 0);
ok('nvue 那一支的 dom 查询仍保留（不是把功能整个删掉）',
  stripIfdef(script, 'nvue').indexOf('dom.getComponentRect') >= 0);
ok('调用点写法不变：百分比仍由 rows-width/title-width 传，不需逐页改模板',
  /rowsWidth/.test(script) && /titleWidth/.test(script));

console.log(fail ? `\n${fail} 项失败` : '\n全部通过');
process.exit(fail ? 1 : 0);
