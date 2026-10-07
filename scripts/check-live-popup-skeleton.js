/**
 * 直播间三只弹窗的加载态必须是骨架屏（M16）
 * 验法：node tuzi-mobile/scripts/check-live-popup-skeleton.js
 *
 * 钉四条：
 *  1. 三处都不得再有「转圈 + 加载中」文字块（u-loading-icon 单独一枚 / >加载中< / >正在加载<）
 *  2. 灰块色值 #e5e6eb 存在，且骨架与真实版式同一份壳（.gift-options-box / .course-item-box / .record-item）
 *  3. 加载分支在 v-if="loading" / v-else 的骨架侧，真实内容留在 v-else 分支（不是被骨架替换掉）
 *  4. 底栏/右侧那几块（礼物底栏合计+赠送、商品行价格+抢购、连麦记录行尾动作）都要有灰块位
 *     —— 只铺左侧大块、右侧空着，骨架宽度对不上真实行宽
 *  7. 分享有礼详情弹窗（第三轮被点名的那一档）：外壳走真实元素、灰块只进容器内部；
 *     条件渲染的元素（倒计时、「我的奖品」）不垫灰块；静态文案保持真文字；版式在共用组件里的由组件出加载档
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', 'src', 'pages', 'course', 'live');
const files = {
  gift: path.join(ROOT, 'gift', 'gift-modal.vue'),
  goods: path.join(ROOT, 'goods', 'goods-modal.vue'),
  link: path.join(ROOT, 'link', 'link-apply.vue'),
};

const checks = [];
const read = (p) => fs.readFileSync(p, 'utf8');

/* 组件模板里有嵌套 <template>（v-if 分支），取到最后一个 </template> 为止才是整份模板 */
const tpl = (s) => (s.match(/<template>[\s\S]*<\/template>/) || [''])[0];
const style = (s) => (s.match(/<style[^>]*>[\s\S]*?<\/style>/) || [''])[0];

function ok(name, cond, detail) {
  checks.push({ name, pass: !!cond, detail: cond ? '' : detail || '' });
}

const src = {};
for (const [k, p] of Object.entries(files)) src[k] = read(p);

