/**
 * 直播间弹层「底部安全区只挂一份」这一族的机器验法（硬约束 26：一类界面偏离被点名时先补机器化验法）
 *
 * 跑法：node tuzi-mobile/scripts/check-live-popup-safe-area.js
 *
 * 背景（2026-10-01 用户点名「iPhoneX 机型打开页面时，邀请达人榜、分享有礼模块相关的弹窗
 * 底部安全距离都太大了，参考其他的 popup 组件进行优化处理」）：
 * 这一族九只弹层当年照 App.vue 的 `.school-popup`（**页面模板**里的弹层档）抄了面板内衬，
 * 写成 `padding-bottom: calc(20px + env(safe-area-inset-bottom))`——固定内衬与安全区叠在一起。
 * iPhone X（H5）下 20 + 34 = 54px，比同屏礼物/商品弹层（内容自带 10px + 安全区 34px = 44px）
 * 明显多一截；微信小程序端 20 + 17 = 37px。
 * 全站弹层组件的主流档（campus/course/option/student-select-popup、package-sku-select-modal、
 * contact-popup、checkin-course-modal、playback-video…）是**面板只挂一份安全区**，
 * 底部那一格内衬由内容最后一块自己给。
 *
 * 钉五件事（每只弹层各一组）：
 *   ① 面板里不再有「固定内衬 + 安全区」的叠加写法（含微信减半那一条）；
 *   ② 面板自己那一份安全区在（env/constant 各一条 + 微信端减半两条），且写在简写之后能盖住它；
 *   ③ u-popup 自带的那一份仍然关着（:safeAreaInsetBottom="false"）——开着就又是叠加；
 *   ④ 底部那一格内衬由内容最后一块自己给（按钮行 padding-bottom / 滚动画布 padding="0 0 12px"），
 *      落在 8~16 这一档：小于 8 会贴边，大于 16 又回到被点名的那一档；
 *   ⑤ 自己把几何算一遍报出来：iPhone X = 内容内衬 + 34，必须落在 44~50（不许贴边、不许回到 54）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');

/** 八只弹层：文件 / 面板类 / 最后一块由谁带底部内衬（foot = 按钮行，list = 滚动画布）
        （2026-10-06 受邀人那张「助力成功」弹窗 assist-tip.vue 整层删除，清单随之少一档） */
const POPUPS = [
  { file: 'pages/course/live/invite-rank/board-list.vue', panel: 'irb', last: 'foot', lastCls: 'irb-foot' },
  { file: 'pages/course/live/invite-rank/my-invite.vue', panel: 'irm', last: 'list' },
  { file: 'pages/course/live/invite-rank/rule-modal.vue', panel: 'irr', last: 'list' },
  { file: 'pages/course/live/share-gift/activity-list.vue', panel: 'sgl', last: 'list' },
  { file: 'pages/course/live/share-gift/activity-detail.vue', panel: 'sgd', last: 'foot', lastCls: 'sgd-foot' },
  { file: 'pages/course/live/redpacket/records-modal.vue', panel: 'rp-rec', last: 'list' },
  // 2026-10-03 组件由 share-gift-claim 改名为 prize-claim（奖品能力升入标准版），
  // 那一行没跟着改 → 这个脚本读文件时 ENOENT 直接崩，整条安全区门禁跟着失效
  { file: 'components/tz/prize-claim.vue', panel: 'sgc', last: 'foot', lastCls: 'sgc-foot' },
  { file: 'components/tz/share-poster.vue', panel: 'sh-sheet', last: 'foot', lastCls: 'sh-btns' },
];

/** iPhone X（H5）底部安全区实测值；微信小程序端按全站口径减半 */
const SAFE_H5 = 34;
const SAFE_MP = 17;

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/** 注释先剥掉：档位注释里大量点名别的类名与旧数值，不剥会把注释当代码量 */
const styleOf = (src) => {
  const i = src.indexOf('<style');
  return (i < 0 ? '' : src.slice(i)).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
};
const blockOf = (css, cls) => (css.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0];
const decl = (block, prop) => {
  const m = new RegExp('(?:^|[;{\\s])' + prop + '\\s*:\\s*([^;{}]+)').exec(block);
  return m ? m[1].trim() : '';
};

