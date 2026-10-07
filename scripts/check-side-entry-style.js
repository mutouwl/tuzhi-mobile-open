/**
 * 直播间右侧悬浮栏（红包 / 分享有礼 / 邀请达人榜 / 消息）的层号与几何 —— 不构建、不开浏览器
 *
 * 为什么单拉一个脚本：这一族的缺陷有三种，`sfc-check`（只编译模板）与 `ui-audit`（只按正则查版式）
 * 一条都看不见：
 *  ① **拼出来的声明非法**：posStyle 把 top 拼成字符串，`'top: calc(' + top + (offset > 0 ? '+' : '-') + n + 'px)'`
 *     会产出 `calc(38% +76px)` —— CSS 语法要求 calc() 的运算符两侧各留一个空格，紧凑写法整条
 *     top 被判非法丢掉，元素落回静态位置（absolute 场景 = 容器右上角），症状是「邀请达人榜和消息按钮
 *     全部跑在页面的右上角了」（2026-09-30 用户点名）。**源码上完全看不出问题**，正则也拼不出运行时
 *     的那一档 ⇒ 只有把真实的 posStyle 拿出来跑一遍才知道。这一条已栽过一次，第二轮「加间距」时顺手
 *     改坏了，第三轮才发现。
 *  ② **层号发号自相矛盾**：常驻几枚要连续、缺席即补位，消息那一枚不参与发号。
 *  ③ **步进 = 入口自身高**（间距归零，两枚贴死）。
 *
 * 钉五件事：
 *  A. 每一档产出的 `top` 都是**合法 CSS 声明**（运算符两侧各有空格），且 level 0 就是裸 `top: 38%`；
 *  B. 位移量 = |level| × ENTRY_STEP，**符号方向 = 自上而下**（正数往下让 ⇒ `+`，负数往上 ⇒ `-`），
 *     逐层单调（层号越大顶边越靠下）；
 *  C. ENTRY_STEP 严格大于 ENTRY_HEIGHT（间距不为零），且 = 两者之和（不许调用点各抄一个数）；
 *  D. 页面 sideEntryLevels 的发号矩阵（16 态）：显示着的常驻几枚层号恰好 0..n-1、**消息恒为「常驻
 *     显示着的枚数」**（= 最下那枚之下一格）、**常驻几枚的层号在消息出没前后逐字相同**（这一句是
 *     2026-09-30「原有的两个按钮都往上跑了」那条要求的正面表述，必须机器验，人眼比不出 16 态）；
 *  E. 常驻那几枚的**先后顺序**（页面 order 数组）＝ 红包 → 分享有礼 → 达人榜，且 base 依次 0/1/2 ——
 *     矩阵用的是本脚本自己的 RESIDENT 名单，order 被人调了序它照样跑绿，所以顺序必须单独从源码里读。
 *     这一条对应 2026-09-30 用户点名「按现在红包的位置作为顶部，后面如果有新增按钮，按照红包的位置
 *     依次往下排列」：**红包必须是 order 里第一项（最上那枚），新增入口只许追加在末尾**。
 *
 * 用法：node tuzi-mobile/scripts/check-side-entry-style.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENTRY_FILE = path.join(ROOT, 'src/components/tz/live-side-entry.vue');
const PAGE_FILE = path.join(ROOT, 'src/pages/course/live/js.vue');
const ANCHOR = '38%'; // 组件 props.top 的默认档（页面没量到讨论区时吃的就是它）
// 2026-10-05 起页面改传「讨论区垂直中心线 + 常驻枚数」，整栏按中心线居中（用户点名：
// 「y 轴下移到讨论区高度垂直居中的位置」）。CENTER 是下面 G 组假定的中心线，G 组按它验居中公式。
const CENTER = 615;

let fail = 0;
const bad = (msg) => {
  console.log('[FAIL] ' + msg);
  fail++;
};
const ok = (msg) => console.log('[OK] ' + msg);

/** 抠出 <script> 段 */
function scriptOf(file) {
  const src = fs.readFileSync(file, 'utf8');
  const m = src.match(/<script[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(file + ' 里没有 <script>');
  return { src, code: m[1] };
}

/** 组件 options：把 export default 换成 return，在函数体里求值（避开 ESM / 构建） */
function loadEntryComponent() {
  const { src, code } = scriptOf(ENTRY_FILE);
  const body = code.replace(/export\s+default\s*/, 'return ');
  // eslint-disable-next-line no-new-func
  return { options: new Function(body)(), src };
}

/** 页面 computed 里单个方法的方法体（按大括号配平抠） */
function methodBody(code, name) {
  const at = code.indexOf(name + '()');
  if (at < 0) throw new Error('页面里找不到 ' + name + '()');
  const open = code.indexOf('{', at + name.length + 2);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (!depth) return code.slice(open + 1, i);
    }
  }
  throw new Error(name + '() 的大括号没配平');
}

