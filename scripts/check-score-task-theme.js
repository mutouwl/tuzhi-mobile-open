#!/usr/bin/env node
/**
 * 积分任务行的「模块主题色」机器验法（硬约束 26：一类界面偏离被点名时先补机器化验法再改代码；
 * 硬约束 29：换配色是成组交付物，压在同一个底上的每一档都要跟着走）。
 *
 * 用户原话（2026-11-08，这两天分两轮落在同一处）：
 * 「Mobile 端这个积分中心页面的积分任务呀，列表右侧的按钮可以参考同类产品，把按钮的主题色调整为黄色，
 *   也就是我们这个页面顶部的背景色那种主题。包括已完成，或者这个每个任务加多少积分，这个数值也可以
 *   调整为对应的这个主题色，看起来会活动属性更强一些」
 *
 * 为什么必须单独一只脚本（硬约束 27③）：这条链每一跳都跨组件边界 —— 页面顶部的琥珀渐变在
 * `score/home/home.vue` 的 `.score-head`、按钮底色在 `components/tz/button.vue` 的 `theme` 档、
 * 任务行的三档状态（实底钮 / 已完成 / 实底钮）在 `score/components/task-list.vue`。
 * `sfc-check` 只编译模板、`ui-audit` 只按正则查版式，**没有一跳看得见「按钮底色与页面顶部那条渐变
 * 是不是同一条」「那个深色小字在白底上到底够不够读」**：
 *   · 把按钮写成同一条渐变 ⇒ 白字压浅端只有 1.55:1，26px 高的小块上整条读不清（M81 同理）；
 *   · 只换按钮、把「+N 积分 / 已完成」留在平台蓝与冷灰 ⇒ 用户读出来就是「只改了一枚」；
 *   · 小字直接抄渐变本体 ⇒ 12px 汉字压白底 2.1–2.6:1，比不改还难读。
 *
 * 钉的五件事：
 *   A. `tz-button` 有 `theme="score"` 这一档，且底色取的是**页面顶部渐变的前两档**（逐字同值）；
 *      第三档浅端 `#f8ca47` 不进按钮（白字 1.55:1）。
 *   B. 任务行两枚按钮（领取 / 去完成）都带 `theme="score"`——同一列右侧不许一半琥珀一半全站蓝。
 *   C. `.task-score` / `.task-done` 两档小字从同一条渐变的深端派生，且**在白底与页面底 #
 *      fafafa 上都过 4.5:1**（硬约束 29①：每一档自己算，不许"看着挺清楚"）。
 *   D. 三档状态共用一套模块色：不许再有平台蓝 `#0968f6`，也不许把「已完成」退回冷灰 `#86909c`。
 *   E. 两处调用点（积分中心首页 / 全部任务页）都只挂共用组件，不许在页面里再写一份任务行。
 *
 * 跑法：node tuzi-mobile/scripts/check-score-task-theme.js
 *      node tuzi-mobile/scripts/check-score-task-theme.js --selftest   # 每类坏样件必须各红一次
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/** 这一族的落点登记表（全集普查：新增一处任务行不登记当场报红） */
const FILES = {
  button: 'src/components/tz/button.vue',
  taskList: 'src/pages/app/score/components/task-list.vue',
  home: 'src/pages/app/score/home/home.vue',
  tasks: 'src/pages/app/score/tasks/tasks.vue',
};