POPUPS.forEach((p) => {
  const src = read(p.file);
  const css = styleOf(src);
  const panel = blockOf(css, p.panel);
  const tag = path.basename(p.file) + '（' + p.panel + '）';

  /* ① 不再有「固定内衬 + 安全区」的叠加 */
  ok(`${tag} 面板不再把固定内衬与安全区叠着写`, !/padding-bottom:\s*calc\(\s*\d+px\s*\+/.test(panel),
    (panel.match(/padding-bottom:[^;]*;/g) || []).join(' | '));

  /* ② 面板自己那一份安全区在，且四条齐全（env/constant 各一条 + 微信端减半两条） */
  ok(`${tag} 面板挂着那一份安全区（env 一条）`, /padding-bottom:\s*env\(safe-area-inset-bottom\)\s*;/.test(panel));
  ok(`${tag} 面板挂着 constant 兼容那一条`, /padding-bottom:\s*constant\(safe-area-inset-bottom\)\s*;/.test(panel));
  ok(`${tag} 微信端减半那一条在`, /padding-bottom:\s*calc\(env\(safe-area-inset-bottom\)\s*\/\s*2\)\s*;/.test(panel));
  /* 简写里带的底部值必须被上面那条盖住：padding-bottom 出现在 padding 简写之后 */
  const shorthandAt = panel.indexOf(decl(panel, 'padding') ? 'padding:' : 'padding:');
  const bottomAt = panel.indexOf('padding-bottom:');
  ok(`${tag} 安全区那一条写在简写之后（简写里的底部值要让位给它）`,
    shorthandAt > -1 && bottomAt > shorthandAt, `简写 @${shorthandAt} / padding-bottom @${bottomAt}`);

  /* ③ u-popup 自带那一份仍关着 */
  ok(`${tag} u-popup 自带的安全区仍关着（开着就又是叠加）`, /:safeAreaInsetBottom="false"/.test(src));

  /* ④ 底部那一格内衬由内容最后一块自己给，落在 8~16 */
  let inset = 0;
  let from = '';
  if (p.last === 'foot') {
    inset = parseInt(decl(blockOf(css, p.lastCls), 'padding-bottom'), 10) || 0;
    from = `.${p.lastCls} 的 padding-bottom`;
  } else {
    const m = /<tz-popup-list[^>]*\spadding="([^"]*)"/.exec(src);
    const v = m ? m[1].trim() : '';
    inset = parseInt((/([\d.]+)px\s*$/.exec(v) || [0, '0'])[1], 10) || 0;
    from = `tz-popup-list 的 padding="${v}"`;
  }
  ok(`${tag} 底部内衬由内容最后一块自己给（${from}）`, inset >= 8 && inset <= 16, `实得 ${inset}px`);

  /* ⑤ 几何自己算一遍：iPhone X = 内容内衬 + 34，微信端 = 内容内衬 + 17 */
  const h5 = inset + SAFE_H5;
  const mp = inset + SAFE_MP;
  ok(`${tag} iPhone X 底部总留白落在 44~50px（不许贴边、不许回到 54）`, h5 >= 44 && h5 <= 50, `实算 ${h5}px（原 54）`);
  ok(`${tag} 微信小程序端底部总留白落在 25~31px`, mp >= 25 && mp <= 31, `实算 ${mp}px（原 37）`);
});

/* 全族一句：这一族九只弹层必须同一份写法，不许又出现一只自己抄一份 */
const allPanels = POPUPS.map((p) => blockOf(styleOf(read(p.file)), p.panel)).join('\n');
ok('全族面板写法一致（安全区那一份逐字相同：简写之后四条同值）',
  (allPanels.match(/padding-bottom:\s*env\(safe-area-inset-bottom\)\s*;/g) || []).length === POPUPS.length,
  `命中 ${(allPanels.match(/padding-bottom:\s*env\(safe-area-inset-bottom\)\s*;/g) || []).length} / ${POPUPS.length}`);

let fail = 0;
results.forEach((r) => {
  if (!r.pass) fail++;
  console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.name}${r.note ? ' — ' + r.note : ''}`);
});
console.log(`\n共 ${results.length} 条，失败 ${fail} 条`);
process.exit(fail ? 1 : 0);