/* 1. 三处都不得再有「转圈 + 加载中」文字块 */
const spinner = /u-loading-icon[^>]*\btext=["'][^"']*加载|>\s*(加载中|正在加载)\s*(?:\.\.\.|…)?\s*</;
for (const [k, p] of Object.entries(files)) {
  ok(
    `${k}：无「转圈 + 加载中」文字块`,
    !spinner.test(tpl(src[k])),
    path.relative(process.cwd(), p)
  );
}

/* 2. 灰块色值 + 骨架复用真实壳 */
ok('gift：灰块 #e5e6eb', /#e5e6eb/.test(style(src.gift)), 'gift-modal.vue 样式里没有 #e5e6eb');
ok('gift：骨架壳复用 .gift-options-box / .gift-item', /class="gift-options-box"[\s\S]{0,400}class="gift-item"/.test(tpl(src.gift)), '礼物骨架没有复用真实壳');
ok('goods：灰块 #e5e6eb', /#e5e6eb/.test(style(src.goods)), 'goods-modal.vue 样式里没有 #e5e6eb');
ok('goods：骨架壳复用 .course-item-box / .course-containner', /class="course-item-box"[\s\S]{0,200}class="course-containner"/.test(tpl(src.goods)), '商品骨架没有复用真实行壳');
ok('link：灰块 #e5e6eb', /#e5e6eb/.test(read(path.join(ROOT, 'link', 'css.css'))), 'link/css.css 里没有 #e5e6eb');
ok('link：骨架壳复用 .record-item / .record-item-icon', /class="record-item lka-sk-item"[\s\S]{0,200}record-item-icon/.test(tpl(src.link)), '连麦骨架没有复用真实行壳');

/* 3. 真实内容仍在骨架之外的分支里 */
ok('gift：loading 与内容分支并列', /v-if="loading"/.test(tpl(src.gift)) && /v-else-if="list && list\.length>0"/.test(tpl(src.gift)), '礼物弹窗的 v-else 结构变了');
ok('goods：loading 与内容分支并列', /v-if="loading"/.test(tpl(src.goods)) && /<template v-else>/.test(tpl(src.goods)), '商品弹窗的 v-else 结构变了');
ok('link：recordLoading 与记录列表并列', /v-if="recordLoading"/.test(tpl(src.link)) && /class="record-scroll" v-else/.test(tpl(src.link)), '连麦记录弹窗的 v-else 结构变了');

/* 4. 右侧/底栏那几块也要有灰块位 */
for (const cls of ['gft-sk-total', 'gft-sk-count', 'gft-sk-send', 'gft-sk-icon', 'gft-sk-name', 'gft-sk-price']) {
  ok(`gift：骨架块 .${cls} 在模板里`, new RegExp(`class="${cls}"`).test(tpl(src.gift)), '模板里没有 ' + cls);
}
for (const cls of ['gdm-sk-cover', 'gdm-sk-title', 'gdm-sk-price', 'gdm-sk-buy']) {
  ok(`goods：骨架块 .${cls} 在模板里`, new RegExp(`class="[^"]*${cls}`).test(tpl(src.goods)), '模板里没有 ' + cls);
}
for (const cls of ['lka-sk-icon', 'lka-sk-line-type', 'lka-sk-line-meta', 'lka-sk-act']) {
  ok(`link：骨架块 .${cls} 在模板里`, new RegExp(`class="[^"]*${cls}`).test(tpl(src.link)), '模板里没有 ' + cls);
}

/* 5. 死类清干净：三个加载态旧类名不许残留在模板里 */
for (const [k, cls] of Object.entries({ gift: 'gift-loading', goods: 'course-list-loading', link: 'record-loading' })) {
  ok(`${k}：旧加载态类 .${cls} 已从模板移除`, !new RegExp(cls).test(tpl(src[k])), '模板里还留着 ' + cls);
}
for (const [p, cls] of [
  [path.join(ROOT, 'gift', 'gift-modal.vue'), 'gift-loading'],
  [path.join(ROOT, 'goods', 'goods-modal.vue'), 'course-list-loading'],
  [path.join(ROOT, 'link', 'css.css'), 'record-loading'],
]) {
  ok(`${path.basename(p)}：旧加载态类 .${cls} 已从样式移除`, !new RegExp('\\.' + cls + '\\b').test(style(read(p)) || read(p)), '样式里还留着 ' + cls);
}

/* 6. gift 取列表的退出分支写全（成功 / 业务失败 / 网络异常三条都收回 loading） */
const giftScript = (src.gift.match(/<script>[\s\S]*?<\/script>/) || [''])[0];
ok(
  'gift：getGiftOptions 三条退出分支都收回 loading',
  (giftScript.match(/loading = false/g) || []).length >= 3 && /getGiftOptions\(\)[\s\S]*?\.catch\(/.test(giftScript),
  '退出分支数 ' + (giftScript.match(/loading = false/g) || []).length + '（少 catch 就是请求被拒时骨架收不回来）'
);
ok('gift：空态吃接口那句（不把故障说成「暂无礼物」）', /:text="error\s*\|\|\s*'暂无礼物'"/.test(tpl(src.gift)), 'u-empty 没吃 error');

/* 7. 分享有礼详情弹窗：M16「先摆真实元素、灰块只进容器内部」一档
 *    （2026-09-30 用户连点名三处：纯白面板上另铺的灰块树形状与真实组件对不上 /
 *     倒计时那一行加载完本来就不出、骨架屏多余 / 元素先显示出来、只把里面的名称数值图片换灰块） */
const detailPath = path.join(ROOT, 'share-gift', 'activity-detail.vue');
const heroPath = path.join(ROOT, 'share-gift', 'prize-hero.vue');
const detail = read(detailPath);
const detailTpl = tpl(detail);
const detailStyle = style(detail);
const hero = read(heroPath);
const heroTpl = tpl(hero);

/* 7a. 倒计时段按 v-if 自己判，加载档一律不给灰块、也不预留空位 */
const cdBlock = (detailTpl.match(/<view class="sgd-countdown"[\s\S]*?<\/u-count-down>/) || [''])[0];
ok('detail：倒计时段没有灰块（v-if 才出的元素不垫骨架）', cdBlock && !/-sk-/.test(cdBlock), '倒计时那一行里出现了灰块类');
/* 画布高度与横向内衬不许变（加载时不跳版）。底部那一格 12px 是 2026-10-01 弹层底部安全区收口
   那一轮加的：面板不再自带底部内衬，改由内容最后一块自己给（横向仍是 0，不挪内容）。
   细则见 scripts/check-live-popup-safe-area.js
   ⚠ 高度那一档 2026-10-06 起不再是写死的 `46vh`：详情要与同屏达人榜**面板总高对齐**，
   改成按「条件说明行 + 底栏在不在」取三档的 `:height="listHeight"`（算式在
   `common/utils/live-popup-height`，逐档数值由 `check-live-popup-height.js` 23 条实算钉死）。
   本条只钉「两档共用同一块画布 + 那一格 12px 内衬没丢」，别再写回 46vh 那个旧数 */
ok('detail：内容/失败两档同一块画布（高度按三档取，加载时不跳版）',
  /:height="listHeight"[^>]*padding="0 0 12px"/.test(detailTpl), 'tz-popup-list 高度/内衬变了');
/* 2026-10-06 用户点名「邀请完成之后，下面这个我的奖品不需要显示了」：那一段与它挂的领奖组件
   整档撤掉，达标由标题行那枚「已完成」标签 + 底部主按钮说（口径见 ui-baseline-mobile.md M41）。
   留着正则＝下一次有人把「顺手补回奖品行」当成没做完。
   ⚠ 判之前连 CSS/HTML 注释一起剥：本仓的注释里会写「原先挂 tz-prize-claim 那只组件、现已撤」这种来历，
   不剥就是门禁自己撞红（同 check-live-inviter-chain.js 第 ⑭ 组那条教训） */
const detailCode = detail.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
ok('detail：「我的奖品」那一段与弹窗内的领奖组件都已撤干净',
  !/sgd-award|sgd-tip|myPrizes|tz-prize-claim|prizeStatusText/.test(detailCode),
  '模板或脚本里还留着奖品行 / 领奖组件的读点');
ok('detail：标题行第二枚「已完成」标签只吃后端下发的 my.done_text（前端不拿 assist_num 与 invite_num 自己比，M22）',
  /v-if="myDoneText">\{\{ myDoneText \}\}<\/text>/.test(detailTpl)
  && /myDoneText\(\)\s*\{\s*return \(this\.my \|\| \{\}\)\.done_text \|\| '';/.test(detail)
  && !/assist_num\s*>=|invite_num\s*<=/.test(detail));

/* 7b. 真实容器在取数期间照常渲染，骨架不许整段收起外壳 */
ok('detail：内容档 .sgd-body 只被 error 收起（加载态照常出）', /class="sgd-body" v-else/.test(detailTpl) && !/class="sgd-body"[^>]*v-if="(sk|!sk)"/.test(detailTpl), '.sgd-body 的显隐条件被改成按加载态收起了');
const oldShell = /(?:^|\s)(sgd-sk|sgd-sk-bar|sgd-sk-hero|sgd-sk-stats|sgd-sk-section|sgd-sk-tabs|sgd-sk-friend|sgd-sk-friend-name)(?:\s|")/;
ok('detail：没有「另铺一棵灰块树」的老壳（.sgd-sk / .sgd-sk-hero / .sgd-sk-stats / .sgd-sk-tabs）',
  !oldShell.test(detailTpl) && !/\.(sgd-sk|sgd-sk-bar|sgd-sk-hero|sgd-sk-stats|sgd-sk-section|sgd-sk-tabs|sgd-sk-friend|sgd-sk-friend-name)\s*[,{]/.test(detailStyle), '老的一整块灰板类还留着');

/* 7c. 灰块只给会变的那一格：静态文案保持真文字、灰块自身不装文字 */
for (const txt of ['受邀好友', '已完成', '未完成']) {
  ok(`detail：静态文案「${txt}」保持真文字`, detailTpl.includes(`>${txt}<`), '模板里找不到 ' + txt);
}
ok('detail：灰块不装任何文字（不许把写死的文案也画成灰条）',
  !/(class="[^"]*-sk-[^"]*")[^>]*>\s*[^<\s{]/.test(detailTpl), '有灰块里塞了静态文案');

/* 7d. 会变的那几格都要有同尺寸灰块；尺寸自己写死、或与真实元素同一个 class（头像那一枚靠 .sgd-friend-avatar 出尺寸） */
for (const cls of ['sgd-sk-title', 'sgd-sk-tag', 'sgd-sk-num', 'sgd-sk-tab-count', 'sgd-sk-avatar', 'sgd-sk-name', 'sgd-sk-time']) {
  ok(`detail：${cls} 在模板里`, new RegExp(`class="[^"]*\\b${cls}\\b`).test(detailTpl), '模板里没有 ' + cls);
  const own = new RegExp(`\\.${cls}\\s*\\{([^}]*)\\}`).exec(detailStyle);
  const sized = !!(own && /width:/.test(own[1]) && /height:/.test(own[1]));
  const attr = (detailTpl.match(new RegExp('class="([^"]*' + cls + '[^"]*)"')) || ['', ''])[1];
  const sameShell = attr.split(/\s+/).some((c) => c && c !== cls && !/-sk-/.test(c));
  ok(`detail：${cls} 有确定尺寸（自己写死或与真实元素同壳）`, sized || sameShell, '既没写死宽高、也没和真实元素同一个 class');
}

/* 7d-bis. 逐格「灰块盒 = 真实行盒」：灰块只许矮到字高那一档，差的那截靠上下外衬撑回去
 *     （M16「灰块高 + 上下外衬 = 真实行盒高，不是行盒高本身」），否则数据一落下来那一格变高、
 *     底下每一格跟着移位 —— 又退回「加载完整体换版」那一版（2026-09-30 用户第三次点名）。
 *     两种灰块不参与本判据，理由随行：
 *       .sgd-sk-avatar  与真实头像同一个 class（.sgd-friend-avatar），盒高由真实那一档出；
 *       .sgd-sk-tab-count 在 .sgd-tab 那只 flex 药丸里，药丸高由同排 17px 页签名定（两档同高），
 *                       灰条只对齐「(3)」的字高 10px 那一档，硬撑到 17 反而比它替的那几个字还粗。 */
function decl(css, cls) {
  const m = new RegExp('\\.' + cls + '\\s*\\{([^}]*)\\}').exec(css);
  if (!m) return null;
  const body = m[1];
  const one = (prop) => {
    const r = new RegExp('(?:^|[;{\\s])' + prop + ':\\s*(-?[\\d.]+)px').exec(body);
    return r ? parseFloat(r[1]) : null;
  };
  /* margin/padding 的简写按 CSS 规则归一化成上下两条：1 值=四边同值，2 值=上下同值、第二个值是左右，
     3 值=上/左右/下，4 值=上/右/下/左（第三个才是下）。声明之间夹的注释会混进剩余值里，按 px 收。 */
  const vert = (prop) => {
    const top = one(prop + '-top');
    if (top !== null) return { top, bottom: one(prop + '-bottom') || 0 };
    const s = new RegExp('(?:^|[;{\\s])' + prop + ':\\s*(-?[\\d.]+)px([^;}]*)').exec(body);
    if (!s) return null;
    const all = [parseFloat(s[1])].concat((s[2].match(/-?[\d.]+(?:px)?(?=[\s;}]|$)/g) || []).map(parseFloat));
    const bottom = all.length <= 2 ? all[0] : all[2];
    return { top: all[0], bottom: Number.isFinite(bottom) ? bottom : all[0] };
  };
  return { one, vert };
}
const skBox = (css, cls) => {
  const d = decl(css, cls);
  if (!d) return null;
  const h = d.one('height');
  if (h === null) return null;
  const m = d.vert('margin') || { top: 0, bottom: 0 };
  return h + m.top + m.bottom;
};
/* 真实那一格该有多高：inShell ＝ 灰条摆在这个类自己的壳内部（只占壳的内容盒，那层内衬是壳出的），
   否则就是这一格自己占位的那一盒：文字行盒 = line-height + 上下内衬（状态标签那类自带内衬的壳正好也对上）。 */
const realBox = (css, cls, extraTop, inShell) => {
  const d = decl(css, cls);
  if (!d) return null;
  const lh = d.one('line-height');
  if (lh === null) return null;
  if (inShell) return lh;
  const p = d.vert('padding') || { top: 0, bottom: 0 };
  return lh + p.top + p.bottom + (extraTop || 0);
};
for (const [sk, real, extraTop, inShell] of [
  ['sgd-sk-title', 'sgd-title', 0, 0],
  ['sgd-sk-num', 'sgd-stat-num', 0, 0],
  ['sgd-sk-name', 'sgd-friend-name', 0, 0],
  ['sgd-sk-time', 'sgd-friend-time', 2, 0],
  ['sgd-sk-tag', 'sgd-tag', 0, 1],
]) {
  const a = skBox(detailStyle, sk);
  const b = realBox(detailStyle, real, extraTop, inShell);
  const where = inShell ? `内（${real} 的内容盒）` : '内';
  ok(`detail：${sk} 的盒高 = ${real} 的行盒${where}（${a} = ${b}）`, a !== null && b !== null && a === b,
    `灰块盒 ${a === null ? '取不到' : a} ≠ 真实行盒 ${b === null ? '取不到' : b}`);
}
/* 状态标签壳自带 #f2f3f5 底与 4px 圆角，属 M16① 的「外壳」：取数期间壳照常摆，只把待到手的文字换成灰条 */
const tagShell = /<view class="sgd-tag" v-if="sk">\s*<view class="sgd-sk-tag"><\/view>\s*<\/view>/.exec(detailTpl);
const tagBare = detailTpl.replace(tagShell ? tagShell[0] : '', '').includes('<view class="sgd-sk-tag"');
ok('detail：状态标签的灰条在真标签壳里（外壳/圆角/内衬那一档不换）', !!tagShell && !tagBare,
  tagBare ? '取数期间整枚状态标签被换成了一枚灰块（壳那一档的浅底/圆角被换掉了）'
    : '取数期间没有把灰条放进 .sgd-tag 壳里');

/* 7e. 骨架判据 loading && !activity.id：静默重取不闪骨架 */
ok('detail：sk 判据是 loading && !activity.id', /sk\(\)\s*\{\s*return this\.loading && !this\.activity\.id;/.test(detail), 'sk 判据变了（静默重取会闪骨架）');

/* 7f. 版式存在共用组件里时，加载档由组件自己出（父页不另抄一份整灰板） */
ok('detail：奖品大卡走 prize-hero 的 skeleton 档', /<prize-hero[^>]*:prizes="prizes"[^>]*:skeleton="sk"/.test(detailTpl), '调用点没把加载态传给共用组件');
ok('prize-hero：skeleton prop 默认 false（另一个调用点不受影响）', /skeleton:\s*\{\s*type:\s*Boolean,\s*default:\s*false/.test(hero), 'skeleton prop 的默认值不是 false');
for (const cls of ['sph-sk-name', 'sph-sk-type', 'sph-cover--none']) {
  ok(`prize-hero：${cls} 在模板里`, heroTpl.includes(cls), '模板里没有 ' + cls);
}
ok('prize-hero：空态在加载档不出（不凭空多一格空态）', /class="sph-none"[^>]*v-if="!skeleton && !prizes\.length"/.test(heroTpl), '空态的显隐没让开加载档');

let pass = 0;
for (const c of checks) {
  if (c.pass) pass++;
  console.log(`${c.pass ? 'PASS' : 'FAIL'} ${c.name}${c.detail ? '　→ ' + c.detail : ''}`);
}
console.log(`\n${pass}/${checks.length} PASS`);
if (pass !== checks.length) process.exit(1);
