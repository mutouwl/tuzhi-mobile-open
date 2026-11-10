/**
 * 拼团凑团弹层（M-P2）「面板总高与参照页相等」这一族的机器验法
 * （PRD §9.4 要求的两只新建脚本之一；硬约束 26/28③/37⑤）
 *
 * 跑法：node tuzi-mobile/scripts/check-group-buy-popup.js
 *      node tuzi-mobile/scripts/check-group-buy-popup.js --can-be-red   # 逐条喂反例，证明每条都能红
 *
 * 为什么必须有这一只（2026-10-15）：
 *   ① `sfc-check` 只编译模板，`:height="listHeight"` 绑出来的那串对不对它不看；
 *   ② `ui-audit` 的 `calc-operator-no-space` 只看得见**手写**字面量，JS 拼出来的那一串静态正则永远看不见
 *      —— 紧凑写法 `calc(60vh +65px)` 会让整条 height 被判非法、退回 tz-popup-list 的默认 60vh；
 *   ③ 「两个面板等高」是跨文件几何关系：常量在 `live-popup-height.js`，内衬在组件的 `<style>` 里，
 *      两边各说各话时只有把 CSS 重新量一遍才发现。第一版就真错了：列表区写成
 *      `calc60(GB_FOOT_H + (hasLadder ? GB_LADDER_BOX_H : 0))` —— 底栏被加了两遍、头没减，
 *      两档都比参照页矮 11px，而有阶梯时反而把面板再撑高 132px（阶梯那一格本来就在列表区里面）。
 *
 * 钉八组：A 常量模块实跑 / B 从真实 CSS 重算总高并比参照页 / C 组件不许自带字面量 /
 *        D 确定高度（M6） / E 阶梯窗口在列表区内且高固定 / F 事件名非原生 /
 *        G 拼团区全部调用点的接线形状（2026-10-16 拼团商品扩到六大类，页面名单只存
 *        `check-group-buy-detail.js` ⑨ 组那一份，这一组按目录扫调用点、不抄第二份名单）/
 *        H 拼团入口落在宿主底栏（2026-10-16 用户点名「拼团按钮应该与底部按钮放在一起」：
 *        组件 `@ready` 上抛摘要 → 宿主底栏按钮 → `openGb` 回来开弹层；商详区不再平铺
 *        「正在拼团的人」、不再有中部开团按钮；弹层底栏按钮必须撑满；失败不许开支付面板）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const MOD_FILE = 'src/common/utils/live-popup-height.js';
const POPUP_FILE = 'src/components/tz/group-buy-popup.vue';
const AREA_FILE = 'src/components/tz/group-buy-area.vue';
const BOARD_FILE = 'src/pages/course/live/invite-rank/board-list.vue';
// 拼团档的建单口 2026-10-16 迁到提交订单页（用户点名「拼团付款为什么不跳转提交订单页面」）
const SUBMIT_FILE = 'src/components/order/submit-order.vue';
// 2026-10-20：拼团玩法从凑团弹层挪到拼团详情页（用户点名），规则句的唯一读点也搬到这一页
const DETAIL_FILE = 'src/pages/app/group_buy/detail/detail.vue';

const popup = read(POPUP_FILE);
const area = read(AREA_FILE);
// 2026-10-27：拼团价横幅本体抽成独立组件（宿主课程详情页把它挂进 course-info 价格格），
// 横幅那一族的断言（K1/L1）改钉这一份；`hide-banner` 与价格格的落位由 M 组钉。
const BANNER_FILE = 'src/components/tz/group-buy-banner.vue';
// 2026-10-27 用户点名「立即开团按钮要尽量跟 gba-banner cd-gb-banner 一致」：底栏那枚按钮的底色
// 取横幅同一条红橙渐变，K2 把两处逐字对账（同一条色值写了两份，靠这道门禁钉住不许分叉）。
const GBB_FILE = 'src/components/tz/group-buy-btn.vue';
// 课程详情页：横幅落在价格格、原价行被 `v-else` 收起的那一半接线
const COURSE_FILE = 'src/pages/course/detail/detail.vue';
const COURSE_JS = 'src/pages/course/detail/js.vue';
const COURSE_CSS = 'src/pages/course/detail/css.css';
const banner = read(BANNER_FILE);
const gbb = read(GBB_FILE);
const course = read(COURSE_FILE);
const courseJs = read(COURSE_JS);
const courseCss = read(COURSE_CSS);
const board = read(BOARD_FILE);
const submitOrder = read(SUBMIT_FILE);
const detail = read(DETAIL_FILE);

/* ---------- 工具（与 check-live-popup-height.js 同一档读法） ---------- */
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
  if (/^0$/.test(s)) return 0;
  return NaN;
};
const sides = (v) => {
  const parts = String(v).trim().split(/\s+/).map(pxOf);
  if (parts.length === 1) return [parts[0], parts[0], parts[0], parts[0]];
  if (parts.length === 2) return [parts[0], parts[1], parts[0], parts[1]];
  if (parts.length === 3) return [parts[0], parts[1], parts[2], parts[1]];
  return parts;
};
/** 行盒高：显式 line-height 优先，否则按字号 × 1.4 取整（与参照页那一档同一算法） */
const lineHeightOf = (block, fallbackSize) => {
  const lh = decl(block, 'line-height');
  if (lh) return pxOf(lh);
  const fs2 = pxOf(decl(block, 'font-size')) || fallbackSize;
  return Math.round(fs2 * 1.4);
};

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/* ---------- A. 常量模块实跑 ---------- */
const modSrc = read(MOD_FILE).replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/export /g, '');
let M = {};
try {
  M = new Function(modSrc + '\nreturn {groupBuyListHeight, PANEL_TOTAL_H, HEAD_H, BTN_H, RANK_BOTTOM_H, GB_FOOT_H, GB_LADDER_BOX_H, GB_LADDER_ROW_H, GB_LADDER_GAP, GB_LADDER_ROWS};')();
} catch (e) {
  ok('常量模块可求值', false, e.message);
}
const H0 = String((M.groupBuyListHeight || (() => ''))());
const H1 = String((M.groupBuyListHeight || (() => ''))(true));
const wantPx = (M.PANEL_TOTAL_H || 0) - (M.HEAD_H || 0) - (M.GB_FOOT_H || 0);

ok('A1 常量模块导出了 groupBuyListHeight，且两档都回同一串（阶梯段在列表区里面，不许改面板总高）',
  typeof M.groupBuyListHeight === 'function' && H0 !== '' && H0 === H1,
  '无阶梯=' + H0 + ' 有阶梯=' + H1);
ok('A2 列表区那串是合法 CSS：calc(60vh + Npx)，加号两侧各有一个空格（紧凑写法整条作废退回 60vh）',
  /^calc\(60vh \+ [\d.]+px\)$/.test(H0), H0);
ok('A3 数值等于「参照页面板总高 − 自己的头 − 自己的脚」（算式是加不是减，硬约束 37①②）',
  H0 === 'calc(60vh + ' + wantPx + 'px)' && wantPx > 0,
  '期望 ' + wantPx + 'px，实得 ' + H0);
