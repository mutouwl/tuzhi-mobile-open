/**
 * 直播间三个底部弹层「面板总高对齐」这一族的机器验法
 * （硬约束 26：一类界面偏离被点名时先补机器化验法；硬约束 11/28：一个几何常量只存一处、算式要实跑）
 *
 * 跑法：node tuzi-mobile/scripts/check-live-popup-height.js
 *
 * 背景（2026-10-02 第一次点名「分享有礼弹窗可与邀请达人榜弹窗等高」→ 第一次那版把
 * `calc(60vh + 141px)` 写成了 `calc(60vh - 141px)`，方向整个反了，面板比达人榜**矮 141px**；
 * 2026-10-06 第二次点名「分享有礼的弹窗高度，包括分享有礼的详情，可以跟这个邀请达人榜弹窗高度对齐」）：
 * 这一族只有三个 tz-popup-list 标签上的 height，别的门禁一条都管不着——
 *   ① `sfc-check` 只编译模板，`:height="listHeight"` 绑的东西对不对它不看；
 *   ② `ui-audit` 的 `calc-operator-no-space` 只看得见**手写**的字面量，JS 拼出来的那一串静态正则永远看不见
 *      （同 check-side-entry-style.js 第一节那一族：拼出来 `calc(60vh +90px)` 会整条作废、退回 60vh，
 *        症状是「怎么高度没生效」）；
 *   ③ 「两个面板总高相等」是**跨文件**的几何关系，正则判不出，必须把三只弹层各自的 chrome
 *      （标题行 / 列表下方的固定条 / 按数据有无才出的行）实算一遍再比。
 *
 * 钉六件事：
 *   A. 逐档数值与**各文件里的真实 CSS 一致**（内衬/外距/行盒逐条读出来重算，不许常量与样式各说各话）：
 *      标题行 49 / 我的排名条 76 / 达人榜底栏 65 / 详情头 37 / 详情条件说明 33 / 详情底栏 63 / 按钮 37；
 *   B. 达人榜（参照页）面板总高 = 分享有礼列表面板总高 = 分享有礼详情三档面板总高，**逐帧相等**；
 *   C. 算式是**加不是减**：没有哪一档写成 `calc(60vh - …)`；
 *   D. 模块拼出来的每一串都是**合法 CSS 声明**（`+` 两侧各有空格，且结果为正）；
 *   E. 几何常量只在 @/common/utils/live-popup-height 一份，两个组件都不许再抄 `calc(60vh …)` 字面量；
 *   F. 三处 height 都是**确定高度**（M6：只写 min/max 会「下方空白还滑不动」），且参照页仍是 60vh 定档。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const MOD_FILE = 'src/common/utils/live-popup-height.js';
const board = read('src/pages/course/live/invite-rank/board-list.vue');
const list = read('src/pages/course/live/share-gift/activity-list.vue');
const detail = read('src/pages/course/live/share-gift/activity-detail.vue');
const button = read('src/components/tz/button.vue');

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/* ---------- 工具 ---------- */
/** 注释先剥：这几份里大量档位注释会点名别的类名与旧数值，不剥会把注释当代码量 */
const styleIn = (src) => src.slice(src.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const blockOf = (src, cls) => {
  const css = styleIn(src);
  return (css.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0];
};
const decl = (block, prop) => {
  const m = new RegExp('(?:^|[;{\\s])' + prop + '\\s*:\\s*([^;{}]+)').exec(block);
  return m ? m[1].replace(/\s*!important$/, '').trim() : '';
};
const pxOf = (v) => {
  const s = String(v).trim();
  const m = /^(-?[\d.]+)px$/.exec(s);
  if (m) return Number(m[1]);
  if (/^0$/.test(s)) return 0;          // `padding: 15px 0 12px` 里那个 0 不带单位
  return NaN;
};
/** padding / margin 简写四边展开：[上 右 下 左]（两值 → 上下 / 左右；三值 → 上 左右 / 下） */
const sides = (v) => {
  const p = String(v).trim().split(/\s+/).map(pxOf);
  if (p.some(isNaN) || !p.length) return { top: NaN, bottom: NaN };
  if (p.length === 1) return { top: p[0], bottom: p[0] };
  if (p.length === 2) return { top: p[0], bottom: p[0] };
  if (p.length === 3) return { top: p[0], bottom: p[2] };
  return { top: p[0], bottom: p[2] };
};
/** 16px/600 那一档的行盒（无显式 line-height 时的全站口径，与详情 .sgd-title 显式写的 22 同档） */
const LINE_16 = 22;

/** 把 `calc(60vh + 141px)` / `60vh` 解析成「相对 60vh 的像素偏移」，取不到 vh 那一档就返回 NaN */
const offsetOf = (v) => {
  const s = String(v).trim();
  if (/^\d+vh$/.test(s)) return 0;
  const m = /^calc\(60vh\s+([+-])\s+(\d+)px\)$/.exec(s);
  return m ? (m[1] === '+' ? Number(m[2]) : -Number(m[2])) : NaN;
};

/**
 * 跑真实的常量模块：ESM 在 CJS 脚本里 require 不了，这里剥掉 export 关键字与注释后交给 new Function 求值。
 * **不把公式抄一份进脚本**——抄一份就等于多了个能漂移的真源，A/B/C/D 四组断言跑的必须是文件里那一份真代码。
 */
const modSrc = read(MOD_FILE).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/export /g, '');
const M = new Function(
  modSrc +
    '\nreturn { BTN_H, HEAD_H, RANK_ME_BAR_H, RANK_FOOT_H, RANK_BOTTOM_H, DETAIL_HEAD_H, DETAIL_SUB_H, DETAIL_FOOT_H, PANEL_TOTAL_H, RANK_LIST_H, SHARE_GIFT_LIST_H, detailListHeight };'
)();