const read = (rel) => {
  const p = path.join(ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
};

/* ---------------------------------------------------------------- 颜色工具（纯函数，自检复用） */

const hexToRgb = (hex) => {
  const h = hex.replace('#', '');
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
};

function luminance(hex) {
  const f = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** 色相（0–360）：判断「是不是从同一条渐变派生」只认色相，不认具体明度 */
function hueOf(hex) {
  const [r0, g0, b0] = hexToRgb(hex).map((v) => v / 255);
  const mx = Math.max(r0, g0, b0);
  const mn = Math.min(r0, g0, b0);
  const d = mx - mn;
  if (d === 0) return 0;
  let h;
  if (mx === r0) h = ((g0 - b0) / d + (g0 < b0 ? 6 : 0)) / 6;
  else if (mx === g0) h = ((b0 - r0) / d + 2) / 6;
  else h = ((r0 - g0) / d + 4) / 6;
  return h * 360;
}

const hueGap = (a, b) => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

/* ---------------------------------------------------------------- 判据 */

/** 页面顶部余额区那条渐变的色标（唯一真源：`score/home` 的 `.score-head`） */
function headStopsOf(homeSrc) {
  const block = (homeSrc.match(/\.score-head\s*\{[\s\S]*?\}/) || [''])[0];
  const gradient = (block.match(/linear-gradient\([^;]*\)/) || [''])[0];
  return (gradient.match(/#[0-9a-fA-F]{6}/g) || []).map((c) => c.toUpperCase());
}

/** `tz-button` 的积分主题档：第一行取色标表，第二行留给他（返回停止色数组） */
function buttonThemeStops(btnSrc) {
  const rule = (btnSrc.match(/\.tuzi-btn\.primary\.theme-score\s*\{[^}]*\}/) || [''])[0];
  return {
    bound: /'theme-score':\s*theme == 'score'/.test(btnSrc),
    rule,
    stops: (rule.match(/#[0-9a-fA-F]{6}/g) || []).map((c) => c.toUpperCase()),
  };
}

/** 任务行里所有 `tz-button` 的 theme 取�� */
function taskButtonThemes(tplSrc) {
  const tpl = (tplSrc.match(/<template>[\s\S]*<\/template>/) || [''])[0];
  return (tpl.match(/<tz-button\b[^>]*>/g) || []).map((tag) => {
    const m = tag.match(/\btheme="([^"]*)"/);
    return m ? m[1] : '';
  });
}

/** 某条 CSS 规则里的 color 值（取不到返回空串）；先把 CSS 注释剥成空格，
 *  否则「注释夹在 font-size 与 color 之间」会让行首分号的判据永远接不上 */
function colorOfRule(src, selector) {
  const clean = src.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}');
  const body = (clean.match(re) || ['', ''])[1];
  const m = body.match(/(?:^|;)\s*color:\s*(#[0-9a-fA-F]{6})/);
  return m ? m[1].toUpperCase() : '';
}

/* ---------------------------------------------------------------- 跑 */

function runAll(sources = null) {
  const src = sources || {
    button: read(FILES.button),
    taskList: read(FILES.taskList),
    home: read(FILES.home),
    tasks: read(FILES.tasks),
  };
  const rows = [];
  const add = (id, issues) => rows.push({ id, issues });

  const headStops = headStopsOf(src.home);
  const btn = buttonThemeStops(src.button);
  const themes = taskButtonThemes(src.taskList);
  const scoreColor = colorOfRule(src.taskList, '.task-score');
  const doneColor = colorOfRule(src.taskList, '.task-done');

  /* A. 按钮主题档：与顶部渐变前两档逐字同值 */
  const aIssues = [];
  if (!headStops.length) { aIssues.push('读不到页面顶部 `.score-head` 的渐变色标（唯一真源被改名或删了）'); }
  if (!btn.bound) { aIssues.push(`\`tz-button\` 没有 \`theme-score\` 的类绑定（theme == 'score' 这一档不存在）`); }
  if (!btn.rule) { aIssues.push('`button.vue` 里没有 `.tuzi-btn.primary.theme-score` 这条规则'); }
  if (btn.rule && headStops.length >= 2) {
    const want = headStops.slice(0, 2);
    if (btn.stops.length !== 2 || btn.stops[0] !== want[0] || btn.stops[1] !== want[1]) {
      aIssues.push(`按钮渐变色标 ${btn.stops.join(' → ') || '（空）'} 与页面顶部前两档 ${want.join(' → ')} 不同值（同一条主题色只存一处，M81）`);
    }
  }
  if (btn.rule && /f8ca47/i.test(btn.rule)) {
    aIssues.push('按钮带上顶部渐变第三档 `#f8ca47`：白字压浅端只有 1.55:1，26px 高的小块上读不清');
  }
  add('A `tz-button` 的 `theme="score"` 取页面顶部渐变前两档', aIssues);

  /* B. 任务行两枚按钮都走这一档 */
  const bIssues = [];
  if (themes.length !== 2) {
    bIssues.push(`任务行应有两枚 \`tz-button\`（领取 / 去完成），实测 ${themes.length} 枚`);
  }
  themes.forEach((t, i) => {
    if (t !== 'score') { bIssues.push(`第 ${i + 1} 枚按钮的 theme 是 \`${t || '（未传）'}\`，应为 score（同一列右侧一半琥珀一半全站蓝）`); }
  });
  add('B 任务行两枚按钮都带 `theme="score"`', bIssues);

  /* C+D. 两档小字：同族派生 + 两档底上都过 4.5:1，且不再回平台蓝 / 冷灰 */
  [['C1 `+N 积分` 取主题深一档且白底 ≥4.5:1', scoreColor, ['.task-score']],
   ['C2 「已完成」取同一档主题色且白底 ≥4.5:1', doneColor, ['.task-done']]].forEach(([id, color, selectors]) => {
    const issues = [];
    if (!color) {
      issues.push(`${selectors[0]} 里没有十六进制 color 声明`);
    } else {
      if (/#0968F6/i.test(color)) { issues.push(`${selectors[0]} 仍是平台主色蓝 ${color}（积分模块不吃平台蓝）`); }
      if (/#86909C/i.test(color)) { issues.push(`${selectors[0]} 退回全站冷灰 ${color}（用户点名「包括已完成」要跟着换）`); }
      const onWhite = contrast(color, '#FFFFFF');
      const onPage = contrast(color, '#FAFAFA');
      if (onWhite < 4.5 || onPage < 4.5) {
        issues.push(`${selectors[0]} ${color} 对比度不足：白底 ${onWhite.toFixed(2)}:1 / 页面底 ${onPage.toFixed(2)}:1（12px 小字要求 ≥4.5）`);
      }
      const headHue = headStops.length ? hueOf(headStops[0]) : hueOf('#EF8531');
      if (hueGap(hueOf(color), headHue) > 12) {
        issues.push(`${selectors[0]} ${color} 的色相 ${hueOf(color).toFixed(1)}° 与顶部渐变 ${headHue.toFixed(1)}° 相差超过 12°，不是同一条主题色派生`);
      }
    }
    add(id, issues);
  });

  /* E. 两处调用点只挂共用组件 */
  const eIssues = [];
  ['home', 'tasks'].forEach((key) => {
    const file = FILES[key];
    if (!/score\/components\/task-list\.vue/.test(src[key])) { eIssues.push(`${file} 没有引用共用任务行组件`); }
    // 页面里再写一份任务行 = 第二处实现（硬约束 11：同一组字段/形态只存一处）
    if (/\.task-score\s*\{|\.task-done\s*\{/.test(src[key])) { eIssues.push(`${file} 自己又写了一份任务行样式（应只留 task-list.vue 一份）`); }
  });
  add('E 两处调用点都只挂共用任务行组件', eIssues);

  return rows;
}

function report(rows, title) {
  let failed = 0;
  console.log('\n' + title);
  for (const r of rows) {
    if (!r.issues.length) { console.log('  [ok]   ' + r.id); }
    else { failed++; console.log('  [FAIL] ' + r.id + ' -> ' + r.issues.join('；')); }
  }
  console.log('\n[FAIL]=' + failed);
  return failed;
}

/* ---------------------------------------------------------------- 自检
 * 每个坏样件都必须真的让对应判据报红 —— 没亲眼见过红的门禁不算门禁。 */

function selftest() {
  const base = {
    button: read(FILES.button),
    taskList: read(FILES.taskList),
    home: read(FILES.home),
    tasks: read(FILES.tasks),
  };
  const failsOf = (patch) => {
    const src = Object.assign({}, base, patch);
    return runAll(src).filter((r) => r.issues.length).length;
  };

  const cases = [
    {
      name: '按钮主题档摘掉 `theme-score` 类绑定',
      red: failsOf({ button: base.button.replace(/'theme-score':theme == 'score',/, '') }) > 0,
    },
    {
      name: '按钮底色漂走（不再与页面顶部前两档同值）',
      red: failsOf({ button: base.button.replace('linear-gradient(90deg, #ef8531 0%, #f2a03a 100%)', 'linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)') }) > 0,
    },
    {
      name: '按钮带上顶部浅端 `#f8ca47`（白字 1.55:1）',
      red: failsOf({ button: base.button.replace('linear-gradient(90deg, #ef8531 0%, #f2a03a 100%)', 'linear-gradient(90deg, #ef8531 0%, #f8ca47 100%)') }) > 0,
    },
    {
      name: '「去完成」那枚没传 theme（一半琥珀一半全站蓝）',
      red: failsOf({ taskList: base.taskList.replace('<tz-button size="mini" type="primary" theme="score" :text="actionText(task)"', '<tz-button size="mini" :text="actionText(task)"') }) > 0,
    },
    {
      name: '`+N 积分` 退回平台主色蓝',
      red: failsOf({ taskList: base.taskList.replace(/color: #AA530D;\s*\n\}\s*\n\s*\.task-sub/, 'color: #0968f6;\n}\n\n.task-sub') }) > 0,
    },
    {
      name: '「已完成」退回全站冷灰',
      red: failsOf({ taskList: base.taskList.replace(/(\.task-done\s*\{[\s\S]*?)color: #AA530D;/, '$1color: #86909c;') }) > 0,
    },
    {
      name: '小字抄渐变本体（12px 压白底只有 2.1–2.6:1）',
      red: failsOf({ taskList: base.taskList.replace(/(\.task-score\s*\{[\s\S]*?)color: #AA530D;/, '$1color: #F2A03A;') }) > 0,
    },
    {
      name: '页面里另写一份任务行样式（第二处实现）',
      red: failsOf({ home: base.home + '\n<style scoped>\n.task-score { color: #AA530D; }\n</style>\n' }) > 0,
    },
  ];

  let failed = 0;
  console.log('\n自检（每个坏样件都必须报红）');
  for (const c of cases) {
    if (c.red) { console.log('  [ok]   ' + c.name + ' -> 判据红了'); }
    else { failed++; console.log('  [FAIL] ' + c.name + ' -> 判据没红（这类回归门禁看不见）'); }
  }
  console.log('\n自检结果：[FAIL]=' + failed);
  return failed;
}

if (process.argv.includes('--selftest')) {
  process.exit(selftest() ? 1 : 0);
}

process.exit(report(runAll(), '积分任务行的模块主题色（按钮底色 / +N 积分 / 已完成）') ? 1 : 0);