// ── A / B：逐层验 posStyle 的真实产物 ────────────────────────────────────────
// ENTRY_HEIGHT 读出来供 F 节用（圆底两处的宽高必须 = 它，否则三处各写一个数就是第二套几何）
let ENTRY_HEIGHT_READ = 0;
const { options, src } = loadEntryComponent();
const posStyle = options.computed && options.computed.posStyle;
if (typeof posStyle !== 'function') {
  bad('组件里取不到 computed.posStyle，几何已改口径或方法被改名');
} else {
  // C：步进与间距从源码常量里读，而不是在脚本里抄一遍（抄一遍就变成第二套数字）。
  //    ENTRY_STEP 本身是 ENTRY_HEIGHT + ENTRY_GAP 这样的表达式，所以连同依赖一起抠出来求值。
  const decls = {};
  src.replace(/const\s+(ENTRY_[A-Z_]+)\s*=\s*([^;]+);/g, (m, name, expr) => {
    decls[name] = expr;
  });
  const names = Object.keys(decls);
  const pair = names
    .map((n) => n + ': (typeof ' + n + ' === "undefined" ? NaN : ' + n + ')')
    .join(', ');
  // eslint-disable-next-line no-new-func
  const consts = names.length
    ? new Function(names.map((n) => 'const ' + n + ' = ' + decls[n] + ';').join('\n') + '\nreturn {' + pair + '};')()
    : {};
  const height = consts.ENTRY_HEIGHT;
  const gap = consts.ENTRY_GAP;
  const step = consts.ENTRY_STEP;
  ENTRY_HEIGHT_READ = height;
  if (!(height > 0) || !(gap > 0) || !(step > 0)) {
    bad('ENTRY_HEIGHT / ENTRY_GAP / ENTRY_STEP 三个常量读不出来或非正数：' + [height, gap, step].join(' / '));
  } else {
    if (step <= height) bad('步进 ' + step + ' 不大于入口自身高 ' + height + ' ⇒ 相邻两枚贴死，没有间距');
    if (step !== height + gap) bad('ENTRY_STEP(' + step + ') 不等于 ENTRY_HEIGHT + ENTRY_GAP(' + height + '+' + gap + ')');
    else ok('步进 = 自身高 + 间距 = ' + step + '（高 ' + height + '、间距 ' + gap + '）');
  }

  /** 一条 top 声明合不合法：值要么是长度/百分比，要么是 calc(…)，且 calc 里每个运算符两侧各有空格 */
  function topDeclOk(decl) {
    const m = /^top:\s*([^;]+)$/.exec(decl);
    if (!m) return '不是一条 top 声明：' + JSON.stringify(decl);
    const v = m[1].trim();
    if (/^calc\(/.test(v)) {
      for (let i = 0; i < v.length; i++) {
        const c = v[i];
        if (c !== '+' && c !== '-') continue;
        if (i === 5 || v[i - 1] === '(' || v[i - 1] === ',') continue; // 正负号
        if (!/\s/.test(v[i - 1]) || !/\s/.test(v[i + 1] || '')) {
          return 'calc() 运算符「' + c + '」缺一侧空格，整条声明会被判非法丢掉（' + JSON.stringify(v) + '）';
        }
      }
      if (!/^calc\([^()]*\)$/.test(v)) return 'calc() 括号不配平或含嵌套：' + JSON.stringify(v);
      return '';
    }
    if (/^-?[\d.]+(%|px)$/.test(v)) return '';
    return 'top 的值不是长度/百分比也不是 calc()：' + JSON.stringify(v);
  }

  const offsets = {};
  [-2, -1, 0, 1, 2, 3].forEach((level) => {
    const decl = posStyle.call({ top: ANCHOR, level });
    const why = topDeclOk(decl);
    if (why) {
      bad('level ' + level + ' → ' + JSON.stringify(decl) + '：' + why);
      return;
    }
    if (level === 0) {
      if (decl !== 'top: ' + ANCHOR) bad('level 0 应当就是裸锚点 top: ' + ANCHOR + '，实得 ' + JSON.stringify(decl));
      offsets[level] = 0;
      return;
    }
    // 期望形态：top: calc(38% + 52.5px) / calc(38% - 52.5px)
    // ⚠️ 位移允许小数：2026-10-04 用户点名「再增大1/4」，圆底 34 → 42.5 ⇒ 步进 52.5，
    // 正则里写死 \d+ 会把这一档合法的步进判成"形态不对"（= 门禁自己过期，逼着代码退回整数档）。
    // 这里只放宽**取值形态**，下面 |level| × ENTRY_STEP 的比对一分不减。
    const m = /^top: calc\((\S+) ([+-]) ([\d.]+)px\)$/.exec(decl);
    if (!m) {
      bad('level ' + level + ' 的形态不对（应是 top: calc(锚点 ± Npx)，运算符两侧各一个空格）：' + JSON.stringify(decl));
      return;
    }
    const [, anchor, op, px] = m;
    if (anchor !== ANCHOR) bad('level ' + level + ' 的锚点被写死成 ' + anchor + '，应当跟着 top 走：' + JSON.stringify(decl));
    if (Number(px) !== Math.abs(level) * step) {
      bad('level ' + level + ' 位移 ' + px + 'px ≠ |level| × ENTRY_STEP = ' + Math.abs(level) * step + 'px');
    }
    const sign = op === '+' ? 1 : -1; // 往下让 = 顶边顺着往下走 = +
    if (sign !== Math.sign(level)) bad('level ' + level + ' 的符号方向反了（正数往下、负数往上）：' + JSON.stringify(decl));
    // 以锚点为原点，顶边偏移量（正数 = 更靠下）
    offsets[level] = op === '+' ? Number(px) : -Number(px);
  });

  const levels = Object.keys(offsets).map(Number).sort((a, b) => a - b);
  for (let i = 1; i < levels.length; i++) {
    // 层号越大越靠下 ⇒ 顶边偏移（以锚点为原点、向下为正）必须逐层变大
    if (!(offsets[levels[i]] > offsets[levels[i - 1]])) {
      bad('层号 ' + levels[i] + ' 的顶边没有比 ' + levels[i - 1] + ' 更靠下（顶边偏移 ' + offsets[levels[i]] + ' vs ' + offsets[levels[i - 1]] + '），这一栏不是自上而下排开的');
    }
  }
  if (offsets[0] === 0 && offsets[1] > 0 && offsets[-1] < 0) {
    ok('逐层几何自洽：' + levels.map((l) => l + '→' + offsets[l] + 'px').join('  '));
  }

  // ── G：整栏按讨论区中心线居中（2026-10-05 用户点名新增的一档锚点）──────────────
  // 原先那一栏锚在写死的 `top: 38%` 上，而讨论区固定占底部 1/3 ⇒ 整栏浮在讨论区上方一大截的空画面里。
  // 改成页面实测讨论区垂直中心线（centerY）传进来、组件按「整栏居中」算最上那枚的顶边。四条钉死：
  // ① 居中公式 = 中心线 − (枚数 × 自身高 + (枚数 − 1) × 间距) / 2，尺寸只取组件那一份常量；
  // ② 层号仍按 |level| × 步进往下叠（居中只动基准线，不许把步进也改了）；
  // ③ **晚到的「消息」入口不参与居中**（stackCount 只给常驻那几枚）：它一参与，
  //    用户关掉那张提示卡的瞬间整根栏就要上移半格 —— 2026-09-30 被点名四轮的那一类；
  // ④ centerY 没给（首帧还没量到）时退回 props.top 那一档，不许出现 top: undefined。
  const centerOf = (n) => CENTER - (n * height + (n - 1) * gap) / 2;
  const gBefore = fail;
  [[1, 0], [2, 1], [3, 2]].forEach(([n, level]) => {
    const decl = posStyle.call({ top: ANCHOR, level, centerY: CENTER, stackCount: n });
    const want = centerOf(n);
    if (level === 0) {
      if (decl !== 'top: ' + want + 'px') {
        bad('centerY=' + CENTER + '、stackCount=' + n + '、level 0 应当是「整栏顶边 = 中心线 − 栏高/2」= top: ' + want + 'px，实得 ' + JSON.stringify(decl));
      }
    } else {
      const wantDecl = 'top: calc(' + want + 'px + ' + level * step + 'px)';
      if (decl !== wantDecl) {
        bad('常驻 ' + n + ' 枚那一栏 level ' + level + ' 应为 ' + JSON.stringify(wantDecl) + '（顶边仍按中心线居中，再按步进往下叠），实得 ' + JSON.stringify(decl));
      }
    }
    const why = topDeclOk(decl);
    if (why) bad('centerY 那一档 level ' + level + ' → ' + JSON.stringify(decl) + '：' + why);
  });
  // 整栏必须真的被摆成「居中」：最上那枚顶边 + 栏高/2 恰好落在中心线上
  [1, 2, 3].forEach((n) => {
    const top = centerOf(n);
    const stackH = n * height + (n - 1) * gap;
    if (Math.abs(top + stackH / 2 - CENTER) > 1e-6) {
      bad('常驻 ' + n + ' 枚时整栏没有居中（顶边 ' + top + ' + 栏高一半 ' + stackH / 2 + ' ≠ 中心线 ' + CENTER + '）');
    }
  });
  // 晚到的那一枚进出**不许**改变常驻几枚的顶边：stackCount 相同 ⇒ 声明逐字相同
  [1, 2, 3].forEach((n) => {
    const a = posStyle.call({ top: ANCHOR, level: 0, centerY: CENTER, stackCount: n });
    const b = posStyle.call({ top: ANCHOR, level: n, centerY: CENTER, stackCount: n }); // n = 消息那枚的层号
    const wantB = 'top: calc(' + centerOf(n) + 'px + ' + n * step + 'px)';
    if (b !== wantB) {
      bad('晚到的消息入口（level ' + n + '、不计入 stackCount）落点不对：' + JSON.stringify(b) + '，应为 ' + JSON.stringify(wantB));
    }
    if (a !== posStyle.call({ top: ANCHOR, level: 0, centerY: CENTER, stackCount: n })) {
      bad('晚到的那一枚进出牵动了常驻几枚的顶边（' + JSON.stringify(a) + '）');
    }
  });
  // centerY = 0（还没量到）必须退回 top 那一档，不许算出 NaN / undefined
  [[0, 0], [0, 2]].forEach(([cy, level]) => {
    const decl = posStyle.call({ top: ANCHOR, level, centerY: cy, stackCount: 3 });
    const okDecl = level === 0 ? 'top: ' + ANCHOR : 'top: calc(' + ANCHOR + ' + ' + level * step + 'px)';
    if (decl !== okDecl) {
      bad('centerY 未量到（0）时应退回 top: ' + ANCHOR + ' 那一档，level ' + level + ' 实得 ' + JSON.stringify(decl));
    }
  });
  if (fail === gBefore) {
    ok('整栏居中：顶边 = 讨论区中心线 ' + CENTER + ' − 栏高/2（' + [1, 2, 3].map((n) => n + ' 枚→' + centerOf(n) + 'px').join('  ') + '），步进仍 = 自身高 + 间距；晚到的消息入口不计入 stackCount（不牵动常驻几枚）；未量到时退回 ' + ANCHOR + ' 兜底档');
  }
}

// ── D：页面 sideEntryLevels 的 16 态发号矩阵 ─────────────────────────────────
let levels;
let pageBody = '';
try {
  const { code } = scriptOf(PAGE_FILE);
  const body = methodBody(code, 'sideEntryLevels');
  pageBody = body;
  // eslint-disable-next-line no-new-func
  levels = new Function('return function () {' + body + '};')();
} catch (e) {
  bad('抠不出页面 sideEntryLevels：' + e.message);
}

// ── E：常驻那几枚的先后顺序（从源码的 order 数组里读，矩阵用的是本脚本自己的名单，覆盖不到这一条） ──
const RESIDENT = ['redpacket', 'shareGift', 'inviteRank']; // 自上而下：红包 → 分享有礼 → 达人榜
try {
  const at = pageBody.indexOf('const order = [');
  if (at < 0) throw new Error('sideEntryLevels 里没有 order 数组');
  const open = pageBody.indexOf('[', at);
  let depth = 0;
  let close = -1;
  for (let i = open; i < pageBody.length; i++) {
    if (pageBody[i] === '[') depth++;
    else if (pageBody[i] === ']') {
      depth--;
      if (!depth) { close = i; break; }
    }
  }
  if (close < 0) throw new Error('order 数组的方括号没配平');
  const items = pageBody.slice(open, close + 1).match(/\{[^}]*\}/g) || [];
  const got = items.map((it) => ({
    key: (/\bkey:\s*'(\w+)'/.exec(it) || [])[1],
    base: (/\bbase:\s*(-?\d+)/.exec(it) || [])[1],
  }));
  const eBefore = fail;
  if (got.length !== RESIDENT.length) {
    bad('order 数组里有 ' + got.length + ' 项，应为 ' + RESIDENT.length + ' 项（' + RESIDENT.join(' / ') + '）');
  } else {
    got.forEach((it, i) => {
      if (it.key !== RESIDENT[i]) {
        bad('order 第 ' + i + ' 项是 ' + it.key + '，按「红包作顶部、依次往下」应是 ' + RESIDENT[i] + '（新增入口只许追加在末尾）');
      }
      if (Number(it.base) !== i) {
        bad(it.key + ' 的 base 是 ' + it.base + '，按「三枚全在」时的排布应是 ' + i + '（兜底层号就是这一条排布）');
      }
    });
    if (fail === eBefore) {
      ok('常驻排布自上而下 ' + RESIDENT.join(' → ') + '，base 依次 0/1/2（红包是这一栏的顶部锚点）');
    }
  }
} catch (e) {
  bad('读不出页面 order 数组（常驻几枚的先后顺序）：' + e.message);
}