/* ---------- A. 逐档数值与真实 CSS 一致 ---------- */
/** tz-button normal 档：上下内衬从 button.vue 读，字号从 .tuzi-btn 读，行盒按 line-height:normal ≈ 1.2em */
const btnCss = button.slice(button.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const btnNormal = (btnCss.match(/\.tuzi-btn\.size-normal\s*\{[^}]*\}/) || [''])[0];
const btnBase = (btnCss.match(/\.tuzi-btn\s*\{[^}]*\}/) || [''])[0];
const btnPad = sides(decl(btnNormal, 'padding'));
const btnFont = pxOf(decl(btnBase, 'font-size'));
const btnH = btnPad.top + btnPad.bottom + Math.round(btnFont * 1.2);
ok('tz-button normal 档那一枚的高度（内衬 10+10 + 14px 文字行盒）= 模块里的 BTN_H',
  btnH === M.BTN_H, `button.vue 实算 ${btnFont}px 字 + 内衬 ${btnPad.top}+${btnPad.bottom} ⇒ ${btnH}`);

const rankHead = sides(decl(blockOf(board, 'irb-head'), 'padding'));
const rankTitleFont = pxOf(decl(blockOf(board, 'irb-title'), 'font-size'));
const rankTitleWeight = decl(blockOf(board, 'irb-title'), 'font-weight');
const rankHeadH = rankHead.top + rankHead.bottom + LINE_16;
ok('达人榜标题行（.irb-head 上 15 + 下 12 + 16px/600 行盒）= 模块里的 HEAD_H',
  rankHeadH === M.HEAD_H && rankTitleFont === 16 && rankTitleWeight === '600',
  `board-list.vue 实算 ${rankHead.top}+${rankHead.bottom}+${LINE_16}（.irb-title ${rankTitleFont}px/${rankTitleWeight}）⇒ ${rankHeadH}`);
const sglTitle = sides(decl(blockOf(list, 'sgl-title'), 'padding'));
ok('分享有礼列表的标题行与达人榜逐值相同（同为 15/12 + 16px/600，两边面板才可能等高）',
  sglTitle.top === rankHead.top && sglTitle.bottom === rankHead.bottom &&
  pxOf(decl(blockOf(list, 'sgl-title'), 'font-size')) === 16 &&
  decl(blockOf(list, 'sgl-title'), 'font-weight') === '600',
  `.sgl-title padding ${decl(blockOf(list, 'sgl-title'), 'padding')} / font 16px/600`);

