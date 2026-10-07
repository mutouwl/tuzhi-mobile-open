/**
 * 直播间「邀请达人榜」弹层这一族版式的机器验法（硬约束 26：一类界面偏离被点名时先补机器化验法；
 * 硬约束 29：给行/块加有色底是成组交付物，压在那个底上的每一档都要跟着换色系）。
 *
 * 跑法：node tuzi-mobile/scripts/check-invite-rank-board.js
 *
 * 钉的是这两轮用户点名的十件事里、静态正则判得出的那些：
 *   ① 三枚徽标各吃一档金/银/铜，且逐档自己算 WCAG 对比（≥4.5），不靠"看着挺清楚"；
 *   ② 列表里「我」那一行铺浅蓝底后，压在这块底上的每一档文字/标记都换成了蓝族（冷灰 #86909c 压在上面只有 3.1:1）；
 *   ③ 行内项与项的间距只由行容器的 gap 给（硬约束 20：给某一项写 margin-left，它一 v-if 收起就成了下一项的左偏移）；
 *   ④ 「我」标记排在邀请人数左侧——右缘那个数是这一行唯一右对齐的；
 *   ⑤ 底部条两档同一份骨架，头像/昵称常显、名次与人数不互相顶走；
 *   ⑥ 分页与下拉刷新那一整条接线（弹层内滚动画布 → board-list → invite-rank-entry → 接口），
 *      这一族纯看接线、通用正则看不见跨组件边界，落在页面脚本里（同 check-redpacket-records.js 的做法）；
 *   ⑦ 昵称脱敏那一族（单一真源、无自有实现、三处读点都不漏）;
 *   ⑧ 2026-10-04 那一轮四条：选中行的左右内衬（表头/骨架/真实行三处同值 M32）、底部条两组
 *      「label + value」（label 比 value 小一号轻一档、不拼字符串 M22、人数是 0 也照写）、
 *      状态 Tag 搬到标题右侧（文案与是否进行中都吃后端字段、活动段不留第二处）、
 *      截止时间并进「立即分享」那一行（吃后端现成字符串，前端不 new Date()）。
 *   ⑨ 2026-10-01 两条点名：前三张卡底色从一块中性灰改金银铜（换底色＝成组交付物，压在卡底上的
 *      徽标 / 昵称 / 邀请人数 / 头像占位块四档全部同族派生并逐档算对比，基类不再兜灰）、
 *      「立即分享」定宽 120px（不再通栏 flex:1，右缘对齐交给容器的 space-between）。
 *   ⑩ 2026-10-05 三条点名：规则入口从活动段搬到标题行且排在「我的邀请」左侧（搬走了不留第二处）、
 *      关掉 u-popup 右上角那枚关闭图标并撤掉给它预留的右 26、奖品档位清单可折叠/展开
 *      （折着露 3 行、超出才出「查看更多 / 收起」、同一枚按钮两态、纯本地不发请求）。
 *   ⑪ 2026-10-05 第四条点名：「查看活动规则」弹窗里也要显示同一块奖品面板。⇒ 硬约束 11
 *      （同一组字段出现在两个界面必须抽一份字段组组件）：档位行 / 空态句 / 「查看更多 / 收起」/
 *      折叠档 / 判据 / 配色只写在 prize-list.vue 一份，榜单与规则弹层各挂一枚同一组件，
 *      两处都不许再自带第二份（照抄一份的那一屏，下一次改折叠档或改判据就会两边不一致）。
 *   ⑫ 2026-10-05 第五条点名：「如果活动规则是空的，那么活动规则弹窗中可以显示空状态提醒」。
 *      规则入口的显隐判据从 show_rule 换成后端 run_state_key（复用 acting，不另算活动状态）：
 *      原判据把「运营勾没勾规则」当前置门，没勾就整枚收掉 ⇒ 弹层点不开 ⇒ 弹层里那句 u-empty
 *      是一段永远读不到的死代码。空态那一格照参照页 share-gift/activity-detail.vue 的
 *      .sgd-friend-none 补 padding 40/0/48（u-empty 根节点自带 margin:100px !important）。
 *   ⑬ 2026-10-06 点名：「参与用户只有 3 个的话，前三位不要用领奖台风格，直接使用列表；
 *      4 个或 4 个以上再显示当前的格式」。判据吃后端下发的 total（>3 才出三张卡），
 *      podium 与 listRows 共用同一根：收了卡下面那张表就从第 1 名排到底，出卡就从第 4 名接上。
 *      这一组是**把组件里 usePodium / podium / listRows 三枚 computed 的真身取出来实跑**的七态矩阵
 *      （0/1/2/3/4/20 第一页/20 第二页），正则圈不出「哪一档少了几行」——
 *      实测把判据换成 top.length 会立刻红 6 条（四位以上那一档退化成列表 + 列表首行名次错位），
 *      这一组不是只会自我确认的门禁。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const board = read('src/pages/course/live/invite-rank/board-list.vue');
const rule = read('src/pages/course/live/invite-rank/rule-modal.vue');
const prize = read('src/pages/course/live/invite-rank/prize-list.vue');
const entry = read('src/pages/course/live/invite-rank/invite-rank-entry.vue');
const popupList = read('src/components/tz/popup-list.vue');

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/* ---------- 工具：从 CSS 里取一条声明 / 一个类块 ---------- */
/** 注释先剥掉：这一份里大量档位注释会点名别的类名（照哪个参照页抄），
    不剥就会把注释里那一处当成类块取出来，量出来的还是真块，断言却永远失败 */