if (typeof levels === 'function') {
  const onOf = (mask) => ({
    redpacketEntryOn: !!(mask & 1),
    shareGiftEntryOn: !!(mask & 2),
    inviteRankEntryOn: !!(mask & 4),
    linkBarEntryVisible: !!(mask & 8),
  });
  const before = fail;
  let rows = 0;
  for (let mask = 0; mask < 16; mask++) {
    const state = onOf(mask);
    const out = levels.call(state);
    rows++;
    const shownKeys = RESIDENT.filter((k) => out[k] !== undefined && state[k + 'EntryOn']);
    // ① 显示着的常驻几枚：层号恰好是 0..n-1（连续、缺席即补位、中间不留空洞）
    shownKeys.forEach((k, i) => {
      if (out[k] !== i) {
        bad('mask ' + mask + '：显示着的 ' + k + ' 拿到 level ' + out[k] + '，按自上而下连续编号应是 ' + i);
      }
    });
    // ② 显示着却没发号 = 空洞；显示着两枚拿到同一个号 = 叠在一起
    const used = shownKeys.map((k) => out[k]);
    if (new Set(used).size !== used.length) bad('mask ' + mask + '：两枚常驻拿到同一个层号 ' + used.join(','));
    // ③ 消息那一枚：不参与发号，层号 = 常驻显示着的枚数（正落在最下那枚之下，一格不多不少；
    //    一枚常驻都没有时就是 0 = 占住锚点本身）
    //    （不显示的那一态由页面 v-if 收掉，取什么值都不影响画面，不参与断言）
    if (state.linkBarEntryVisible) {
      const want = shownKeys.length;
      if (out.linkBar !== want) {
        bad('mask ' + mask + '：消息拿到 level ' + out.linkBar + '，常驻有 ' + shownKeys.length + ' 枚时应为 ' + want + '（= 常驻显示着的枚数，正好在最下那枚之下）');
      }
    }
    // ④ 晚到的那一枚出没，常驻几枚的层号必须逐字相同（这是「不许牵动已显示着的几枚」的正面表述）
    const without = levels.call(onOf(mask & ~8));
    shownKeys.forEach((k) => {
      if (out[k] !== without[k]) {
        bad('mask ' + mask + '：消息出现后 ' + k + ' 的层号从 ' + without[k] + ' 变成了 ' + out[k] + '（常驻几枚一枚都不许动）');
      }
    });
  }
  if (rows !== 16) bad('发号矩阵只跑了 ' + rows + ' 态（应为 2^4 = 16），矩阵本身失效');
  else if (fail === before) ok('发号矩阵 16 态全部通过（常驻连续 0..n-1 / 消息恒 = 常驻枚数 / 常驻层号不受消息出没影响）');
}