const meBar = blockOf(board, 'irb-me-bar');
const meBarPad = sides(decl(meBar, 'padding'));
const avatarH = pxOf(decl(blockOf(board, 'irb-me-avatar'), 'height'));
const rankMeBarH = pxOf(decl(meBar, 'margin-top')) + meBarPad.top + avatarH + meBarPad.bottom;
ok('达人榜「我的排名条」= 模块里的 RANK_ME_BAR_H（上距 + 上下内衬 + 头像）',
  rankMeBarH === M.RANK_ME_BAR_H, `board-list.vue 实算 ⇒ ${rankMeBarH}`);

const rankFootPad = sides(decl(blockOf(board, 'irb-foot'), 'padding-bottom'));
const rankFootH = pxOf(decl(blockOf(board, 'irb-foot'), 'margin-top')) + M.BTN_H + rankFootPad.bottom;
ok('达人榜底栏（上距 + 按钮 + 下内衬）= 模块里的 RANK_FOOT_H',
  rankFootH === M.RANK_FOOT_H, `board-list.vue 实算 ⇒ ${rankFootH}`);
ok('达人榜列表下方两段固定条 = RANK_ME_BAR_H + RANK_FOOT_H（就是那一档 141）',
  M.RANK_BOTTOM_H === M.RANK_ME_BAR_H + M.RANK_FOOT_H, `${M.RANK_ME_BAR_H} + ${M.RANK_FOOT_H} = ${M.RANK_BOTTOM_H}`);

const sgdHeadPad = sides(decl(blockOf(detail, 'sgd-head'), 'padding'));
const sgdTitleBox = pxOf(decl(blockOf(detail, 'sgd-title'), 'line-height'));
ok('详情标题行（上内衬 15 + .sgd-title 显式行盒）= 模块里的 DETAIL_HEAD_H',
  sgdHeadPad.top + sgdTitleBox === M.DETAIL_HEAD_H, `activity-detail.vue 实算 ${sgdHeadPad.top}+${sgdTitleBox} ⇒ ${sgdHeadPad.top + sgdTitleBox}`);
const skTitlePad = sides(decl(blockOf(detail, 'sgd-sk-title'), 'margin'));
ok('骨架那一档的头行与真实头行等高（16 + 上下外衬各 3 = 22），首帧到实数据不跳（M16/M18⑨d）',
  16 + skTitlePad.top + skTitlePad.bottom === sgdTitleBox, `骨架 ${16}+${skTitlePad.top}+${skTitlePad.bottom} = ${16 + skTitlePad.top + skTitlePad.bottom}`);

const sgdSubPad = sides(decl(blockOf(detail, 'sgd-sub'), 'padding-bottom'));
const sgdSubH = pxOf(decl(blockOf(detail, 'sgd-sub'), 'margin-top')) +
  pxOf(decl(blockOf(detail, 'sgd-sub'), 'line-height')) + sgdSubPad.bottom;
ok('详情那行「有才出」的条件说明 = 模块里的 DETAIL_SUB_H（上距 + 行盒 + 下内衬）',
  sgdSubH === M.DETAIL_SUB_H, `activity-detail.vue 实算 ⇒ ${sgdSubH}`);
const sgdFootPad = sides(decl(blockOf(detail, 'sgd-foot'), 'padding-bottom'));
const sgdFootH = pxOf(decl(blockOf(detail, 'sgd-foot'), 'margin-top')) + M.BTN_H + sgdFootPad.bottom;
ok('详情底栏（上距 + 同一枚按钮 + 下内衬）= 模块里的 DETAIL_FOOT_H',
  sgdFootH === M.DETAIL_FOOT_H, `activity-detail.vue 实算 ⇒ ${sgdFootH}`);