ok('A4 阶梯窗口是「固定三行 + 框内滚动」，其高度由行高与行距算出（不是随档数长高）',
  (M.GB_LADDER_BOX_H || 0) === (M.GB_LADDER_ROWS * M.GB_LADDER_ROW_H + (M.GB_LADDER_ROWS - 1) * M.GB_LADDER_GAP),
  'rows=' + M.GB_LADDER_ROWS + ' row=' + M.GB_LADDER_ROW_H + ' gap=' + M.GB_LADDER_GAP);

/* ---------- B. 从真实 CSS 重算，与参照页逐帧相等 ---------- */
const headBlock = blockOf(popup, 'gbp-head');
const titleBlock = blockOf(popup, 'gbp-title');
const footBlock = blockOf(popup, 'gbp-foot');
const headSides = sides(decl(headBlock, 'padding') || '0');
const measuredHead = headSides[0] + headSides[2] + lineHeightOf(titleBlock, 16);
// `.gbp-foot` 写的是 longhand（margin-top:16 + padding-bottom:12），只读简写会量成 0 ⇒ 少算 28px
const longPx = (block, prop) => {
  const short = sides(decl(block, prop) || '0');
  const one = (name, idx) => {
    const v = decl(block, prop + '-' + name);
    return v ? pxOf(v) : short[idx];
  };
  return [one('top', 0), one('right', 1), one('bottom', 2), one('left', 3)];
};
const footPad = longPx(footBlock, 'padding');
const footMar = longPx(footBlock, 'margin');
const measuredFoot = footPad[0] + footPad[2] + footMar[0] + (M.BTN_H || 37);

ok('B1 组件里的标题行真实高度与常量 HEAD_H 逐值相同（常量与样式不许各说各话）',
  measuredHead === M.HEAD_H, 'CSS 量出 ' + measuredHead + '，常量 ' + M.HEAD_H);
ok('B2 组件里的底栏真实高度与常量 GB_FOOT_H 同档（内衬 + 外距 + 一枚 tz-button normal 37）',
  Math.abs(measuredFoot - M.GB_FOOT_H) <= 1,
  'CSS 量出 ' + measuredFoot + '，常量 ' + M.GB_FOOT_H);

const listPx = Number((H0.match(/[\d.]+(?=px\)$)/) || ['NaN'])[0]);
const popupTotal = M.HEAD_H + listPx + M.GB_FOOT_H;
const boardTotal = M.HEAD_H + (M.RANK_BOTTOM_H !== undefined ? M.RANK_BOTTOM_H : 141);
ok('B3 拼团弹层面板总高 = 达人榜（参照页）面板总高 = 60vh + ' + boardTotal + 'px（两档都一样）',
  popupTotal === boardTotal, '拼团 ' + popupTotal + ' vs 参照页 ' + boardTotal);
ok('B4 参照页那一屏仍然自己不动（列表区仍是 60vh 定档，没被拼团带着改）',
  /<tz-popup-list height="60vh"/.test(board));

/* ---------- C. 单一来源 ---------- */
const popupJs = popup.slice(popup.indexOf('<script'));
ok('C1 弹层只 import 那一枚 groupBuyListHeight，自己不另起第二份几何常量（硬约束 11/28/37④）',
  /import \{[^}]*groupBuyListHeight[^}]*\} from '@\/common\/utils\/live-popup-height'/.test(popupJs)
    && !/calc\(60vh/.test(popupJs) && popupJs.indexOf('60vh') === -1);