// ── F：横向对齐与「纯图标」形态（容器宽度锁死 + 不渲染文字）──
// 2026-10-01 用户连续点名两轮：先「因为分享排行榜比消息多了三个字，所以这个分享排行榜的按钮更靠左一点」
// （绝对定位的容器默认按内容收缩，文字越长越宽，圆底又是居中摆的 ⇒ 文字多的那枚圆底被推向左），
// 后「可以去掉文字，只显示icon」。正则门禁看不见这类「跨兄弟节点的宽度差」，本脚本钉死三条：
// ① 容器写死宽度且 = 圆底直径（横向几何由常量决定，不由内容长度决定）；② 模板里没有 `<text>` 节点；
// ③ 也没有留下一个没人渲染的 `text` prop（留着会被下一轮当成"还支持文字"重新用起来）。
// ④ 2026-10-04 起再加一条：圆底两处的宽高必须 = `ENTRY_HEIGHT` 那一份常量——
//    组件里一共三处尺寸（ENTRY_HEIGHT、`.tz-side-entry__btn` 宽高、`.tz-side-entry__icon` 宽高），
//    只改其中一处（例如只把 CSS 里的 42.5 写成 40）画面上是"圆底与图标对不上"，
//    正则 pattern 与人眼都看不出来，而它同时决定了叠放步进（ENTRY_STEP = ENTRY_HEIGHT + ENTRY_GAP）。
// ⑤ 2026-10-04 用户点名把分享有礼 / 邀请达人榜两枚换成新版图标后，这一栏短暂有过两种素材：
//    `tz-live-side-entry__icon` = 透明底字形图（内缩 20.25 躺在黑 35% 圆底里）、
//    `.tz-side-entry__icon--badge` = 自带一整枚深色圆底的整底图（铺满 38.25），两者不许互抄。
//    **2026-10-05 用户第二次点名换素材后，两枚都换回透明底字形图（橙色奖杯 / 礼盒），
//    badge 那一档连同 prop 已删干净 ⇒ 这一栏 PNG 只有字形图一型**。
//    这一段刻意留着 `badgeRule === null` 分支而不是整段删掉：将来真再拿到自带圆底的素材，
//    把 prop 与那一档加回来的同时，这段断言就是钉它"宽高 = 圆底直径"的那一条。
//    另：素材本身必须自带透明底或自带那一圈底，**不带不透明白底**——2026-10-05 那张奖杯原文件是
//    纯白方底，正则与人眼在贴进页面之前都看不见，只能在装进 src 之前处理掉（已抠成透明）。
try {
  const style = (/<style[^>]*>([\s\S]*?)<\/style>/.exec(src) || [])[1] || '';
  const ruleBody = (sel) => {
    const esc = sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const m = new RegExp('(?<![\\w-])' + esc + '\\s*\\{([^}]*)\\}').exec(style);
    return m ? m[1] : null;
  };
  const wrap = ruleBody('.tz-side-entry');
  const btn = ruleBody('.tz-side-entry__btn');
  const icon = ruleBody('.tz-side-entry__icon');
  // 那一档必须单独一条规则取：`ruleBody('.tz-side-entry__icon')` 的正则要求 `__icon` 后面紧跟 `{`，
  // 所以 `--badge` 那一档不会被误当成字形图那一档读出来（两者尺寸不同、互为对照）
  const badgeRule = ruleBody('.tz-side-entry__icon--badge');
  const tmpl = (/<template>([\s\S]*?)<\/template>/.exec(src) || [])[1] || '';
  const before = fail;
  if (wrap === null) bad('样式里取不到 .tz-side-entry 这一条规则（横向对齐无从核对）');
  if (btn === null) bad('样式里取不到 .tz-side-entry__btn 这一条规则');
  if (wrap !== null && btn !== null) {
    const wm = /width:\s*([\d.]+)px/.exec(wrap);
    const dm = /width:\s*([\d.]+)px/.exec(btn);
    const hbm = /height:\s*([\d.]+)px/.exec(btn);
    if (!wm) {
      bad('.tz-side-entry 没有写死 width（绝对定位按内容收缩 ⇒ 内容长的一枚整枚被推偏，整栏不在一条竖线上）');
    } else if (!dm) {
      bad('.tz-side-entry__btn 没有写死 width');
    } else if (parseFloat(wm[1]) !== parseFloat(dm[1])) {
      bad('.tz-side-entry 容器宽 ' + wm[1] + 'px ≠ 圆底直径 ' + dm[1] + 'px（这一栏是纯图标形态，两者必须同宽，否则圆底在容器里偏移）');
    }
    // ④ 圆底自身必须是正圆（宽 = 高），且等于 ENTRY_HEIGHT —— 步进就靠它
    if (!hbm) {
      bad('.tz-side-entry__btn 没有写死 height');
    } else if (parseFloat(dm[1]) !== parseFloat(hbm[1])) {
      bad('圆底宽 ' + dm[1] + 'px ≠ 高 ' + hbm[1] + 'px（这一枚是圆形入口，border-radius: 50% 下宽高不等就是椭圆）');
    }
    if (ENTRY_HEIGHT_READ > 0 && dm && parseFloat(dm[1]) !== ENTRY_HEIGHT_READ) {
      bad('圆底直径 ' + dm[1] + 'px ≠ ENTRY_HEIGHT ' + ENTRY_HEIGHT_READ + '（尺寸散成两份：改一处不会同步到叠放步进，相邻两枚要么贴死要么留一大截）');
    }
    // 圆底里的图标必须小于圆底，否则会被裁/顶到边
    if (icon !== null && dm) {
      const im = /width:\s*([\d.]+)px/.exec(icon);
      if (im && parseFloat(im[1]) >= parseFloat(dm[1])) {
        bad('图标 ' + im[1] + 'px 不小于圆底 ' + dm[1] + 'px（图标应比圆底小一圈）');
      }
    }
    // ⑤ 2026-10-04 用户点名换上新版图标后这一栏有两种素材：`tz-live-side-entry__icon` 是「透明底字形图」
    //    （内缩 20.25 躺在黑 35% 圆底里），`.tz-side-entry__icon--badge` 是「自带一整枚深色圆底的整底图」
    //    （它自己的圆底就是入口的圆底，必须铺满 38.25）。这两种尺寸不许互抄：
    //    badge 档内缩 ⇒ 读成「一枚小图标浮在大半透明黑圆里」；badge 档放大 ⇒ 图出圆。
    if (badgeRule !== null) {
      const bm = /width:\s*([\d.]+)px/.exec(badgeRule);
      const bh = /height:\s*([\d.]+)px/.exec(badgeRule);
      if (!bm || !bh) {
        bad('.tz-side-entry__icon--badge 没有写死 width/height');
      } else if (dm && (parseFloat(bm[1]) !== parseFloat(dm[1]) || parseFloat(bh[1]) !== parseFloat(dm[1]))) {
        bad('自带圆底那一档 ' + bm[1] + '×' + bh[1] + 'px ≠ 圆底直径 ' + dm[1] + 'px（这张图自己的深色圆底就是入口的圆底，必须铺满；内缩会读成「小图标浮在黑圆里」）');
      } else if (icon !== null && parseFloat(bm[1]) <= parseFloat(/width:\s*([\d.]+)px/.exec(icon)[1])) {
        bad('自带圆底那一档（' + bm[1] + 'px）反而不大于字形图那一档（两型的关系反了）');
      }
      if (!/badge:\s*\{\s*type:\s*Boolean/.test(src)) {
        bad('样式里有 --badge 那一档，但 props 里没有 badge（模板绑不到它，这一档等于没接上）');
      }
      if (!/tz-side-entry__icon--badge/.test(tmpl)) {
        bad('模板里没有把 badge prop 绑到图标那一条上（CSS 档位存在、渲染时永远走不到）');
      }
    }
  }
  if (/<text[\s>]/.test(tmpl)) {
    bad('模板里仍有 <text> 节点（本栏 2026-10-01 由用户点名只留图标；文字长短不一正是「圆底被推歪」那条的根因）');
  }
  if (/\btext:\s*\{\s*type:\s*String/.test(src)) {
    bad('组件里仍留着 text prop，但模板已经不渲染它（留一个没人用的 prop，下一轮会被当成"还支持文字"重新用起来）');
  }
  // 调用点也不许再传 text：删干净了才是删干净
  const files = [];
  (function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
      const p = path.join(dir, d.name);
      if (d.isDirectory()) {
        if (d.name !== 'node_modules' && d.name !== 'unpackage') walk(p);
      } else if (d.name.endsWith('.vue')) {
        files.push(p);
      }
    });
  })(path.join(ROOT, 'src'));
  let used = 0;
  let leftover = [];
  const badgeDead = [];
  const badgePropExists = /badge:\s*\{\s*type:\s*Boolean/.test(src);
  files.forEach((f) => {
    const s = fs.readFileSync(f, 'utf8');
    (s.match(/<tz-live-side-entry[\s\S]*?>/g) || []).forEach((tag) => {
      used++;
      if (/\btext="/.test(tag)) leftover.push(path.relative(ROOT, f));
      // badge 是「这张 PNG 自带一整枚圆底」那一档尺寸的开关（2026-10-05 已随那版素材删掉 prop 与 CSS）。
      // 若 prop 还在，就只查它有没有被误配到 iconName（iconfont）那一支上；
      // prop 已经删掉还传 = 纯死配置，下一轮会被当成"这一栏还支持整底图"重新用起来
      if (/\bbadge\b/.test(tag)) {
        if (!badgePropExists) badgeDead.push(path.relative(ROOT, f));
        else if (/\bicon-name=/.test(tag)) badgeDead.push(path.relative(ROOT, f));
      }
    });
  });
  if (used === 0) {
    bad('全站没扫到任何 <tz-live-side-entry> 调用点（标签名改了或调用点被挪走，这一族门禁已失效）');
  } else if (leftover.length) {
    bad('调用点还在传 text="…"：' + leftover.join('、') + '（组件已不渲染文字，传了也没用，只会把死配置留在源码里）');
  } else if (badgeDead.length) {
    bad(badgePropExists
      ? '调用点把 badge 配到了 icon-name 那一支上：' + badgeDead.join('、') + '（badge 只作用于 PNG 那一支，iconfont 那一支不吃它）'
      : '调用点还在传 badge：' + badgeDead.join('、') + '（组件已没有这个 prop，传了不生效，只会把死配置留在源码里）');
  }
  if (fail === before) {
    ok('横向对齐：容器宽 = 圆底直径写死、内容不参与决定宽度 ⇒ 整栏圆底同一条竖线；纯图标形态（无 <text>、无 text prop、调用点无 text）；' +
      (badgeRule === null
        // 说明白这一档为什么是"只有一档"，免得下一个读到这里以为断言漏了半截：
        // 带底图那一档在 2026-10-04~10-05 短暂存在过，素材换回透明底字形图后连同 prop 一起删了。
        ? '图标只有字形图一档（透明底 PNG 20.25 内缩在黑 35% 圆底里，与同栏红包同一型）——自带圆底的整底图那一档 2026-10-05 已随那版素材撤掉；若将来真再拿到带底素材，把这一档连同上面那段尺寸钉死一起加回来'
        : '图标两型（字形图内缩 / 自带圆底的整底图铺满圆底）都已核：'));
  }
} catch (e) {
  bad('核不出横向对齐 / 纯图标形态：' + e.message);
}

console.log(fail ? '[FAIL] 合计 ' + fail + ' 条' : '[OK] 右侧悬浮栏层号与几何通过');
process.exit(fail ? 1 : 0);