/* ---------- B. 三只弹层面板总高逐帧相等 ---------- */
const rankTotal = M.HEAD_H + offsetOf(M.RANK_LIST_H) + M.RANK_BOTTOM_H;
const listTotal = M.HEAD_H + offsetOf(M.SHARE_GIFT_LIST_H);
const detailTotal = (hasCondition, noFoot) =>
  M.DETAIL_HEAD_H + (hasCondition ? M.DETAIL_SUB_H : 0) + (noFoot ? 0 : M.DETAIL_FOOT_H) + offsetOf(M.detailListHeight(hasCondition, noFoot));
const D_NONE = detailTotal(false, false);   // 首帧骨架 / 接口没给 condition_text
const D_SUB = detailTotal(true, false);     // 有条件说明
const D_FAIL = detailTotal(false, true);    // 取失败那一档（底栏整块收掉）

ok('分享有礼活动列表面板总高 = 达人榜面板总高（第二次点名那条）',
  listTotal === rankTotal, `达人榜 ${M.HEAD_H} + 60vh + ${M.RANK_BOTTOM_H} = ${rankTotal}；分享有礼 ${M.HEAD_H} + ${M.SHARE_GIFT_LIST_H} = ${listTotal}`);
ok('分享有礼活动详情三档面板总高都 = 达人榜面板总高（骨架 / 有条件说明 / 无条件说明 / 取失败各算一遍）',
  D_NONE === rankTotal && D_SUB === rankTotal && D_FAIL === rankTotal,
  `无条件说明 ${D_NONE}、有条件说明 ${D_SUB}、取失败 ${D_FAIL}，达人榜 ${rankTotal}`);
ok('模块里的 PANEL_TOTAL_H 就是上面那个共同值（不是照抄出来的第四份）',
  M.PANEL_TOTAL_H === rankTotal, `PANEL_TOTAL_H ${M.PANEL_TOTAL_H} = ${M.PANEL_TOTAL_H}`);

/* ---------- C. 方向是加不是减（2026-10-02 那一版错就错在这一处） ---------- */
ok('列表区那一档是「把参照页下方那两段加进自己列表区」，不是把它们减掉（`calc(60vh - …)` 全族判零）',
  offsetOf(M.SHARE_GIFT_LIST_H) > 0 && !/60vh\s*-/.test(modSrc),
  `${M.SHARE_GIFT_LIST_H} ⇒ +${offsetOf(M.SHARE_GIFT_LIST_H)}`);
ok('详情三档的偏移量与「总高 − 自己 chrome」逐档吻合（90 / 57 / 153）',
  offsetOf(M.detailListHeight(false, false)) === M.PANEL_TOTAL_H - M.DETAIL_HEAD_H - M.DETAIL_FOOT_H &&
  offsetOf(M.detailListHeight(true, false)) === M.PANEL_TOTAL_H - M.DETAIL_HEAD_H - M.DETAIL_SUB_H - M.DETAIL_FOOT_H &&
  offsetOf(M.detailListHeight(false, true)) === M.PANEL_TOTAL_H - M.DETAIL_HEAD_H,
  `实跑 ⇒ ${M.detailListHeight(false, false)} / ${M.detailListHeight(true, false)} / ${M.detailListHeight(false, true)}`);

/* ---------- D. 拼出来的那一串是合法 CSS 声明（静态正则看不见这一半，硬约束 28 第 ③ 条） ---------- */
/** 只验真正绑到组件上的那几串（PANEL_TOTAL_H 只是给人看的算式，它是个像素数，不参与） */
const PRODUCED = [M.RANK_LIST_H, M.SHARE_GIFT_LIST_H, M.detailListHeight(false, false), M.detailListHeight(true, false), M.detailListHeight(false, true)];
ok('模块产出、绑到组件上的每一串都合法（calc 的 +/- 两侧各有空格，不是 `+90px` 那种紧凑写法）',
  PRODUCED.every((v) => !isNaN(offsetOf(v))) &&
  PRODUCED.filter((v) => /^calc/.test(v)).every((v) => /^calc\(\d+vh \S+ \d+px\)$/.test(v) && offsetOf(v) > 0) &&
  PRODUCED.filter((v) => /^\d+vh$/.test(v)).every((v) => offsetOf(v) === 0),
  PRODUCED.join('  '));