ok('C2 列表区绑的是模块算出来的那一个值，不是写死的 vh/px',
  /<tz-popup-list :height="listHeight"/.test(popup) && /listHeight\(\)[^{]*\{[^}]*groupBuyListHeight/.test(popupJs));

/* ---------- D. 确定高度（M6） ---------- */
ok('D1 tz-popup-list 不写 min-height/max-height（M6：只写 min/max 会「下方空白还滑不动」）',
  !/min-height|max-height/.test(styleIn(popup)));

/* ---------- E. 阶梯那一格住在列表区内部 ---------- */
const openTag = popup.indexOf('<tz-popup-list');
const closeTag = popup.indexOf('</tz-popup-list>');
const ladderAt = popup.indexOf('gbp-ladder-box');
ok('E1 阶梯那一格在 tz-popup-list 之内（放在外面就等于往面板上加高，两档总高不再相等）',
  openTag > -1 && closeTag > openTag && ladderAt > openTag && ladderAt < closeTag);
const ladderBox = blockOf(popup, 'gbp-ladder-box');
ok('E2 阶梯窗口高是固定的（与常量 GB_LADDER_BOX_H 同档）且框内滚动',
  (pxOf(decl(ladderBox, 'height')) === M.GB_LADDER_BOX_H
    || pxOf(decl(ladderBox, 'max-height')) === M.GB_LADDER_BOX_H)
    && /auto|scroll/.test(decl(ladderBox, 'overflow') + ' ' + decl(ladderBox, 'overflow-y')),
  'height=' + (decl(ladderBox, 'height') || decl(ladderBox, 'max-height'))
    + ' overflow=' + (decl(ladderBox, 'overflow') || decl(ladderBox, 'overflow-y')));

/* ---------- F. 跨组件接线（正则看不见的那一半） ---------- */
ok('F1 弹层对外事件全是非原生名（open/close/pick/create/join），没有一处 $emit("tap"/"click")',
  !/\$emit\(['"](tap|click)['"]/.test(popupJs));
ok('F2 「开新团」发的是 create，不是 open —— open 只表示「弹层已显示」，两者同名调用点分不开',
  /\$emit\(['"]create['"]/.test(popupJs) && /openNew\(\)[\s\S]{0,120}\$emit\(['"]create['"]/.test(popupJs));
ok('F3 拼团区把弹层挂在自己根节点内并接住 create/join（单一数据源，页面不再镜像一份 activity/teams）',
  /<tz-group-buy-popup ref="popup"/.test(area) && /@create="handleCreate" @join="handleJoin"/.test(area));
ok('F4 开团/参团入口**带去提交订单页**（2026-10-16 用户点名「拼团付款为什么不跳转提交订单页面」）：goBuy 组装扁平 gb_* 参数 + submit URL（goodsList 发明文空数组——编码成 %5B%5D 页面壳 JSON.parse 会挂），本组件不再自建订单与支付面板',
  /'\/pages\/order\/submit\/submit\?'/.test(area) && /gb_activity=' \+ Number\(ctx\.activity_id\)/.test(area)
    && /goodsList=\[\]/.test(area)
    && !/group_buy\.team\.(open|join)/.test(area) && !/<tz-pay /.test(area));
ok('F5 建单口住在提交订单页的拼团档：team.open/join + tz-pay + 失败不前进（显式判 code 与 order_no）+ 金额吃回体 + `:go-order="false"`（支付完回 cancelPay 那一支去团详情）',
  /group_buy\.team\.join/.test(submitOrder) && /group_buy\.team\.open/.test(submitOrder)
    && /<tz-pay /.test(submitOrder)
    && /const d = \(res && res\.code === 1 && res\.data\) \|\| null;[\s\S]{0,200}if \(!d \|\| !d\.order_no\)/.test(submitOrder)
    && /d\.price !== undefined/.test(submitOrder)
    && /:go-order="!isGroupBuy"/.test(submitOrder)
    && /group_buy\/detail\/detail\?team_id=/.test(submitOrder));
ok('F6 凑团行剩余倒计时的时间单位对齐：`expire_time` 是秒级、`this.now` 是毫秒，必须 ×1000（2026-10-16 用户点名「上面拼团中、下面已结束」——直减恒负、行里永远「已过期」）',
  /end \* 1000 - this\.now/.test(popup));
ok('F7 拼团档保留「备注」行（2026-10-19 用户点名「为什么拼团订单不支持设置订单备注」）：段壳只由送好友收掉（`v-if="!isSendFriend"`，不带 isGroupBuy），积分与会员折扣两行各自带 `!isGroupBuy`，备注行不带；请求体两档（开团/参团）都把 buyer_remark 发出去 —— 后端落的是普通单同一列 order.buyer_remark',
  // 2026-10-30 起段壳改成 `<template v-if="!isSendFriend">` + 自带前导间隔条（块间条归块自己所有，
  // 不许在块外摆共享条；老形态 v-if 直接挂在 tz-box 上仍接受）—— 判据只钉「拼团档不收这一段」
  ( /<template v-if="!isSendFriend">\s*<tz-divider[^>]*\/>\s*<tz-box padding="5px 15px">/.test(submitOrder)
    || /<tz-box padding="5px 15px" v-if="!isSendFriend">/.test(submitOrder) )
    && (submitOrder.match(/v-if="!isGroupBuy && data\.(score_amount|vip_discount_price)/g) || []).length === 2
    && /<u-form-item label="备注">\s*<u-input[^>]*v-model="form\.buyer_remark"/.test(submitOrder)
    && (submitOrder.match(/buyer_remark: remark/g) || []).length === 2);
ok('F8 参团页先判「我已在团里」并把话说清（2026-10-20 用户点自己的团 ⇒ 填完才撞「你已参与该团」）；team.open/join 加在途锁（连点会各建一个团）',
  /const mine = \(d\.members \|\| \[\]\)\.filter\([\s\S]{0,160}Number\(m\.is_me\) === 1/.test(submitOrder)
    && /content: '你已参与该团'/.test(submitOrder)
    && /group_buy\/detail\/detail\?team_id=/.test(submitOrder)
    && /if \(that\.submitting\) \{ return; \}/.test(submitOrder)
    && (submitOrder.match(/that\.submitting = false/g) || []).length >= 2);

/* ---------- G. 拼团区的调用点 × 组件那一层的接线（2026-10-16 拼团商品扩到六大类） ---------- */
// 这一组**不写死页面名单**（唯一一份「哪一档挂在哪一页」的期望表在 `check-group-buy-detail.js` ⑨ 组，
// 这里再抄一份就是第二份会分叉的名单，硬约束 11）：按目录扫出全部 `<tz-group-buy-area>` 调用点，
// 逐处只核「跨组件边界的接线形状」——`sfc-check` 只编译模板、`ui-audit` 只按正则查版式，
// 调用点传了组件没有的 prop、@go-pay 两侧名字对不上、handler 是空壳，这三类它们全看不见（硬约束 27③/39⑦）。
const walkVue = (dir, out) => {
  fs.readdirSync(dir).forEach((f) => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) { walkVue(p, out); }
    else if (/\.vue$/.test(f)) { out.push(p); }
  });
  return out;
};
const HOSTS = walkVue(path.join(ROOT, 'src/pages'), [])
  .map((p) => path.relative(ROOT, p).replace(/\\/g, '/'))
  .filter((rel) => /<tz-group-buy-area\b/.test(read(rel)));
/** 取 `<tz-group-buy-area ... />` 那几枚标签（属性写在下一行的也算一处） */
const gbTagOf = (src) => src.match(/<tz-group-buy-area\b[\s\S]*?\/>/g) || [];
const kebab = (s) => s.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
const propsOf = area.slice(area.indexOf('props:'), area.indexOf('emits:'));
const PROP_NAMES = (propsOf.match(/(\w+)\s*:\s*\{\s*type/g) || [])
  .map((s) => s.replace(/\s*:.*$/, '')).map(kebab);
const emitMatch = area.match(/emits:\s*\[([^\]]*)\]/);
const EMITS = (emitMatch ? emitMatch[1] : '').split(',').map((s) => kebab(
  s.trim().replace(/^['"]|['"]$/g, ''))).filter(Boolean);
// 声明与实际发的那一枚必须同名：`emits: ['go-pay']` 写着 go-pay 而代码里 `$emit('tap')`，
// 调用点 `@go-pay` 永远收不到（小程序端照旧、H5 端静默失灵），三道静态门禁全看不见这种分叉
const EMITTED = Array.from(new Set(
  // 事件名允许带冒号（`update:campus` 这一档是 `.sync` 的约定名）：只认 \w 与 - 时，
  // 声明了 `emits: ['update:campus']` 也会被当成「代码里没发」而恒红（2026-10-29 校区那一轮）
  (area.match(/\$emit\(\s*['"]([\w:-]+)['"]/g) || []).map((s) => /['"]([\w:-]+)['"]/.exec(s)[1])));

ok('G1 全站扫得到拼团区的调用点（数量 ≥ 后端六大类那一档数；组件零调用方 = 学员端整条功能不可见）',
  HOSTS.length >= 6, '扫到 ' + HOSTS.length + ' 处：' + HOSTS.join(' , '));
ok('G2 组件的 props = goodsType / goodsId / share / hideDanmu / preload / hostSpec / specInline'
  + ' ＋ 2026-10-30 受邀参团那六枚（joinTeam / joinActivity / joinGoodsId / joinSpec / joinLadder / joinPrice；'
  + '缺省 0/空 ⇒ 九类商详页老形态逐字不变）＋ 同日 hostOrder（宿主接管下单入口，把上下文经 `order` 上抛）'
  + '＋ 2026-10-31 hostTicket（线下活动连选票/份数一起交给宿主的「选票页 → 报名信息页」）与 closed'
  + '（活动报名已截止：底栏入口置灰之外，卡里「去凑团」那一整段也收掉），'
  + '对外事件只有 go-pay / ready / pick-spec / order 四枚，'
  + '且声明的与代码里真发的同名（非原生名，硬约束 27①）；2026-10-30 起**没有** hide-banner'
  + '（横幅只在拼团区那张卡里渲染，拼团一整块连着放）',
  PROP_NAMES.join(',') === 'goods-type,goods-id,share,hide-danmu,preload,host-spec,spec-inline,join-team,join-activity,join-goods-id,join-spec,join-ladder,join-price,host-order,host-ticket,closed'
    && EMITS.join(',') === 'go-pay,ready,pick-spec,order'
    && EMITTED.slice().sort().join(',') === 'go-pay,order,pick-spec,ready',
  'props=' + PROP_NAMES.join(',') + ' emits=' + EMITS.join(',') + ' 实际发出=' + EMITTED.join(','));

HOSTS.forEach((rel) => {
  const src = read(rel);
  gbTagOf(src).forEach((tag) => {
    const bad = [];
    (tag.match(/[\s]([:@]?[\w-]+)=/g) || []).forEach((raw) => {
      const tok = raw.trim().replace(/=$/, '');
      if (tok[0] === ':') { if (PROP_NAMES.indexOf(tok.slice(1)) < 0) bad.push(tok); }
      else if (tok[0] === '@') { if (EMITS.indexOf(tok.slice(1)) < 0) bad.push(tok); }
      else if (['v-if', 'ref'].concat(PROP_NAMES).indexOf(tok) < 0) { bad.push(tok); }
    });
    ok('G3 ' + rel + ' 那一处只传组件认得的入参（多一枚就是没人读的死属性，如已作废的 order-goods-id）',
      bad.length === 0, bad.length ? '多出来：' + bad.join(' ') : '');
    const handler = /@go-pay="([\w]+)"/.exec(tag);
    // 宿主脚本可能是 `<script src="./js.vue">` 外置，也可能内联在同一只 .vue 里
    const ext = /<script\s+src="([^"]+)"/.exec(src);
    const hostJs = ext ? read(path.join(path.dirname(rel), ext[1]).replace(/\\/g, '/')) : src;
    const body = handler
      ? ((hostJs.match(new RegExp('(\\n[ \\t]*)' + handler[1] + '\\s*\\(\\s*\\)\\s*\\{([\\s\\S]*?)\\}')) || ['', '', ''])[2])
      : '';
    ok('G4 ' + rel + ' 那一处接住了 @go-pay，且宿主里那枚 handler 真把某一枚「账」置真（emit ↔ 调用点 ↔ handler 三跳齐了才算走得通）',
      !!handler && /=\s*true/.test(body),
      handler ? (handler[1] + ' 体里读到：' + (body.trim().slice(0, 60) || '空')) : '调用点没接 @go-pay');
  });
});

/* ---------- H. 拼团入口落在宿主底栏（2026-10-16） ---------- */
// 用户两次点名：「拼团按钮应该与底部按钮放在一起」「正在拼团的人怎么能直接在课程详情页显示」。
// 落点：按钮由宿主底栏渲染（course/exam 走 tz-bottom-btn 的 gbText/groupbuy；
// 其余四页在各自底栏自带一枚 gb-btn），摘要经 `@ready` 从组件上抛；
// 商详区里不再平铺团队列表、不再有中部开团按钮；弹层里那两枚按钮必须撑满；
// 开团/参团失败不许开支付面板（2026-10-16 实跑：被改价闸门拒掉后支付面板照样弹出、order_no 为空）。
const areaJs = area.slice(area.indexOf('<script'));
ok('H1 商详区只内联前三行在线凑团（不再是全量平铺）、没有中部开团按钮；openPopup 仍对外（宿主底栏那枚按钮的出口）',
  !/gba-cta/.test(area) && /v-for="team in inlineTeams"/.test(area)
    && /查看全部 \{\{ teamsTotal \}\} 个团/.test(area) && /openPopup\(\)\s*\{/.test(areaJs));
ok('H2 拼团区不再自建订单：建单口与「失败不许开支付面板」都在提交订单页的拼团档（F5 钉那一边）',
  !/group_buy\.team\.(open|join)/.test(areaJs) && !/<tz-pay /.test(area));
ok('H3 弹层底栏两枚按钮都带 long（tz-button 默认 width:fit-content，不传就是缩成一点的那一族）',
  /<tz-button[^>]*\blong\b[^>]*@click="joinFirst"/.test(popup) && /<tz-button[^>]*\blong\b[^>]*@click="openNew"/.test(popup));
ok('H4 弹层凑团行：入口只有行尾按钮这一处（行不再挂 @click —— 冒泡与 $emit 双触发靠 paying 兜底不算修好）',
  /<tz-button text="去凑团" type="danger" size="mini" @click="join\(team\)" \/>/.test(popup)
    && !/gbp-team-item[^>]*@click/.test(popup));
HOSTS.forEach((rel) => {
  const src = read(rel);
  const ext = /<script\s+src="([^"]+)"/.exec(src);
  const hostJs = ext ? read(path.join(path.dirname(rel), ext[1]).replace(/\\/g, '/')) : src;
  // course/exam 走 `tz-bottom-btn` 的 `order-extra` 插槽（与送好友同机制：插件入口由插件组件自渲染，
  // 2026-10-16 底栏把 gbText props 收回、统一到插槽）；其余四页在各自底栏自带一枚 gb-btn
  // 两种写法都认：`v-if="gbEntry"` 之后直接 `:text="gbEntry.text"`（2026-10-29 简写）与旧的三元写法
  const viaBottomBtn = /<tz-group-buy-btn\b/.test(src)
    && /:text="gbEntry(?:\.text|\s*\?\s*gbEntry\.text\s*:\s*'')"/.test(src) && /@open="openGb"/.test(src);
  const viaOwnBtn = /gb-btn/.test(src) && /(@tap|@click)="openGb"/.test(src);
  ok('H5 ' + rel + ' 底栏那枚拼团按钮两跳齐：调用点（tz-group-buy-btn 插槽或自带 gb-btn）都接',
    viaBottomBtn || viaOwnBtn,
    viaBottomBtn ? '走 tz-bottom-btn 的 order-extra 插槽' : (viaOwnBtn ? '自带 gb-btn' : '两档都没接'));
  ok('H6 ' + rel + ' 宿主接住了 @ready（摘要存进 gbEntry）且 openGb 真回去开弹层（调 gbArea.openPopup()）',
    /@ready="gbReady"/.test(src)
      && /gbReady\(entry\)[\s\S]{0,80}gbEntry\s*=\s*entry/.test(hostJs)
      && /gbEntry:\s*null/.test(hostJs)
      && /openGb\(\)[\s\S]{0,160}openPopup\(\)/.test(hostJs),
    'ready=' + /@ready="gbReady"/.test(src) + ' field=' + /gbEntry:\s*null/.test(hostJs)
      + ' open=' + /openGb\(\)[\s\S]{0,160}openPopup\(\)/.test(hostJs));
});

/* ---------- I. 「拼团玩法」整句由后端下发（2026-10-18 `auto_refund` 接通；2026-10-20 挪进拼团详情） ---------- */
// 「超时未成团自动退款」只在开关为开时才成立。这一枚开关原先**后端零读点**（拨到关也照样自动退），
// 而这两句在前端写死 ⇒ 关掉之后界面在替商家做一个它做不到的承诺。正解：文案由后端一处派生
// （`RuleText::of()` → `rule_text` 字段），商详区与拼团详情都读它；
// 2026-10-20 用户点名「拼团玩法应该放在拼团详情里面，而不是点击拼团之后的弹窗里」，
// 所以凑团弹层不许再出现玩法段/硬编码句子。
// 判的是**渲染进句子的那一串**，注释里引用这句（说明为什么不能写死）不算 —— 先剥注释再搜。
const codeOnly = (s) => s.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
ok('I1 拼团玩法整句由后端 `rule_text` 一处下发，前端不再写死「自动退款」承诺',
  !/超时未成团自动退款|将自动原路退款/.test(codeOnly(popup) + codeOnly(area) + codeOnly(detail))
    && /activity\.rule_text/.test(area) && /rule_text/.test(detail) && /ruleText/.test(detail),
  'area=' + /activity\.rule_text/.test(area) + ' detail=' + /rule_text/.test(codeOnly(detail)));
ok('I2 凑团弹层不再承载玩法说明；详情页的玩法**默认摊开**（2026-10-27 用户点名「不要在点击折叠面板才显示」），折叠态与行尾箭头一并撤掉',
  !/玩法说明/.test(codeOnly(popup)) && !/gbp-fold/.test(popup)
    && /v-if="detail\.activity && ruleText"[\s\S]{0,220}拼团玩法/.test(detail)
    && /<text class="gbd-rule-full">\{\{ ruleText \}\}<\/text>/.test(detail)
    // 折叠残留清零：状态位 / 箭头 / 挂点击都不许留；`.gbd-rule-head` 只作标题行容器（与骨架同形），不算折叠残留
    && !/ruleOpen/.test(codeOnly(detail)) && !/gbd-rule-arrow|--open/.test(detail)
    && !/class="gbd-rule"[^>]*@click/.test(detail),
  'popup 残留玩法段=' + /玩法说明/.test(codeOnly(popup))
    + ' 详情默认摊开=' + /v-if="detail\.activity && ruleText"[\s\S]{0,160}拼团玩法/.test(detail)
    + ' 折叠残留=' + /ruleOpen/.test(codeOnly(detail)));

/* ---------- J. 凑团清单的取数形状（分页 + 上拉加载 + 总数被消费；2026-10-19 用户点名「列表弹窗是否分页」） ---------- */
// W13 / 硬约束 32 那一族的原点就是这个形状：发请求不传分页参数、取数不读总数 ⇒ 请求不报错、
// 界面只显示前 10 条，商家读出来是「只有 10 个人在拼团」。这一组的四条各治一条链上的一环。
ok('J1 在线凑团那条取数发 page + limit（只发 limit 就是「带默认 limit 的静默截断」那一族）',
  /\$api\('group_buy\.activity\.teams',\s*\{[^}]*\bpage:\s*page\b[^}]*\blimit:\s*10\b/.test(area));
ok('J2 弹层标题的「N 人正在拼团」吃后端 total，不拿本页已取到的行数当总数（硬约束 32②）',
  /this\.teamsTotal = Number\(d\.total\)/.test(area) && /\$\{this\.teamsTotal\} 人正在拼团/.test(popup)
    && !/this\.teamsTotal = (rows|d\.rows)/.test(area),
  'area 读 total=' + /this\.teamsTotal = Number\(d\.total\)/.test(area) + ' popup 消费=' + /\$\{this\.teamsTotal\} 人正在拼团/.test(popup));
ok('J3 尾部有 u-loadmore 那一行，收口吃后端 has_more（不许写 teams.length >= 10 这类按行数硬判）',
  /<u-loadmore :status="teamsLoadStatus"/.test(popup) && /this\.teamsHasMore = !!d\.has_more/.test(area)
    && /this\.teamsLoadStatus = this\.teamsHasMore \? 'loadmore' : 'nomore'/.test(area));
ok('J4 「翻到底」那一跳两头都接上：tz-popup-list @lower → 弹层 $emit(load-more) → 拼团区接住 → teamsPage += 1 再取（少一环第 11 条永远没有入口）',
  /@lower="\$emit\('load-more'\)"/.test(popup) && /@load-more="loadMoreTeams"/.test(area)
    && /loadMoreTeams\(\)[\s\S]{0,160}this\.teamsPage \+= 1/.test(area));

/* ---------- K. 商详拼团价横幅（2026-10-20 用户拿参照产品图 2 点名「特殊样式也没有展示」） ---------- */
// 2026-10-27 起横幅本体住在 `group-buy-banner.vue`（课程详情页把它挂进价格格），
// 所以样式断言钉那一份；拼团区必须引用它、且允许被 `hide-banner` 收掉（否则宿主会出两枚横幅）。
ok('K1 商详拼团价是红橙横幅：大字拼团价 + 「N人拼团价」白标 + 划线原价 + 距结束分段倒计时',
  /class="gba-banner"/.test(banner) && /linear-gradient\(90deg, #ff4b2b 0%, #ff8f2b 100%\)/.test(banner)
    && /class="gba-tag"/.test(banner) && /class="gba-origin"/.test(banner)
    && /countLeft/.test(banner) && /activity\.end_time/.test(banner)
    && /class="gba-time"/.test(banner) && /pad2\(/.test(banner)
    && /<tz-group-buy-banner :activity="activity" \/>/.test(area));

// 2026-10-27 用户点名「立即开团按钮要尽量跟 gba-banner cd-gb-banner 一致」。
// 判据把横幅那条渐变从 banner 源码里**现取**再到底栏按钮里找，不在这里抄第二份色值：
// 色值一改两处不同步时，K2 当场报红（抄一份字面量进脚本就变成「脚本自己也说过期了」）。
const bannerGradient = (banner.match(/linear-gradient\(90deg, #ff4b2b 0%, #ff8f2b 100%\)/) || [])[0] || '';
// 判「旧色值有没有残留」前先剥注释：组件头注释里写着「原先的纯色 #f53f3f 已撤」是说明，不是样式
const gbbCode = gbb.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');
ok('K2 底栏「立即开团」按钮底色 = 横幅那条红橙渐变（同一个色值不许分叉；旧的纯色 #f53f3f 已撤）',
  !!bannerGradient && gbb.indexOf(bannerGradient) > -1 && !/#f53f3f/.test(gbbCode),
  'banner=' + (bannerGradient || '(没取到)') + ' / 按钮=' + ((gbb.match(/color="([^"]*gradient[^"]*)"/) || [])[1] || '(无渐变)')
    + ' / 旧纯色残留=' + (/#f53f3f/.test(gbbCode) ? '有' : '无'));

/* ---------- L. 2026-10-25 对照参照产品截图补齐的四件（阶梯起价 / 邀新标识 / 到期撤区 / 弹层形态） ---------- */
ok('L1 阶梯拼团横幅取**最低价那一档**并带「起」（参照产品「拼团¥78.00 起」；取首档＝人数最少、价格最高，把门槛价写高）',
  /lowestLadder\(\)/.test(banner) && /class="gba-rise"/.test(banner)
    && /type === 'ladder' && this\.lowestLadder/.test(banner)
    && /Math\.min|pb < pa/.test(banner));
ok('L2 邀新拼团在商详价格区下方有常驻提示条「仅限新用户参团」（参照产品 03-04 图；老用户看不出来这是新用户专享价）',
  /class="gba-invite"/.test(area) && /仅限新用户参团/.test(codeOnly(area)) && /activity\.type === 'invite'/.test(area));
ok('L3 会话内活动到期：整区收掉 + 底栏入口撤掉 + 宿主价格格的横幅一并撤（倒计时归零那一支置 expired 并重发 ready=null，硬约束 27②）',
  /expired: false/.test(area) && /that\.expired = true/.test(area)
    // 2026-10-28 起载荷多一枚 `price_text`（底栏按钮第二行的拼团价）：判「有价、到期给 null」两半；
    // 同一载荷还有 `inTeam`（2026-10-27 底栏「立即订阅」收不收），三枚顺序按 emitReady 实际那一行核
    && /live[\s\S]{0,240}text: this\.entryText, inTeam: !!this\.myTeam, join: this\.joinMode, activity: this\.activity, price_text: this\.entryPrice[\s\S]{0,40}: null/.test(area)
    && /activity && !expired/.test(area));
ok('L4 弹层面板挂底部安全区（面板只挂一份、u-popup 那份已关；微信端减半），空态容器 40/48 内衬',
  /env\(safe-area-inset-bottom\)/.test(popup) && /safeAreaInsetBottom="false"/.test(popup)
    && /\.gbp-empty\s*\{[\s\S]{0,60}padding:\s*40px 0 48px/.test(popup));
ok('L5 凑团行剩余时间是秒级 `HH:MM:SS` 且弹层开着时 1 秒续跑、关层/卸载都清定时器（参照产品 01-08 图「剩余23:59:59」）',
  /pad2\(Math\.floor\(\(total % 3600\) \/ 60\)\)/.test(popup) && /pad2\(total % 60\)/.test(popup)
    && /'剩余 ' \+/.test(popup) && /setInterval\(function tick\(\)/.test(popup)
    && /clearTimer\(\);/.test(popup) && /beforeDestroy\(\)\s*\{\s*this\.clearTimer/.test(popup)
    && /beforeUnmount\(\)\s*\{\s*this\.clearTimer/.test(popup));
ok('L6 弹层 meta 行带「已拼 N 件」（吃后端 join_count，没给就不写），底栏「去凑团」参**当前页首行**（teamsPageStart，翻过页之后不盲参第 1 页第一团）',
  /joinedText\(\)/.test(popup) && /activity\.join_count/.test(popup)
    && /teamsPageStart: \{ type: Number, default: 0 \}/.test(popup)
    && /const team = this\.teams\[start\] \|\| this\.teams\[0\]/.test(popup)
    && /:teams-page-start="teamsPageStart"/.test(area)
    && /this\.teamsPageStart = page === 1 \? 0 : this\.teams\.length/.test(area));

/* ---------- M. 拼团一整块连着放（2026-10-30 用户点名「gba-rule 拼团玩法都应该放在 gba-banner 下面，
   也包括正在拼团的列表，让拼团连成一个整体」+「上下挨在一起，不要拆分放」） ---------- */
// 这一组钉的是**跨文件落位**：横幅组件自己（K1/L1）与拼团区（K1 尾巴）都绿，也可能出现
// 「宿主又把横幅提回价格格、拼团玩法与凑团列表另起一张卡」那种拼团被拆成两截的样子。
// 2026-10-27~10-29 的「横幅进价格格 + 拼团区 `hide-banner` 收自己那份」整套已作废。
ok('M1 课程详情页价格格不再摆拼团横幅：`score`（积分页）之后是原价行，'
  + '模板里没有任何 `<tz-group-buy-banner>`（横幅回拼团区那张卡）；拼团进行中这一行由 '
  + '`gbPriceShown` 收起（一屏一个价，2026-10-30 第五轮）',
  course.indexOf('class="score"') > -1
    && course.indexOf('<div class="price" v-else-if="gbPriceShown">') > course.indexOf('class="score"')
    && /gbPriceShown\(\)/.test(courseJs)
    && !/<tz-group-buy-banner\b/.test(course));
ok('M2 横幅只由拼团区在自己那张卡里渲染一份：组件不认 `hide-banner`、也没有 `v-if="!hideBanner"`'
  + '（留着就是一枚没人传的判据）',
  /<tz-group-buy-banner :activity="activity" \/>/.test(area)
    && !/hideBanner\b/.test(codeOnly(area)) && !/hide-banner/.test(codeOnly(area)));
ok('M3 横幅的数据只来自拼团区那条取数链（宿主 js 里 `group_buy.activity.detail` 零命中），'
  + '摘要只经 `@ready` 上抛给底栏按钮',
  !/group_buy\.activity\.detail/.test(courseJs) && /this\.gbEntry = entry;/.test(courseJs));
ok('M4 拼团区那张卡 `padding="0"`：横幅与玩法/凑团列表贴同一张白卡的两边，'
  + '不再靠宿主的负 margin 出血（`.course-info .cd-gb-banner` 那套已删净）',
  /<tz-box padding="0" v-if="installed && activity && !expired">/.test(area)
    && !/\.course-info \.cd-gb-banner/.test(courseCss));
// M5/M6/M7（2026-10-29 用户三条点名）：外形上的三处「不协调」，各一条机器判据。
// 三条都只有真机/小程序端才显形或只有一格数值在 CSS 里 —— `ui-audit` 的正则看不见「100% 有没有生效」。
ok('M5 横幅本体显式满宽 + 内衬记在盒内（`width:100%` + `box-sizing:border-box`；只靠宿主给宽度时，小程序端负边距落不到组件宿主上 ⇒ 左右各空 15px）',
  /\.gba-banner \{[\s\S]{0,240}?width:\s*100%/.test(banner)
    && /\.gba-banner \{[\s\S]{0,240}?box-sizing:\s*border-box/.test(banner));
ok('M6 弹层标题行左内衬 16（四值简写的第 4 位；写成三值 `15px 36px 12px` 时左右共用 36 ⇒ 标题比下方列表多缩进 20px）',
  /\.gbp-head \{[\s\S]{0,120}?padding:\s*15px\s+36px\s+12px\s+16px/.test(popup));
// 2026-10-30 用户点名 `#/pages/app/vip/center/center`「去掉 gba-rule 下面的边框细线」：
// 上一轮（10-29「下边框 100% 就很不协调」）的解法是把线收进 15px 内衬，这一轮是**整条不要**——
// 玩法块与送好友之间靠块间距分隔。判据跟着换口径：线上不许再有 border，内衬回到常规 15px
// （线没了还留 `margin: 0 15px + padding: 12px 0` 那套缩进技巧，下一个人会以为这里仍有一条线）。
const ruleBlock = blockOf(area, 'gba-rule');
ok('M7 拼团玩法那块不画下沿发丝线（2026-10-30 用户点名要去掉；内衬回到常规 12px 15px，与上下兄弟同档）',
  !decl(ruleBlock, 'border') && !decl(ruleBlock, 'border-bottom') && !decl(ruleBlock, 'border-top')
    && decl(ruleBlock, 'padding') === '12px 15px');
// M8（2026-10-29 用户点名「点击立即开团跳转 pages/order/submit/submit 并提示获取成功」）：
// `group_buy.activity.detail` 的无活动档是 `{code:1, msg:'获取成功', data:null}`（后端 `Activity::detail`
// 的 `success('获取成功', null)`）。失败框里直接印 `res.msg` 时，用户读到的就是一句成功话、
// 完全不知道为什么要被退回。判据：无数据那一档的原因**只在真失败（code≠1）时才吃后端 msg**，
// 成功但无数据必须走一句固定的说明。
ok('M8 提交订单页：拼团「取不到活动」那一档不拿后端成功话当失败原因（成功+空数据走固定说明，真失败才回 res.msg）',
  /const msg = \(res && res\.code !== 1 && res\.msg\)/.test(submitOrder)
    && /拼团活动已结束或暂不可用，请返回重新选择/.test(submitOrder));


/* ---------- 反例：每条都必须能红 ---------- */
const NEGATIVES = [
  { i: 0, patch: ['return calc60(PANEL_TOTAL_H - HEAD_H - GB_FOOT_H);', 'return calc60(GB_FOOT_H);'] },
  { i: 1, patch: ["return 'calc(60vh + ' + px + 'px)';", "return 'calc(60vh +' + px + 'px)';"] },
  { i: 2, patch: ['return calc60(PANEL_TOTAL_H - HEAD_H - GB_FOOT_H);', 'return calc60(PANEL_TOTAL_H - HEAD_H);'] },
  { i: 3, patch: ['export const GB_LADDER_BOX_H = GB_LADDER_ROWS * GB_LADDER_ROW_H + (GB_LADDER_ROWS - 1) * GB_LADDER_GAP;', 'export const GB_LADDER_BOX_H = 1;'] },
  { i: 4, patch: ['.gbp-head {', '.gbp-head-zz {'] },
  { i: 5, patch: ['.gbp-foot {', '.gbp-foot-zz {'] },
  { i: 6, patch: ['export const PANEL_TOTAL_H = HEAD_H + RANK_BOTTOM_H;', 'export const PANEL_TOTAL_H = HEAD_H + RANK_BOTTOM_H + 40;'] },
  { i: 7, patch: ['<tz-popup-list height="60vh"', '<tz-popup-list height="70vh"'] },
  { i: 8, patch: ["import { groupBuyListHeight } from '@/common/utils/live-popup-height';", 'const groupBuyListHeight = () => "60vh";'] },
  { i: 9, patch: [':height="listHeight"', ':height="60vh"'] },
  { i: 10, patch: ['export const GB_FOOT_H = 65;', 'export const GB_FOOT_H = 65;\n.min-hack { min-height: 300px; }'] },
  { i: 11, patch: ['class="gbp-ladder-box"', 'class="gbp-ladder-outside"'] },
  { i: 12, patch: ['.gbp-ladder-box {', '.gbp-ladder-box-zz {'] },
  { i: 13, patch: ["$emit('open')", "$emit('tap')"] },
  // 2026-10-28 起 `create` 载荷多了 `specId`、写成多行字面量：样件改打 emit 名（要证明的仍是「事件名退回 open」）
  { i: 14, patch: ["this.$emit('create', {", "this.$emit('open', {"] },
  { i: 15, patch: ['<tz-group-buy-popup ref="popup"', '<tz-group-buy-popup-zz ref="popup"'] },
  { i: 16, patch: ["'group_buy.team.join'", "'order.submit'"] },
  // G 组那四条各配一颗样件（调用点接线：死属性 / 漏接 @go-pay / 整处摘掉 / 事件名退回原生 tap）
  { i: 17, patch: ['goods-type="physical"', ':order-goods-id="goodsId" goods-type="physical"'] },
  { i: 18, patch: ['@pick-spec="openGbSpec" @go-pay="gbGoPay"', '@pick-spec="openGbSpec"'] },
  // i19 原来打的是「圈子预售页把拼团区整枚摘掉」：那只让 HOSTS 从 7 掉到 6、没有跌破阈值 ⇒ 恒绿。
  // 改成打**接线形状**（对外事件名退回原生 tap），G2 与逐调用点那几条一起红。
  { i: 19, patch: ["emits: ['go-pay', 'ready', 'pick-spec', 'order']", "emits: ['tap', 'ready', 'pick-spec', 'order']"] },
  { i: 20, patch: ["$emit('go-pay')", "$emit('tap')"] },
  // H 组六条各配一颗样件（底栏入口那一圈的跨文件接线，正则门禁的正例之外逐条证明「能红」）
  // i21 原先摘的是玩法块（那条断言 2026-10-27 已随「默认摊开」重写），改成把内联凑团退回全量平铺 —— H1 必须红
  { i: 21, patch: ['v-for="team in inlineTeams"', 'v-for="team in teams"'] },
  { i: 22, patch: ['if (!d || !d.order_no) {', 'if (false) {'] },
  { i: 23, patch: ['size="normal" long @click="joinFirst"', 'size="normal" @click="joinFirst"'] },
  { i: 24, patch: ['<tz-button text="去凑团" type="danger" size="mini" @click="join(team)" />', '<tz-button text="去凑团" type="danger" size="mini" />'] },
  { i: 25, patch: [":text=\"gbEntry ? gbEntry.text : ''\"", ":text=\"''\""] },
  { i: 26, patch: ['@ready="gbReady"', '@ready2="gbReady"'] },
  // F4/F5/H2 这三条（提交订单页那一圈）也各配一颗样件
  { i: 27, patch: ["this.$nav.to('/pages/order/submit/submit?' + q.join('&'));", "this.$nav.to('/pages/order/zz/zz?' + q.join('&'));"] },
  { i: 28, patch: [':go-order="!isGroupBuy"', ':go-order="true"'] },
  { i: 29, patch: ['<tz-group-buy-popup ref="popup"', '<tz-pay :visible="pay.visible" /><tz-group-buy-popup ref="popup"'] },
  { i: 30, patch: ['end * 1000 - this.now', 'end - this.now'] },
  // I 组两条各配一颗样件（规则句退回前端写死 / 拼团详情那一行整段摘掉）
  { i: 31, patch: ["ruleText() { return ((this.detail.activity || {}).rule_text) || ''; },", "ruleText() { return '超时未成团自动退款'; },"] },
  { i: 32, patch: ['v-if="detail.activity && ruleText"', 'v-if="detail.activity"'] },
  // F7 三条样件各治一种坏法：整段又随拼团收掉（用户点名的原点）/ 参团那一档漏带留言 / 积分行退回不吃拼团档
  { i: 33, patch: ['<template v-if="!isSendFriend">\n        <tz-divider bgColor="#fafafa" />', '<template v-if="!isSendFriend && !isGroupBuy">\n        <tz-divider bgColor="#fafafa" />'] },
  // 2026-10-29 建单体多了 count / address_id / coupon_id（多规格 + 收货地址 + 拼团用券）：样件改摘买家留言那一行
  { i: 34, patch: ['                        buyer_remark: remark,\n', ''] },
  { i: 35, patch: ['v-if="!isGroupBuy && data.score_amount"', 'v-if="data.score_amount"'] },
  // F8 两条样件：把「已参与」那句换成别的 / 摘掉在途锁
  { i: 36, patch: ["content: '你已参与该团'", "content: '拼团'"] },
  { i: 37, patch: ['if (that.submitting) { return; }', ''] },
  // J 组四条各配一颗样件，一条治一环（不发 page / 拿行数当总数 / 尾部没有上拉那一行 / 到底那一跳断在跨组件边界）
  { i: 52, patch: ['{ activity_id: this.activity.activity_id, page: page, limit: 10 }', '{ activity_id: this.activity.activity_id, limit: 10 }'] },
  { i: 53, patch: ['this.teamsTotal = Number(d.total) || 0;', 'this.teamsTotal = rows.length;'] },
  { i: 54, patch: ['<u-loadmore :status="teamsLoadStatus"', '<u-loadmore-zz :status="teamsLoadStatus"'] },
  { i: 55, patch: ["@lower=\"$emit('load-more')\"", "@lower=\"$emit('tap')\""] },
  { i: 55, patch: ['@load-more="loadMoreTeams"', '@load-more2="loadMoreTeams"'] },
  // K 组：横幅样式整档退回白底
  { i: 56, patch: ['background: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);', 'background: #fff;'] },
  // L 组六条各配一颗样件（阶梯起价 / 邀新条 / 到期撤区 / 安全区 / 秒级续跑 / joinFirst 当前页）
  // i57 原来把 `lowestLadder` 的返回退回取 a：同一行里 `pb < pa` 还在，L1 的
  // `/Math\.min|pb < pa/` 依旧命中 ⇒ 恒绿。改成摘「起」那一枚的类名（L1 的另一条判据）。
  { i: 57, patch: ['class="gba-rise"', 'class="gba-rise-x"'] },
  { i: 58, patch: ['>仅限新用户参团{{ inviteMinText }}<', '>新人专享{{ inviteMinText }}<'] },
  { i: 59, patch: ['that.expired = true;', 'that.expired = false;'] },
  { i: 60, patch: [':safeAreaInsetBottom="false"', ':safeAreaInsetBottom="true"'] },
  { i: 61, patch: ['this.timer = setInterval(function tick() {', 'this.timer = setTimeout(function tick() {'] },
  { i: 62, patch: ['const team = this.teams[start] || this.teams[0];', 'const team = this.teams[0];'] },
  // M 组四条各配一颗样件（2026-10-30 拼团一整块连着放）：宿主又把横幅挂回价格格 / 拼团区又收一份 `hide-banner` /
  // 宿主自己另开一条 group_buy 取数链 / 拼团区那张卡又有了内衬（横幅不再贴边）
  { i: 63, patch: ['<div class="course-info">', '<div class="course-info"><tz-group-buy-banner :activity="gbEntry && gbEntry.activity" />'] },
  { i: 64, patch: ['<tz-group-buy-banner :activity="activity" />', '<tz-group-buy-banner v-if="!hideBanner" :activity="activity" />'] },
  { i: 65, patch: ["this.gbEntry = entry;", "this.gbEntry = entry; this.$api('group_buy.activity.detail', {});"] },
  { i: 66, patch: ['<tz-box padding="0" v-if="installed && activity && !expired">', '<tz-box padding="10px 15px" v-if="installed && activity && !expired">'] },
  // K2：底栏那枚按钮退回旧纯色（与横幅那条渐变分叉）
  { i: 67, patch: ['color="linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)"', 'color="#f53f3f"'] },
  // M5/M6/M7 各配一颗样件（横幅满宽 / 标题行左内衬 / 玩法块不许再有下沿发丝线）
  { i: 68, patch: ['    width: 100%;\n    box-sizing: border-box;\n    padding: 12px 15px;', '    padding: 12px 15px;'] },
  { i: 69, patch: ['padding: 15px 36px 12px 16px;', 'padding: 15px 36px 12px;'] },
  // 2026-10-30：M7 换口径（线整条不要）⇒ 样件改成「把那条线加回来」
  { i: 70, patch: ['    padding: 12px 15px;\n}', '    padding: 12px 15px;\n    border-bottom: 1px solid #f2f3f5;\n}'] },
  // M8：退回「无数据就拿 res.msg 当原因」那一版（用户读到的就是「提示获取成功」）
  { i: 71, patch: ['const msg = (res && res.code !== 1 && res.msg)', 'const msg = (res && res.msg)'] },
  // G2：2026-10-30 join 六枚 props 里摘掉一枚 ⇒ 组件 props 清单与判据不符（新行为不能悄悄只加在一处）
  { i: 72, patch: ['joinTeam: { type: Number, default: 0 },', ''] },
];

if (process.argv.indexOf('--can-be-red') > -1) {
  let red = 0;
  const truthy = results.filter((r) => r.pass).length;
  NEGATIVES.forEach((n) => {
    const [from, to] = n.patch;
    const files = [[MOD_FILE, from, to], [POPUP_FILE, from, to], [AREA_FILE, from, to], [BANNER_FILE, from, to],
      [GBB_FILE, from, to], [COURSE_FILE, from, to], [COURSE_JS, from, to], [COURSE_CSS, from, to],
      [BOARD_FILE, from, to], [SUBMIT_FILE, from, to], [DETAIL_FILE, from, to]].concat(HOSTS.map((h) => [h, from, to]));
    const hit = files.find((f) => read(f[0]).indexOf(f[1]) > -1);
    if (!hit) { console.log('[SKIP] 反例样件没落点：' + from); return; }
    const orig = read(hit[0]);
    if (orig.indexOf(hit[1]) < 0) { console.log('[SKIP] 样件不匹配：' + hit[1]); return; }
    fs.writeFileSync(path.join(ROOT, hit[0]), orig.replace(hit[1], hit[2]));
    let broke = false;
    try {
      const out = require('child_process').execSync('node ' + path.join(__dirname, 'check-group-buy-popup.js'), { encoding: 'utf8' });
      broke = /失败 [1-9]/.test(out);
    } catch (e) { broke = true; }
    fs.writeFileSync(path.join(ROOT, hit[0]), orig);
    if (broke) red++; else console.log('[恒绿] 第 ' + (n.i + 1) + ' 条反例没让任何判据变红 —— 该条是虚断言');
  });
  console.log('\n能红 ' + red + ' / ' + NEGATIVES.length + '，本轮正例通过 ' + truthy + '/' + results.length);
  process.exit(red >= Math.min(NEGATIVES.length, truthy) ? 0 : 1);
}

let fail = 0;
results.forEach((r) => {
  if (!r.pass) fail++;
  console.log((r.pass ? '[PASS] ' : '[FAIL] ') + r.name + (r.note ? ' — ' + r.note : ''));
});
console.log('\n共 ' + results.length + ' 条，失败 ' + fail + ' 条');
process.exit(fail ? 1 : 0);