const tplOf = (src) => src.slice(0, src.indexOf('<script')).replace(/<!--[\s\S]*?-->/g, '');
const boardTpl = tplOf(board);
/** JS 段注释先剥：脱敏那一节断的是实现，不是注释里那一行示例（不剥的话每一条都命中注释，等于门禁自己给自己放水） */
const boardJs = board.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const styleOf = board.slice(board.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const blockOf = (cls) => (styleOf.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0];
/* 同一套取法也给另外两份（prize-list / rule-modal）各备一份：奖品面板第 ⑩③ 组与第 ⑪ 组
   的断言要读面板自己的样式与判据，规则弹层要读它自己的挂点——都剥注释，都不牵连 board */
const jsOf = (src) => src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const styleIn = (src) => src.slice(src.indexOf('<style')).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
const prizeTpl = tplOf(prize);
const prizeJs = jsOf(prize);
const prizeStyle = styleIn(prize);
const prizeBlock = (cls) => (prizeStyle.match(new RegExp('\\.' + cls + '(?![\\w-])[^{]*\\{[\\s\\S]*?\\}')) || [''])[0];
const ruleTpl = tplOf(rule);
const ruleJs = jsOf(rule);
const decl = (block, prop) => {
  const m = new RegExp('(?:^|[;{\\s])' + prop + '\\s*:\\s*([^;{}]+)').exec(block);
  return m ? m[1].replace(/\s*!important$/, '').trim() : '';
};
const hex = (v) => {
  const m = /^#([0-9a-f]{6})$/i.exec(String(v).trim());
  return m ? [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)) : null;
};
/** WCAG 相对亮度与对比度（只吃 #rrggbb；本族没有半透明叠底那一类） */
const lum = (rgb) => rgb.map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))).reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (fg, bg) => {
  const a = lum(hex(fg)), b = lum(hex(bg));
  if (!a || !b) return 0;
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

/** 按两处标记切一段源码出来：嵌套节点里正则的第一处 </view> 会把段落切在半截，切不出真实结构 */
const cut = (src, from, to) => {
  const i = src.indexOf(from);
  const j = i > -1 ? src.indexOf(to, i) : -1;
  return i > -1 && j > -1 ? src.slice(i, j) : '';
};
/** padding 简写里的左右内衬那一枚：'0 16px 20px' → 16、'14px 8px' → 8 */
const sideOf = (v) => parseInt((/^[^\s]+\s+(\d+)px/.exec(String(v || '')) || [0, '0'])[1], 10);

const tier = (n) => {
  const b = blockOf('irb-pod-badge--r' + n);
  return { bg: decl(b, 'background'), fg: decl(b, 'color') };
};

/* ================= ① 三枚徽标各吃一档金/银/铜 ================= */
const gold = tier(1), silver = tier(2), bronze = tier(3);
ok('TOP1/2/3 三枚徽标各有一档类（不共用一块底）', !!gold.bg && !!silver.bg && !!bronze.bg);
ok('三档底色互不相同', gold.bg !== silver.bg && silver.bg !== bronze.bg && gold.bg !== bronze.bg);
ok('三档文字互不相同', gold.fg !== silver.fg && silver.fg !== bronze.fg && gold.fg !== bronze.fg);
ok('三档类名只由后端下发的 rank 拼出（前端不自己排名次，M22）', /'irb-pod-badge--r' \+ item\.rank/.test(board) && /'irb-pod', 'irb-pod--r' \+ item\.rank/.test(board));
ok('没有把名次当数组下标自己算', !/podium\[/.test(board) && !/index\s*\+\s*1\s*===/.test(board));
[['TOP1 金', gold, 4.5], ['TOP2 银', silver, 4.5], ['TOP3 铜', bronze, 4.5]].forEach(([name, t, min]) => {
  const r = ratio(t.fg, t.bg);
  ok(`${name} 徽标对比 ≥ ${min}:1`, r >= min, `实算 ${r.toFixed(2)}:1（${t.fg} on ${t.bg}）`);
});
ok('徽标走浅底深字那一档（不是深底白字——银那一档深底白字只有 2.2:1）', hex(gold.fg)[0] < 160 && hex(silver.fg)[0] < 160 && hex(bronze.fg)[0] < 160);
ok('徽标底不取竞品的橙渐变（M6 底色分块那一档：全局档＝白底直角浅底）', !/linear-gradient/.test(blockOf('irb-pod-badge')) && !/#f5a623|#fac858|#ff7d00/.test(styleOf));

/* ================= ② 列表里「我」那一行：浅蓝底 + 每一档换色 ================= */
const meRow = blockOf('irb-row--me');
ok('列表行有「我」那一档的高亮底（用后端下发的 is_me 判）', /background:\s*#e8f4ff/.test(meRow) && /item\.is_me \? 'irb-row--me' : ''/.test(board));
/* 2026-10-04 用户点名「这个蓝色的背景宽度应该再拓展一下，或者说增加一些左右边距，
   因为现在这个数字贴到边框了」；2026-10-03 用户**第二次**点名同一处「并未给背景增加内边距，
   导致左侧的排序与右侧的邀请人数贴住了背景的左右边」。
   上一版把整张表内缩到 24 就收手了，可高亮那一行的 padding 也只写了 24 ——
   **24 恰好等于出血量，等于刚补回负 margin 就停下，行自身那 8px 根本没加回来**，
   于是内容落在 24-24+16 = 16px，比上下每一行少 8px：既贴边、又与上下行错列。

   ⚠ 本组原先断言 `bandInset === panelSide + rowSide`（24 === 16+8）—— 验的是**普通行**的
   名义内缩量，不是高亮行的真实内缩量，所以 bug 在的时候照样全绿。
   真实几何：内容左缘 = 面板内衬 - 出血 + 行内 padding。下面全部按真实量断言。 */
const panelSide = sideOf(decl(blockOf('irb'), 'padding'));
const rowSide = sideOf(decl(blockOf('irb-row'), 'padding'));
const colsSide = sideOf(decl(blockOf('irb-cols'), 'padding'));
const skSide = sideOf(decl(blockOf('irb-sk-row'), 'padding'));
const bandBleed = Math.abs(parseInt(/-(\d+)px/.exec(decl(meRow, 'margin')) || [0, '0'], 10));
const bandInset = sideOf(decl(meRow, 'padding'));
/** 高亮行内容距「可见底色边」的真实距离（负 margin 把盒子推出去了，内衬要连它一起补回来） */
const meContentSide = bandInset - bandBleed + panelSide;
ok('高亮底仍通栏出血（负 margin 存在，内容靠行内 padding 补回，左右仍与其它行齐平）', bandBleed > 0 && bandInset > 0,
  `出血 ${bandBleed}px / 内衬 ${bandInset}px`);
ok('出血量 == 面板左右内衬 + 行内这一档（底色正好通栏，多出的由面板 overflow 裁掉）',
  bandBleed === panelSide + rowSide, `出血 ${bandBleed} = 面板 ${panelSide} + 行内 ${rowSide}`);
/** 2026-10-04 与 2026-10-03 连续两次点名的那一条：行内 padding 必须 = 出血 + 行内那一档。
    只写「出血」那一档（=24）会把内容退化成 16px 的贴边行，且比上下行少 8px。 */
ok('高亮行内衬 = 出血 + 行内那一档（不是只补回负 margin；2026-10-03 第二次点名「贴住背景左右边」）',
  bandInset === bandBleed + rowSide,
  `内衬 ${bandInset}，应为 出血 ${bandBleed} + 行内 ${rowSide} = ${bandBleed + rowSide}`);
ok('高亮行内容距底色边 == 普通行的名义内缩量（与上下各行齐平，不错列）',
  meContentSide === panelSide + rowSide,
  `实得 ${meContentSide}px，普通行 ${panelSide + rowSide}px`);
ok('右缘那一列离面板边 ≥ 20px（2026-10-04「数字贴到边框了」，2026-10-03 复发；退回去只有 16）',
  meContentSide >= 20, `实得 ${meContentSide}px`);
ok('表头 / 骨架 / 真实行三处左右内衬同值（M32 三处同值，改一处必须三处一起改）',
  colsSide === rowSide && skSide === rowSide, `表头 ${colsSide} / 骨架 ${skSide} / 行 ${rowSide}`);
ok('三处内衬确实比面板自身的内衬大（加内衬这件事真的做了，不是原地不动）', rowSide > 0 && panelSide + rowSide > panelSide);
ok('高亮行里没有 v-if 自锁（判据吃后端下发的 is_me，不吃"列表非空"那一族）', !/is_me\s*&&\s*\w+\.length/.test(board));

const meBg = decl(meRow, 'background');
const tiersOnMe = [
  ['名次', blockOf('irb-row--me irb-no') || (/\.irb-row--me\s+\.irb-no\s*\{[\s\S]*?\}/.exec(styleOf) || [''])[0]],
  ['昵称与邀请人数', (/\.irb-row--me\s+\.irb-name,[\s\S]*?\}/.exec(styleOf) || [''])[0]],
];
tiersOnMe.forEach(([name, b]) => ok(`高亮行里「${name}」那一档已换成蓝族深色`, !!b && /color:\s*#[0-9a-f]{6}/i.test(b)));
const meNoColor = decl((/\.irb-row--me\s+\.irb-no\s*\{[\s\S]*?\}/.exec(styleOf) || [''])[0], 'color');
const meTextColor = decl((/\.irb-row--me\s+\.irb-name,[\s\S]*?\}/.exec(styleOf) || [''])[0], 'color');
ok('高亮行里「名次」对比 ≥ 4.5:1', ratio(meNoColor, meBg) >= 4.5, `实算 ${ratio(meNoColor, meBg).toFixed(2)}:1（${meNoColor} on ${meBg}）`);
ok('高亮行里「昵称/人数」对比 ≥ 4.5:1', ratio(meTextColor, meBg) >= 4.5, `实算 ${ratio(meTextColor, meBg).toFixed(2)}:1（${meTextColor} on ${meBg}）`);
ok('全站冷灰 #86909c 不再压在这块底上（原来只有 3.1:1，硬约束 29①）', !new RegExp('\\.irb-row--me[^{}]*\\{[^{}]*#86909c', 'i').test(styleOf) && meNoColor.toLowerCase() !== '#86909c');
ok('主色蓝 #0968f6 不再压在这块底上（原来只有 2.6:1）', meNoColor.toLowerCase() !== '#0968f6' && meTextColor.toLowerCase() !== '#0968f6');

const meTag = blockOf('irb-me-tag');
ok('「我」标记底/字 ≥ 4.5:1', ratio(decl(meTag, 'color'), decl(meTag, 'background')) >= 4.5, `实算 ${ratio(decl(meTag, 'color'), decl(meTag, 'background')).toFixed(2)}:1`);
ok('「我」标记在白行上也读得出来', ratio(decl(meTag, 'color'), '#ffffff') >= 4.5, `实算 ${ratio(decl(meTag, 'color'), '#ffffff').toFixed(2)}:1（压在白行上）`);
ok('「我」标记与高亮行底色分得开（不是同一块底贴在一起）', decl(meTag, 'background').toLowerCase() !== meBg.toLowerCase());
ok('白面板上的档位不跟着换色（表头「排名/成员/邀请人数」仍是冷灰那一档，硬约束 29④）', /color:\s*#86909c/.test(blockOf('irb-cols')));

/* ================= ③ 行内间距只由容器 gap 给 ================= */
const rowBlock = blockOf('irb-row');
ok('排行行用 gap 给项间距', /gap:\s*10px/.test(rowBlock));
ok('行内没有哪一项自带 margin-left（v-if 收起后会变成下一项的左偏移）', !/margin-left/.test(rowBlock));
ok('头像不再自带左右 margin（原来那 10px 已并进容器的 gap）', !/margin/.test(blockOf('irb-avatar')));
ok('「我」标记不再自带 margin-left（已并进容器的 gap）', !/margin-left/.test(meTag));
ok('右缘那个「邀请人数」由内容定宽（flex:none），不吃掉昵称的余量', /flex:\s*none/.test(blockOf('irb-num')) && /flex:\s*1/.test(blockOf('irb-name')));
/* gap 改了以后骨架必须还对得上：名次列 28 + gap10 = 头像左边，与原来"28 + 头像自带 10"同值 */
ok('骨架行的横向几何仍与真实行一致（名次 16 + 右距 12 = 28 列宽）', /width:\s*16px/.test(blockOf('irb-sk-no')) && /margin-right:\s*12px/.test(blockOf('irb-sk-no')));

/* ================= ④ 「我」标记排在邀请人数左侧 ================= */
const rowTpl = (board.match(/<view :class="\['irb-row'[\s\S]*?<\/view>\s*\n\s*<u-empty/) || [''])[0];
ok('「我」标记在模板里排在邀请人数之前', rowTpl.indexOf('irb-me-tag') > -1 && rowTpl.indexOf('irb-me-tag') < rowTpl.indexOf('irb-num'));
ok('「我」标记只由后端下发的 is_me 出（不给本地缓存拼身份，M22）', /class="irb-me-tag" v-if="item\.is_me"/.test(board));
ok('邀请人数永远渲染（不许 v-if 那一支把 0 藏掉）', /<text class="irb-num">\{\{ item\.invite_num \}\}<\/text>/.test(board) && !/v-if="item\.invite_num"/.test(board));

/* ================= ⑤ 底部条两档同一份骨架 ================= */
const bar = blockOf('irb-me-bar');
ok('底部条用 gap 给项间距（不再靠两项各自的 margin-left）', /gap:\s*10px/.test(bar));
ok('底部条不再有「暂未上榜」那一档的独立分支（两档同一份骨架，注释里可以留这句口径）', !/irb-me-state/.test(board) && !/暂未上榜/.test(tplOf(board)));
ok('底部条常显头像与昵称（已上榜那一档也摆这两件）', /<image class="irb-me-avatar"/.test(board) && /<text class="irb-me-name">\{\{ meName \}\}<\/text>/.test(board));
ok('底部条的名次段只由后端下发的 on_board 出', /<view class="irb-me-stat" v-if="meOnBoard">/.test(board) && /meOnBoard\(\)\s*\{\s*return !!\(this\.me && this\.me\.on_board\)/.test(board));
ok('底部条的名次不自己折算（吃后端下发的 me.rank，M22）', /meRank\(\)\s*\{[\s\S]{0,160}this\.me && this\.me\.rank/.test(board));
const statBox = blockOf('irb-me-stat');
const labelBox = blockOf('irb-me-stat-label');
const valBox = blockOf('irb-me-stat-val');
ok('底部条的名次组与人数组都定宽（名次再大也不顶走右缘的人数）', /flex:\s*none/.test(statBox) && /flex:\s*none/.test(valBox));
ok('底部条的余量由昵称吃（右缘对齐靠它，不靠 text-align:right）', /flex:\s*1/.test(blockOf('irb-me-name')) && !/text-align:\s*right/.test(valBox));
ok('底部条的人数是 0 也照写（走把 null/0 收成数字的 computed）', /<text class="irb-me-stat-val">\{\{ meInviteNum \}\}<\/text>/.test(board) && /meInviteNum\(\)\s*\{/.test(board));
/* 2026-10-04 用户点名「邀请人数也显示一下，label 的大小和粗细比这个数值小一点」：
   两组都是「label + value」两枚节点——label 是写死的静态文案、value 吃后端下发的那两枚数，
   分开渲染而不是拼成一句话（M22：前端不拼后端算好的名次，也不把 0 拼没） */
ok('名次一组与邀请人数一组都是 label / value 两枚节点', (boardTpl.match(/class="irb-me-stat-label"/g) || []).length === 2 &&
  (boardTpl.match(/class="irb-me-stat-val"/g) || []).length === 2);
ok('两个 label 都是写死的静态文案、两个 value 各吃一枚后端字段', /<text class="irb-me-stat-label">我的排名<\/text>/.test(board) &&
  /<text class="irb-me-stat-label">邀请人数<\/text>/.test(board) &&
  /<text class="irb-me-stat-val">第 \{\{ meRank \}\} 名<\/text>/.test(board));
ok('不在模板里拼字符串（名次/人数前后不许用 + 连接，M22）',
  !/\{\{[^}]*\+\s*(meRank|meInviteNum)/.test(boardTpl) && !/\{\{[^}]*\1/.test(boardTpl));
ok('人数那一组常显、上面不带 v-if（是 0 也照写；v-if 那支会把 0 藏掉）',
  /<view class="irb-me-stat">\s*<text class="irb-me-stat-label">邀请人数<\/text>/.test(board) && !/v-if="[^"]*"[^>]*class="irb-me-stat"/.test(board));
ok('组内间距只由组容器的 gap 给（不给 label 或 value 写 margin，硬约束 20）',
  /gap:\s*4px/.test(statBox) && !/margin/.test(labelBox) && !/margin/.test(valBox));
const labelPx = parseInt(decl(labelBox, 'font-size'), 10) || 0;
const valPx = parseInt(decl(valBox, 'font-size'), 10) || 0;
const labelW = parseInt(decl(labelBox, 'font-weight'), 10) || 400;
const valW = parseInt(decl(valBox, 'font-weight'), 10) || 400;
ok('label 比 value 小一号（2026-10-04 点名「label 的大小…比这个数值小一点」）', labelPx > 0 && labelPx < valPx, `label ${labelPx}px / value ${valPx}px`);
ok('label 比 value 轻一档（…「粗细比这个数值小一点」）', labelW < valW, `label ${labelW} / value ${valW}`);
ok('label 压在这块浅灰底上 ≥ 4.5:1（硬约束 29①：底色一改，压在它上面的每一档都得算过）',
  ratio(decl(labelBox, 'color'), decl(bar, 'background')) >= 4.5,
  `实算 ${ratio(decl(labelBox, 'color'), decl(bar, 'background')).toFixed(2)}:1（${decl(labelBox, 'color')} on ${decl(bar, 'background')}）`);
ok('value 压在这块浅灰底上 ≥ 4.5:1', ratio(decl(valBox, 'color'), decl(bar, 'background')) >= 4.5,
  `实算 ${ratio(decl(valBox, 'color'), decl(bar, 'background')).toFixed(2)}:1`);
ok('底部条的身份不读本地缓存（M22：读 $tools.cachedUser 的是"我的邀请"那一弹窗）', !/cachedUser/.test(board));
/* 身份两件与名次各过一个 computed：调用点传 null 时模板读点抛的是渲染异常（M26） */
['meOnBoard', 'meRank', 'meName', 'meAvatar', 'meInviteNum'].forEach((c) => ok(`${c} 是个 computed（prop 读点不过 null）`, new RegExp('\\n\\s*' + c + '\\(\\)').test(board)));
ok('兜底头像的 @error 记的是屏幕上那一张，不是回写源字段（M27）', /@error="onAvatarError\(item\)"/.test(board) && /@error="onMeAvatarError"/.test(board) && !/item\.avatar\s*=\s*['"]/.test(board) && /meAvatarFailed/.test(board));

/* ================= ⑥ 分页 / 下拉刷新 / 每次打开重取 ================= */
ok('弹层内滚动画布开着下拉刷新（refresher-enabled 默认 true）', /refresher-enabled="refreshable"/.test(popupList) && /default:\s*true/.test(popupList));
ok('下拉刷新事件回传 refresh', /@refresherrefresh="\$emit\('refresh'\)"/.test(popupList));
ok('上拉到底事件回传 lower', /@scrolltolower="\$emit\('lower'\)"/.test(popupList));
ok('board-list 把这两跳接成组件自己的 refresh / load-more', /@refresh="\$emit\('refresh'\)" @lower="\$emit\('load-more'\)"/.test(board));
ok('组件对外事件全是非原生名（M28①：H5 编译器只单向改模板里的 @tap）', /emits:\s*\['close',\s*'refresh',\s*'load-more',\s*'my',\s*'share'\]/.test(board) && !/emits:[^\]]*'tap'/.test(board));
ok('调用点接了 @refresh 与 @load-more', /@refresh="refreshBoard" @load-more="loadMore"/.test(entry));
ok('下拉刷新回第一页并整份覆盖', /refreshBoard\(\)\s*\{\s*this\.refreshing = true;\s*this\.loadBoard\(1\);/.test(entry));
ok('上拉加载更多取下一页，且没有更多/在途时不发请求', /loadMore\(\)\s*\{\s*if \(!this\.hasMore \|\| this\.loading\) \{ return; \}\s*this\.loadBoard\(this\.page \+ 1\);/.test(entry));
ok('每次打开都重取一次（静默补一次，在途不加转圈，M18⑨g）', /openBoard\(\)\s*\{\s*this\.boardShow = true;[\s\S]{0,200}this\.loadBoard\(\);/.test(entry) && !/openBoard[\s\S]{0,300}(skeleton|骨架)/.test(entry));
ok('列表区的底部分页条按 hasMore 出终态', /loadStatus\(\)\s*\{[\s\S]{0,200}this\.hasMore \? 'loadmore' : 'nomore'/.test(entry));
ok('请求走分页接口并带 page', /rank\.board[\s\S]{0,80}page: target/.test(entry));
ok('第 1 页整份覆盖、第 2 页往后追加（不覆盖、不重复）', /this\.rows = target === 1 \? \(data\.list \|\| \[\]\) : this\.rows\.concat\(data\.list \|\| \[\]\)/.test(entry));

/* ================= ⑦ 昵称脱敏（2026-10-03 用户点名：展示第一个字符，剩下显示成星号） ================= */
ok('两处列表昵称都过脱敏，模板里没有裸插值',
	/class="irb-pod-name">\{\{ maskName\(item\.nickname\) \}\}/.test(board) &&
	/class="irb-name">\{\{ maskName\(item\.nickname\) \}\}/.test(board) &&
	!boardTpl.match(/\{\{\s*item\.nickname\s*\}\}/));
ok('底部条那个昵称也走脱敏，且没有昵称时仍写「我」（自己不打例外：分档要靠 user_id 比对，那是前端算身份，撞 M22）',
	/meName\(\)[\s\S]{0,300}maskNickname\(name\)/.test(boardJs) && /name \? maskNickname\(name\) : '我'/.test(boardJs));
ok('实现取自主包那一份共用工具（不在本组件里另写，全站单一真源见 check-nickname-mask.js）',
	/import \{ maskNickname \} from '@\/common\/utils\/privacy'/.test(boardJs) && !/slice\(0,\s*1\)/.test(boardJs));
ok('三处昵称格仍保留单行截断（脱敏后长度上界只有 4 字符，但不许因此把规则删掉）',
	['irb-pod-name', 'irb-name', 'irb-me-name'].every((c) => /white-space:\s*nowrap/.test(blockOf(c)) && /text-overflow:\s*ellipsis/.test(blockOf(c))));
ok('骨架屏那一格仍是灰块，脱敏是显示态不许顺手动到它（M16/M18）', /class="irb-sk-name"><\/view>/.test(board) && !/irb-sk-name[^>]*>\{\{/.test(board));

/* ================= ⑧ 2026-10-04 四条点名：状态 Tag 与截止时间挪位 ================= */
/* 右端那枚也切进来（切到它的文案为止），才谈得上比「标题 / Tag / 我的邀请」三者的先后 */
const headTpl = cut(boardTpl, '<view class="irb-head">', '我的邀请');
const tagBox = blockOf('irb-state-tag');
const tagOnBox = blockOf('irb-state-tag--on');
ok('状态 Tag 在标题行里，且排在标题右侧、「我的邀请」左侧',
  headTpl.indexOf('irb-title') > -1 && headTpl.indexOf('irb-title') < headTpl.indexOf('irb-state-tag') &&
  headTpl.indexOf('irb-state-tag') > -1 && headTpl.indexOf('irb-state-tag') < headTpl.indexOf('irb-my"'));
ok('标题与 Tag 绑成左组、右端那一枚仍由 space-between 推到最右', /<view class="irb-head-l">/.test(board) && /gap:\s*8px/.test(blockOf('irb-head-l')));
ok('状态用一枚 <text> 那一档，不是胶囊按钮（M17 禁胶囊、按钮只有 tz-button / u-button）', /<text :class="\['irb-state-tag'/.test(board) && !/class="irb-state-tag-btn/.test(board));
ok('Tag 文案吃后端下发的 run_state_text，模板里不自己写「进行中/已结束/未开始/未开启」',
  /\{\{ activity\.run_state_text \}\}/.test(board) && !/进行中|已结束|未开始|未开启/.test(boardTpl));
ok('是否进行中只认后端下发的 run_state_key === "running" 三档键（不拿时间戳自己算，M22）',
  /acting\(\)\s*\{\s*return !!\(this\.activity && this\.activity\.run_state_key === 'running'\);/.test(board) &&
  /acting \? 'irb-state-tag--on' : ''/.test(board));
/* 2026-10-05 用户点名 course 2736「未开启那一枚 Tag 应该是灰色的」：活动关掉时后端 RunState::of()
   照样返回 1（那一档没有截止时间可判），拿 run_state === 1 上色会把未开启染成进行中的蓝。
   管理端两枚 Tag 早按 run_state_key 上色，学员端这一枚要同源 */
ok('上色判据不吃 run_state 那个数字（status=0 时它仍返回 1，会把「未开启」染成进行中的蓝）',
  !/activity\.run_state\) === 1/.test(board) && !/activity\.run_state\s*==\s*1/.test(board) &&
  !/run_state_text\s*===\s*'进行中'/.test(board));
ok('run_state_key 缺键时落回中性灰档，不拿 run_state 猜（老后端也不该染成进行中）',
  /run_state_key === 'running'/.test(board) && /irb-state-tag--on/.test(board));
ok('两档 Tag 各有自己的底与字（不是同一块底套两种图案）',
  decl(tagBox, 'background') && decl(tagBox, 'color') && decl(tagOnBox, 'background') && decl(tagOnBox, 'color') &&
  decl(tagBox, 'background').toLowerCase() !== decl(tagOnBox, 'background').toLowerCase() &&
  decl(tagBox, 'color').toLowerCase() !== decl(tagOnBox, 'color').toLowerCase());
ok('「进行中」那档吃主色那一块浅蓝底，其余三态吃中性档',
  /#e8f1ff|#e8f4ff|#ecf5ff/.test(decl(tagOnBox, 'background')) && /#f2f3f5/.test(decl(tagBox, 'background')));
ok('两档 Tag 的字压在自己的底上 ≥ 4.5:1（硬约束 29①：连标签一起换色系）',
  ratio(decl(tagBox, 'color'), decl(tagBox, 'background')) >= 4.5 && ratio(decl(tagOnBox, 'color'), decl(tagOnBox, 'background')) >= 4.5,
  `中性档 ${ratio(decl(tagBox, 'color'), decl(tagBox, 'background')).toFixed(2)}:1 / 进行中 ${ratio(decl(tagOnBox, 'color'), decl(tagOnBox, 'background')).toFixed(2)}:1`);
ok('Tag 不自带 margin（间距只由标题左组的 gap 给，硬约束 20）', !/margin/.test(tagBox) && !/margin/.test(tagOnBox));
ok('后端没给状态文案时整枚不出（判据吃那枚字段，不摆空壳 Tag）', /v-if="activity\.run_state_text"/.test(board) && !/v-if="acting"/.test(board));
ok('活动段里已经没有状态与截止那一行（搬走了就不留第二处）',
  !/irb-act-line|irb-act-state|irb-act-end/.test(board) && !/截止 \{\{ activity\.end_time_text/.test(board) &&
  (boardTpl.match(/v-if="activity\.run_state_text"/g) || []).length === 1 &&
  (boardTpl.match(/v-if="activity\.end_time_text"/g) || []).length === 1 &&
  (boardTpl.match(/\{\{ activity\.run_state_text \}\}/g) || []).length === 1 &&
  (boardTpl.match(/\{\{ activity\.end_time_text \}\}/g) || []).length === 1);
ok('活动段没有内容时不摆空灰条（显隐判据吃「段里有没有东西」，且只存 prize-list 一份）',
  /actOn\(\)\s*\{[\s\S]{0,400}act\.show_prize == 1/.test(prizeJs) && /status\) !== 1/.test(prizeJs) &&
  !/actOn[\s\S]{0,400}show_rule/.test(prizeJs) && !/actOn/.test(board) && !/actOn/.test(rule));

const footTpl = cut(boardTpl, '<view class="irb-foot">', '@click="$emit(\'share\')"');
ok('截止时间与「立即分享」按钮在同一行（2026-10-04 点名「可以把截止时间放在立即分享按钮中」）',
  /<view class="irb-foot">/.test(footTpl) && /irb-end/.test(footTpl) && /tz-button/.test(footTpl) &&
  footTpl.indexOf('irb-end') < footTpl.indexOf('tz-button'));
ok('那一行是横排、项间距只由容器 gap 给（不给截止文案写 margin，硬约束 20）',
  /display:\s*flex/.test(blockOf('irb-foot')) && /gap:\s*12px/.test(blockOf('irb-foot')) && !/margin/.test(blockOf('irb-end')));
ok('「截止到」是静态前缀 + 后端下发的现成字符串（前端不格式化时间，M22）',
  /截止到 \{\{ activity\.end_time_text \}\}/.test(board) &&
  !/new Date\(|Date\.now|getTime\(\)|toLocaleString|formatTime/.test(boardJs));
ok('没有截止时间时按钮仍由容器的 space-between 顶到右缘（间距只由容器的 gap / space-between 给）',
  /justify-content:\s*space-between/.test(blockOf('irb-foot')) && /<view class="irb-share">/.test(board) && /long/.test(footTpl));
/* 2026-10-01 用户点名「下方的立即分享按钮有点宽，可以压缩下宽度，改为120px」：
   原来是 flex:1 通栏，一颗按钮铺满整个面板下缘。定宽写在这一格上、按钮仍带 long（长按钮＝填满本格），
   尺寸只此一处，调用点不抄。相邻档 100 / 140 报给用户定，不擅自挪 */
ok('「立即分享」定宽 120px（不再是通栏 flex:1）', /width:\s*120px/.test(blockOf('irb-share')) && !/flex:\s*1/.test(blockOf('irb-share')),
  `实得 width ${decl(blockOf('irb-share'), 'width')}`);
ok('按钮那一格定宽、不吃余量（flex:none），横向对齐交给容器的 space-between 而不是给它写 margin（硬约束 20）',
  /flex:\s*none/.test(blockOf('irb-share')) && !/margin/.test(blockOf('irb-share')));
ok('截止文案吃余量并单行截断（按钮定宽后，写死的 flex:none 会把一句长的时间顶出面板、被 overflow:hidden 裁掉）',
  /flex:\s*1/.test(blockOf('irb-end')) && /min-width:\s*0/.test(blockOf('irb-end')) &&
  /text-overflow:\s*ellipsis/.test(blockOf('irb-end')) && !/margin/.test(blockOf('irb-end')));
ok('「立即分享」仍是 tz-button（不自造按钮）', /<tz-button[^>]*text="立即分享"/.test(footTpl));

/* ================= ⑨ 2026-10-01：前三张卡底色改金银铜 + 按钮定宽 ================= */
/* 用户点名「排名一二三的块背景不要是灰色，可以改变为金银铜色」：原来三张共用一块 #f7f8fa 灰底。
   换底色是成组交付物（M6 底色分块那一档 / 硬约束 29）：压在卡底上的四档——徽标、昵称、邀请人数、
   头像占位块——全部从本档主色派生并逐档算过对比；基类不许再兜一块灰（兜灰＝漏一档时静默退回旧观感）。 */
const subBlock = (a, b) => (new RegExp('\\.' + a + '\\s+\\.' + b + '\\s*\\{[\\s\\S]*?\\}').exec(styleOf) || [''])[0];
const cardTier = (n) => ({
  bg: decl(blockOf('irb-pod--r' + n), 'background'),
  badgeBg: decl(blockOf('irb-pod-badge--r' + n), 'background'),
  badgeFg: decl(blockOf('irb-pod-badge--r' + n), 'color'),
  name: decl(subBlock('irb-pod--r' + n, 'irb-pod-name'), 'color'),
  num: decl(subBlock('irb-pod--r' + n, 'irb-pod-num'), 'color'),
  avatar: decl(subBlock('irb-pod--r' + n, 'irb-pod-avatar'), 'background'),
});
const cards = { 'TOP1 金': cardTier(1), 'TOP2 银': cardTier(2), 'TOP3 铜': cardTier(3) };
Object.keys(cards).forEach((name) => {
  const c = cards[name];
  ok(`${name} 卡底有自己那一档底色`, !!c.bg, `卡底 ${c.bg}`);
  ok(`${name} 徽标底与卡底不是同一块底（贴在一起就分不出徽标）`, c.badgeBg && c.badgeBg.toLowerCase() !== c.bg.toLowerCase(), `徽标底 ${c.badgeBg} / 卡底 ${c.bg}`);
  [['昵称', c.name], ['邀请人数', c.num], ['徽标字', c.badgeFg]].forEach(([tierName, fg]) => {
    ok(`${name} 卡内「${tierName}」压在这块卡底上 ≥ 4.5:1`, ratio(fg, c.bg) >= 4.5, `实算 ${ratio(fg, c.bg).toFixed(2)}:1（${fg} on ${c.bg}）`);
  });
  ok(`${name} 头像占位块跟本档同族（不留在全站中性灰 #f2f3f5 上——压在有色底上读起来像有一块脏东西）`,
    !!c.avatar && c.avatar.toLowerCase() !== '#f2f3f5', `占位块 ${c.avatar}`);
});
ok('三张卡的底色互不相同（不是同一块底贴三个徽标）',
  cards['TOP1 金'].bg !== cards['TOP2 银'].bg && cards['TOP2 银'].bg !== cards['TOP3 铜'].bg && cards['TOP1 金'].bg !== cards['TOP3 铜'].bg,
  `金 ${cards['TOP1 金'].bg} / 银 ${cards['TOP2 银'].bg} / 铜 ${cards['TOP3 铜'].bg}`);
ok('卡底不再有那一块中性灰 #f7f8fa（就是被点名的那一块）', !/#f7f8fa/i.test(blockOf('irb-pod')) && !/#f7f8fa/i.test(blockOf('irb-pod--r1')));
ok('基类不给默认底色（兜一块灰＝漏一档时静默退回灰观感，又是复发入口）', !/background/.test(blockOf('irb-pod')));
ok('徽标基类同样不兜底不兜字（原来兜一块 #e5e6eb 灰，TOP2/TOP3 补色前那两枚一模一样）',
  !/background/.test(blockOf('irb-pod-badge')) && !/color/.test(blockOf('irb-pod-badge')));
ok('卡内不搬外来色系：主色蓝 #0968f6 与全站冷灰 #86909c 都不再压在这三块卡上（硬约束 29③）',
  !/irb-pod[^{}]*\{[^{}]*#0968f6/i.test(styleOf) && !/irb-pod[^{}]*\{[^{}]*#86909c/i.test(styleOf));
ok('白面板上的档位不跟着换（表头仍是冷灰那一档，硬约束 29④）', /color:\s*#86909c/.test(blockOf('irb-cols')));

/* ================= ⑩ 2026-10-05 三条点名：规则入口挪位 / 去关闭按钮 / 奖品可折叠 ================= */
/* ① 「查看活动规则」搬到标题行、排在「我的邀请」左侧。规则正文仍走 rule-modal 那一层，
   榜单那一屏不被撑长；活动段里那一处要一并删干净（搬走了就不留第二处） */
const headTpl2 = cut(boardTpl, '<view class="irb-head">', '我的邀请');
const actTpl = prizeTpl;
ok('规则入口在标题行里，且排在「我的邀请」左侧（2026-10-05 点名「放到我的邀请左侧」）',
  headTpl2.indexOf('irb-act-entry') > -1 && headTpl2.indexOf('irb-act-entry') < headTpl2.indexOf('irb-my"'),
  `规则入口 @${headTpl2.indexOf('irb-act-entry')} / 我的邀请 @${headTpl2.indexOf('irb-my"')}`);
ok('活动段里已经没有那一枚规则入口（搬走了不留第二处）',
  !/查看活动规则|irb-act-entry|irb-act-rule/.test(actTpl) && (boardTpl.match(/irb-act-entry/g) || []).length === 1);
/* 2026-10-05 用户点名「如果活动规则是空的，那么活动规则弹窗中可以显示空状态提醒」。
   入口显隐从 show_rule 换成 run_state_key：原先那枚判据把「运营有没有勾规则」当前置门，
   没勾就整枚收掉 ⇒ 弹层根本点不开 ⇒ 弹层里那句空态是一段永远读不到的死代码。
   判据只回答「这一段此刻适不适用」，不回答「它里面有没有内容」——后者归弹层里的 u-empty 说，
   与硬约束 27②「入口显隐不许依赖只有该入口自己能产生的数据」同一族（内容恰恰要靠这枚入口去看）。 */
ok('规则入口显隐吃后端下发的 run_state_key，不再吃 show_rule（2026-10-05 点名「规则为空时弹窗里给空状态提醒」；' +
   '原先吃 show_rule，那句空态永远读不到）',
  /class="irb-act-entry" v-if="ruleEntryOn"/.test(boardTpl) && !/v-if="activity\.show_rule/.test(boardTpl) &&
  !/show_rule/.test(boardJs));
ok('入口那一枚的判据复用 acting（后端 run_state_key 三档键），本文件不另算一遍活动状态（M22）',
  /ruleEntryOn\(\)\s*\{\s*return this\.acting;/.test(boardJs) &&
  !/ruleEntryOn[\s\S]{0,300}(new Date|Date\.now|getTime\(|run_state\s*===)/.test(boardJs));
ok('「未开启 / 已结束」那两档入口仍收着（run_state_key 非 running 时不出，不摆点不动的死入口）',
  /run_state_key === 'running'/.test(boardJs) && !/ruleEntryOn\(\)\s*\{\s*return true/.test(boardJs));
/* 空态这一格：内容交给 u-empty（M6 禁自绘空态），落位那一档照参照页 share-gift/activity-detail.vue 的
   .sgd-friend-none 逐值抄（40/48）——u-empty 根节点自带 margin:100px !important，不补这档内衬
   它就贴在上方控件下面，读者读成「顶着一块空白」（2026-10-01 那一轮在参照页点名的同一个病）。 */
const irrNoneBlock = (styleIn(rule).match(/\.irr-none\s*\{[\s\S]*?\}/) || [''])[0];
ok('规则正文空态用登记在册的 u-empty（图标 + 文案），不自绘一行文字',
  /<view class="irr-none" v-else>\s*<u-empty/.test(ruleTpl) &&
  /商家暂未填写活动规则/.test(ruleTpl) && !/商家暂未填写活动规则/.test(boardTpl));
ok('空态那一格自带上下留白容器（padding 40/0/48，照参照页 .sgd-friend-none 那一档，不是 u-empty 光秃秃顶着）',
  /padding:\s*40px 0 48px/.test(irrNoneBlock));
ok('正文有内容时那一格整段收起（v-if / v-else 成对，不同时出也不叠着占位）',
  /<tz-parse v-if="html"/.test(ruleTpl) && /<view class="irr-none" v-else>/.test(ruleTpl) &&
  (ruleTpl.match(/v-else/g) || []).length === 1);
ok('规则正文仍另起一层详情弹层（不是就地展开）', /<rule-modal :show="ruleShow"/.test(board) && /openRule\(\)\s*\{\s*this\.ruleShow = true;/.test(board));
ok('右端两枚动作绑成一组、间距只由组容器的 gap 给（不给左边那枚写 margin-left，硬约束 20）',
  /<view class="irb-head-r">/.test(board) && /gap:\s*12px/.test(blockOf('irb-head-r')) &&
  !/margin/.test(blockOf('irb-act-entry')) && !/margin/.test(blockOf('irb-my')));
ok('标题行自身也给了 gap（左组与右组之间同理，space-between 之外不再留第二套间距口径）',
  /gap:\s*12px/.test(blockOf('irb-head')));

/* ② 关掉右上角那枚关闭图标：面板底点遮罩就能关，标题行原本给图标预留的右 26 要一并撤掉 */
ok('u-popup 不再摆那枚关闭图标（2026-10-05 点名「去掉右侧的这个退出按钮」）',
  /:closeable="false"/.test(board) && !/:closeable="true"/.test(board));
ok('标题行不再给关闭图标预留右 26（撤掉后留着就是一块没人认领的空白）',
  decl(blockOf('irb-head'), 'padding') === '15px 0 12px', `实得 padding ${decl(blockOf('irb-head'), 'padding')}`);
ok('弹层仍可关闭（点遮罩这一条路留着，不是把出口整条堵死）',
  /@close="close"/.test(board) && /close\(\)\s*\{\s*this\.\$emit\('close'\);/.test(board));

/* ③ 奖品档位清单可折叠（2026-10-05 点名「奖品列表可以伸缩」）：折着露 PRIZE_COLLAPSE_NUM（3）行，
   超出才出「查看更多 / 收起」。这一组现在只住在 prize-list.vue 一份（榜单与规则弹层共用），
   所以这一整组断言读的是面板自己，不是榜单那一屏 */
const prizeNum = (/const PRIZE_COLLAPSE_NUM\s*=\s*(\d+)/.exec(prize) || [])[1];
ok('折叠档位是 3 行（2026-10-05 点名「先展示前 3 行」）', prizeNum === '3', `实得 ${prizeNum}`);
ok('折叠档只有这一处常量，判定与取行都读它（改档位只改这一行）',
  /slice\(0,\s*PRIZE_COLLAPSE_NUM\)/.test(prize) && /prizeAll\.length > PRIZE_COLLAPSE_NUM/.test(prize));
ok('模板里不写死行数（不出现 slice(0, 3) 那一类字面量）', !/slice\(0,\s*3\)/.test(prize));
ok('模板遍历的是折叠后的那一份（prizeShown），不是全量',
  /v-for="\(item, index\) in prizeShown"/.test(prizeTpl) && !/in activity\.rewards/.test(prize));
ok('折叠 / 展开两态由同一枚开关翻（同一条指令两态，不是两枚入口）',
  /prizeShown\(\)\s*\{\s*return this\.prizeExpanded \? this\.prizeAll : this\.prizeAll\.slice/.test(prize) &&
  /togglePrizes\(\)\s*\{\s*this\.prizeExpanded = !this\.prizeExpanded;/.test(prize) &&
  (prizeTpl.match(/class="irp-prize-more"/g) || []).length === 1);
ok('入口显隐只判「档位数超过折叠档」（三行以内不多摆一枚空入口）',
  /class="irp-prize-more" v-if="prizeOverflow"/.test(prizeTpl) && /prizeOverflow\(\)\s*\{\s*return this\.prizeAll\.length > PRIZE_COLLAPSE_NUM/.test(prize));
ok('按钮两态文案是「查看更多 / 收起」，箭头跟着翻（不是恒定一句话）',
  /\{\{ prizeExpanded \? '收起' : '查看更多' \}\}/.test(prize) &&
  /:name="prizeExpanded \? 'arrow-up' : 'arrow-down'"/.test(prize));
ok('展开/收起不发请求（档位是同一份后端下发，纯本地状态）',
  !/togglePrizes[\s\S]{0,200}\$api|loadBoard|loadMy/.test(prizeJs));
ok('展开态会复位：宿主弹层关掉时、以及活动段换一份（重取/换直播间）时都折回前 3 行',
  /popupShow\(val\)\s*\{[\s\S]{0,200}prizeExpanded = false/.test(prize) &&
  /activity\(\)\s*\{\s*this\.prizeExpanded = false;/.test(prize));
ok('档位行仍吃后端下发的区间与奖品名（前端不拼「第1~N名」，M22）',
  /第 \{\{ item\.rank_start \}\}-\{\{ item\.rank_end \}\} 名/.test(prize) && /\{\{ item\.prize_name \}\}/.test(prize));
ok('没有奖品时仍给一句空态（不是一条什么都没有的灰条）', /class="irp-prize-none" v-if="!prizeAll\.length"/.test(prizeTpl));
ok('「查看更多」是文字动作那一档，不是自造按钮：没有胶囊 / 圆形圆角，也不套 tz-button',
  !/border-radius:\s*(50%|999|100px)/.test(prizeBlock('irp-prize-more')) && !/tz-button/.test(actTpl) && !/u-button/.test(actTpl));
ok('那一枚压在 #f7f8fa 上 ≥ 4.5:1（硬约束 29①：压在有色/浅底上的每一档都得算过）',
  ratio(decl(prizeBlock('irp-prize-more-txt'), 'color'), decl(prizeBlock('irp-act'), 'background')) >= 4.5,
  `实算 ${ratio(decl(prizeBlock('irp-prize-more-txt'), 'color'), decl(prizeBlock('irp-act'), 'background')).toFixed(2)}:1`);

/* ================= ⑪ 2026-10-05 点名：「查看活动规则」弹窗里也要显示同一块奖品面板 ================= */
/* 硬约束 11（同一组字段出现在两个界面必须抽一份字段组组件）。原先档位行 + 空态句 + 「查看更多 /
   收起」+ 折叠档 + 判据 + 配色只写在 board-list.vue 一处，规则弹层要显示时最省事的写法就是照抄
   一份——下一次改折叠档或改判据时两边就会不一致。收口是抽成 prize-list.vue 一份、两处各挂一枚。
   这一组钉「只有一份实现」这件事本身：少挂一处＝那一屏没有面板，多写一份＝分叉回来了 */
ok('奖品面板只有一个实现文件，榜单与规则弹层各挂同一枚（硬约束 11）',
  (boardTpl.match(/<prize-list[\s/>]/g) || []).length === 1 && (ruleTpl.match(/<prize-list[\s/>]/g) || []).length === 1 &&
  /import prizeList from '\.\/prize-list\.vue'/.test(boardJs) && /import prizeList from '\.\/prize-list\.vue'/.test(ruleJs) &&
  /components:\s*\{[^}]*prizeList/.test(boardJs) && /components:\s*\{[^}]*prizeList/.test(ruleJs));
ok('两个调用点都把活动段与「自己此刻开着没有」递进去（弹层关掉时展开态复位，判据不在调用点重算）',
  /<prize-list :activity="activity" :popup-show="show"/.test(board) && /<prize-list :activity="activity" :popup-show="show"/.test(rule));
ok('榜单与规则弹层都不再自带档位行 / 折叠常量 / 判据 / 配色（抄一份就是这一族的分叉）',
  !/rank_start|irp-/.test(board) && !/rank_start|irp-/.test(rule) &&
  !/PRIZE_COLLAPSE_NUM|togglePrizes|prizeExpanded|prizeAll|prizeShown|prizeOverflow|商家暂未设置奖品/.test(boardJs) &&
  !/PRIZE_COLLAPSE_NUM|togglePrizes|prizeExpanded|prizeAll|prizeShown|prizeOverflow|商家暂未设置奖品/.test(ruleJs));
ok('规则弹层收的是后端那一整段活动字段（rule_html 从它里面取，不再由调用点单独递一句）',
  /activity:\s*\{\s*type:\s*Object/.test(ruleJs) && /\(this\.activity && this\.activity\.rule_html\) \|\| ''/.test(ruleJs) &&
  /<rule-modal :show="ruleShow" :activity="activity"/.test(board));
ok('规则弹层里奖品面板排在规则正文之前（与榜单那一屏同序：奖品在前、领奖台/正文在后）',
  ruleTpl.indexOf('<prize-list') > -1 && ruleTpl.indexOf('<prize-list') < ruleTpl.indexOf('<tz-parse') &&
  boardTpl.indexOf('<prize-list') > -1 && boardTpl.indexOf('<prize-list') < boardTpl.indexOf('irb-pod'));
ok('面板显隐仍只吃后端下发的 status + show_prize，规则弹层不自己另判一套活动状态（M22）',
  /Number\(act\.status\) !== 1/.test(prizeJs) && /act\.show_prize == 1/.test(prizeJs) &&
  !/run_state|showActivity/.test(prizeJs) && !/status|show_prize|run_state/.test(ruleJs));
ok('两处空态是两句不同的话（正文没填给「暂未填写活动规则」，没设奖品给「暂未设置奖品」）',
  /商家暂未填写活动规则/.test(rule) && /商家暂未设置奖品/.test(prize) &&
  !/商家暂未设置奖品/.test(rule) && !/商家暂未填写活动规则/.test(board));
ok('规则弹层仍是独立一层（zIndex / 遮罩那一档没动，别把它塞进榜单弹层里就地展开）',
  /:zIndex="10330"/.test(rule) && /:overlayStyle="\{ zIndex: 10320 \}"/.test(rule) && /tz-popup-list/.test(ruleTpl));

/* ================= ⑬ 2026-10-06 点名：参与用户三位及以内不用领奖台，直接走列表 ================= */
/* 用户原话「如果参与用户只有 3 个的话，那么前三位不要用这种领奖台风格的样式展示，直接使用列表。
   如果参与用户大于 3 个（4 个或 4 个以上），再显示当前的格式」。
   这一组不写正则猜形态，而是**把组件里那三个 computed 的真身取出来实跑**（硬约束 33②：
   门禁不许自己重建它要验的东西——重建出来的矩阵永远是绿的）：
   usePodium / podium / listRows 三枚共用同一根判据，所以必须一起跑，只断其中一枚就会出现
   「领奖台收了、下面那张表却还在从第 4 名开始」那种半截收口（= 榜上少三人）。 */
const computedBody = (name) => {
  const m = new RegExp('\\n\\s*' + name + '\\(\\)\\s*\\{([\\s\\S]*?)\\n\\t{2}\\}').exec(boardJs);
  return m ? m[1] : null;
};
const runComputed = (name, ctx) => {
  const body = computedBody(name);
  if (body === null) return null;
  // .call(ctx) 把函数里的 this 换成这一档入参，取的就是组件里那一行原判据，不另抄一份
  return new Function(body).call(ctx);
};
const rowsOf = (...ranks) => ranks.map((r) => ({ rank: r, user_id: 100 + r, invite_num: 20 - r }));
/** 组件里 podium / listRows 都读 this.usePodium，所以实跑时必须把那一枚也按真身算出来挂上去，
    不然读到一个 undefined，等于门禁在验「领奖台永远收起」这一档、把 4 人以上的形态漏掉了 */
const makeCtx = (total, topNum, ranks) => {
  const ctx = { total, top: rowsOf(...ranks).slice(0, topNum), rows: rowsOf(...ranks) };
  Object.defineProperty(ctx, 'usePodium', {
    enumerable: true,
    get: () => runComputed('usePodium', ctx),
  });
  return ctx;
};
const boardCases = [
  // [题名, total, top 条数, rows 的 rank, 期望领奖台几枚, 期望列表几行, 期望列表首行名次]
  ['榜是空的（0 人）', 0, 0, [], 0, 0],
  ['只有 1 位参与用户', 1, 1, [1], 0, 1, 1],
  ['只有 2 位（原来会摆两张卡 + 中间空一档）', 2, 2, [1, 2], 0, 2, 1],
  ['正好 3 位 ⇒ 走列表', 3, 3, [1, 2, 3], 0, 3, 1],
  ['4 位 ⇒ 保持领奖台 + 下面从第 4 名开始', 4, 3, [1, 2, 3, 4], 3, 1, 4],
  ['20 位第一页', 20, 3, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 3, 7, 4],
  ['20 位翻到第二页（rows 只有后段，领奖台仍按 total 判）', 20, 3, [11, 12, 13], 3, 3, 11],
];
boardCases.forEach(([name, total, topNum, ranks, podNum, rowNum, firstRank]) => {
  const ctx = makeCtx(total, topNum, ranks);
  const use = ctx.usePodium;
  const pod = runComputed('podium', ctx);
  const list = runComputed('listRows', ctx);
  ok(`⑬ ${name}：领奖台 ${podNum} 枚 / 列表 ${rowNum} 行`,
    !!use === (podNum > 0) && (pod || []).length === podNum && (list || []).length === rowNum,
    `实跑得 usePodium=${use} podium=${(pod || []).length} listRows=${(list || []).length}`);
  if (firstRank !== undefined && rowNum) {
    ok(`⑬ ${name}：列表第一行是第 ${firstRank} 名（既不重复摆领奖台那三行、也不把人吞掉）`,
      (list || [])[0] && (list || [])[0].rank === firstRank,
      `实跑得 ${(list || [])[0] && (list || [])[0].rank}`);
  }
});
/* 只断 usePodium 自己那几行：podium() 的守卫里就写着 `const top = this.top || []` 与 `!top.length`，
   拿「120 字符内不许出现 top.length」去圈整段会把真实现圈成违规 */
ok('⑬ 判据吃后端下发的 total，不拿 rows.length / top.length 自己数（M22；rows 翻页只剩当前这一页）',
  /return Number\(this\.total\) > 3;/.test(computedBody('usePodium') || '')
  && !/rows\.length|top\.length/.test(computedBody('usePodium') || ''));
ok('⑬ 领奖台与列表两段共用同一根判据（只改一处就会出现「收了卡却还从第 4 名开始」的半截收口）',
  /podium\(\)\s*\{\s*if \(!this\.usePodium\) \{/.test(boardJs)
  && /listRows\(\)\s*\{\s*if \(!this\.usePodium/.test(boardJs));
ok('⑬ 三张卡站位仍是「第2 - 第1 - 第3」（图3 那一档，本轮只加判据不动版式）',
  /const order = \[top\[1\], top\[0\], top\[2\]\];/.test(boardJs));
ok('⑬ 调用点把 total 接上了（接口早就下发这一枚，上一版界面没消费＝硬约束 32② 那一族）',
  /:total="total"/.test(entry) && /this\.total = Number\(data\.total\) \|\| 0;/.test(entry)
  && /total: 0,/.test(entry));
ok('⑬ 取榜失败时 total 一并清掉（留着上一场的数会让领奖台在「其实取不到榜」时仍然摆着）',
  (entry.match(/this\.total = 0;/g) || []).length === 2);

let fail = 0;
results.forEach((r) => {
  if (!r.pass) fail++;
  console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.name}${r.note ? ' — ' + r.note : ''}`);
});
console.log(`\n共 ${results.length} 条，失败 ${fail} 条`);
process.exit(fail ? 1 : 0);