ok('拼出来的高度都落在「面板比视口矮一截」这一档（600~700px 屏 = 50%~90%），不许整块满屏或反过来矮到半屏',
  PRODUCED.filter((v) => /^calc/.test(v)).every((v) => {
    const ratio = (0.6 * 667 + offsetOf(v)) / 667;
    return ratio > 0.5 && ratio < 0.95;
  }),
  '按 667px 屏折算：列表 ' + Math.round((0.6 * 667 + offsetOf(M.SHARE_GIFT_LIST_H)) / 667 * 100) + '%、详情 ' + Math.round((0.6 * 667 + offsetOf(M.detailListHeight(false, false))) / 667 * 100) + '%');

/* ---------- E. 几何常量单一真源（硬约束 11/28） ---------- */
/** 断言前先剥注释：这两个组件的模板注释里写着整套算式（那是给人看的），
    不剥就会把注释里那一处 `calc(60vh - 141px)`（记着上一版错在哪）当成抄了一份字面量 */
const jsOf = (src) => src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const listJs = jsOf(list);
const detailJs = jsOf(detail);
ok('活动列表从共享常量模块取那一档（自己那一份 import + computed + 模板绑定齐全）',
  /import \{ SHARE_GIFT_LIST_H \} from '@\/common\/utils\/live-popup-height'/.test(listJs) &&
  /listHeight\(\)\s*\{\s*return SHARE_GIFT_LIST_H;/.test(listJs) &&
  /<tz-popup-list :height="listHeight"/.test(listJs));
ok('活动详情从共享常量模块取那一档，并把「条件说明有无 × 底栏在不在」两个判据一并递进去',
  /import \{ detailListHeight \} from '@\/common\/utils\/live-popup-height'/.test(detailJs) &&
  /detailListHeight\(!!this\.activity\.condition_text, !!this\.error\)/.test(detailJs) &&
  /<tz-popup-list :height="listHeight"/.test(detailJs));
ok('两个组件的代码里都不再自带 `calc(60vh …)` / `height="46vh"` 这类字面量（各抄一个数必然与样式漂开）',
  !/calc\(60vh/.test(listJs) && !/calc\(60vh/.test(detailJs) && !/height="46vh"/.test(detailJs));
ok('「60vh + N」这个档只有常量模块一处给得出来，两个组件的代码里连 60vh 三个字都不许再出现',
  modSrc.indexOf("'60vh'") > -1 && listJs.indexOf('60vh') === -1 && detailJs.indexOf('60vh') === -1);

/* ---------- F. 确定高度（M6）+ 参照页未被动过 ---------- */
const heightProp = (src) => {
  const t = src.replace(/<!--[\s\S]*?-->/g, '');
  return (t.match(/<tz-popup-list[^>]*>/g) || []).map((tag) => {
    const m = /(?<!:)\bheight="([^"]*)"/.exec(tag);
    return m ? m[1] : '';
  });
};
ok('三只弹层的 tz-popup-list 都不写 min/max 高度（M6：只写 min/max 会「下方空白还滑不动」）',
  !/min-height|max-height/.test(list.replace(/<!--[\s\S]*?-->/g, '')) &&
  !/min-height|max-height/.test(detail.replace(/<!--[\s\S]*?-->/g, '')) &&
  heightProp(board).indexOf('min-height') === -1);
ok('达人榜那一屏（参照页）的列表区仍是 60vh 定档、没有跟着改成 calc',
  /<tz-popup-list height="60vh"/.test(board));

let fail = 0;
results.forEach((r) => {
  if (!r.pass) fail++;
  console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.name}${r.note ? ' — ' + r.note : ''}`);
});
console.log(`\n共 ${results.length} 条，失败 ${fail} 条`);
process.exit(fail ? 1 : 0);