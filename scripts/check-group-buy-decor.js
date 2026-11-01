/**
 * 拼团-DIY「拼团商品」组件的机器验法（硬约束 26：没有 pattern 的类别对 ui-audit 等于不存在）
 *
 * 跑法：node tuzi-mobile/scripts/check-group-buy-decor.js
 *      node tuzi-mobile/scripts/check-group-buy-decor.js --can-be-red
 *
 * 这一只钉三件事（`sfc-check` 只编译模板、`ui-audit` 只按正则查版式、后端 curl 只验接口出口，
 * 三条都看不见）：
 *  ① **端上不重判**：来源（最新/手动）、显示数量、两个隐藏开关都只在服务端生效，
 *     组件里出现 `source` / `hide_ended` / `hide_sold_out` 就是把判据抄了第二份（M22）；
 *  ② **字段与后端逐键对上**：组件读的每一个 `item.xxx` 都必须由后端 DecorPage 下发，
 *     少一个就是「卡片上一格永远空着」而接口一路 200；
 *  ③ **跨组件接线（硬约束 27③）**：装修页模板 → 组件标签 → 配置 props → 安装态闸门
 *     → 去商品详情页这一条链，四跳逐跳点名。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const BE = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend', 'application');
const be = (rel) => { try { return fs.readFileSync(path.join(BE, rel), 'utf8'); } catch (e) { return ''; } };

const CMP = 'src/components/tz/group-buy-list.vue';
const IDX = 'src/pages/index/index.vue';
const IDXJS = 'src/pages/index/js.vue';
const DECOR = be('common/library/app/group_buy/DecorPage.php');
// 2026-10-29 按「配置 / 取数 / 出卡」拆成三个文件（单文件 300 行）：卡片键在 DecorPageCards、
// 行口径（FIELDS）在 DecorPageRows，配置与插件闸门仍在 DecorPage
const ROWS = be('common/library/app/group_buy/DecorPageRows.php');
const CARDS = be('common/library/app/group_buy/DecorPageCards.php');
const MODEL = be('common/model/page/Decorate.php');

const cmp = read(CMP);
const idx = read(IDX);
const idxjs = read(IDXJS);
// 注释里会**故意**写出被禁的写法当反面教材，判据一律扫剥过注释的代码
const code = (src) => src.replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const cmpCode = code(cmp);

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/* ───────────────────────── ① 组件：三档版式 ───────────────────────── */
ok('1.1 根节点存在且「一条数据都没有」时整块不占位',
  /<view class="tz-group-buy-list"[^>]*v-if="list && list\.length"/.test(cmpCode));
ok('1.2 三档排列各有自己的封面几何（list 宽 112 / single 通栏 196 / double 96）；'
  + '列表封面随右侧文字拉伸（height:auto + min-height:80 + align-self:stretch）',
  /\.gbc-card\.list \.gbc-cover\s*\{[^}]*width: 112px/.test(cmp)
  && /\.gbc-card\.list \.gbc-cover\s*\{[^}]*height: auto/.test(cmp)
  && /\.gbc-card\.list \.gbc-cover\s*\{[^}]*min-height: 80px/.test(cmp)
  && /\.gbc-card\.list \.gbc-cover\s*\{[^}]*align-self: stretch/.test(cmp)
  && /\.gbc-card\.single \.gbc-cover\s*\{[^}]*height: 196px/.test(cmp)
  && /\.gbc-card\.double \.gbc-cover\s*\{[^}]*height: 96px/.test(cmp));
ok('1.2b 列表左侧封面与右侧文字同高：信息区 min-height 80（封面拉伸的下限与文字那一侧同档），'
  + '封面图绝对铺满（不靠百分比高度）',
  /\.gbc-card\.list \.gbc-info\s*\{[^}]*min-height: 80px/.test(cmp)
  && /\.gbc-card\.list \.gbc-cover-img\s*\{[^}]*position: absolute/.test(cmp));
ok('1.2c 双列同排卡片恒等高：容器 stretch + 卡纵轴 flex + 信息区 flex:1 + 价条贴底'
  + '（标题/倒计时固定行高，名称只占一行）',
  /\.tz-group-buy-list\.double\s*\{[^}]*align-items: stretch/.test(cmp)
  && /\.gbc-card\.double\s*\{[^}]*display: flex[^}]*flex-direction: column/.test(cmp)
  && /\.gbc-card\.double \.gbc-info\s*\{[^}]*flex: 1/.test(cmp)
  && /\.gbc-card\.double \.gbc-price-bar\s*\{[^}]*margin-top: auto/.test(cmp)
  && /\.gbc-card\.double \.gbc-title-row\s*\{[^}]*height: 20px/.test(cmp)
  && /\.gbc-card\.double \.gbc-countdown\s*\{[^}]*height: 17px/.test(cmp)
  && /\.gbc-card\.double \.gbc-name\s*\{[^}]*height: 20px/.test(cmp));
ok('1.2d 名称与倒计时恒占一行、倒计时恒渲染（不再 v-if）：少一行不会把那一张卡变矮',
  /<text class="gbc-countdown">/.test(cmpCode)
  && !/<text class="gbc-countdown"[^>]*v-if=/.test(cmpCode)
  && /\.gbc-name\s*\{[^}]*display: block/.test(cmp)
  && /\.gbc-countdown\s*\{[^}]*height: 18px/.test(cmp)
  && /\.gbc-tag\s*\{[^}]*white-space: nowrap/.test(cmp));
ok('1.2e 双列最后一张也保留同样的 margin，由根节点等量负 margin 抵掉'
  + '（stretch 拉平的是 margin box：最后一张归零会比同排另一张高出一格）'
  + '；根节点那一格必须是 style 串（小程序端三元里带对象字面量不会序列化，margin 会整格失效）',
  /type === 'double' \|\| index !== list\.length - 1/.test(cmpCode)
  && /type === 'double' \? 'margin-bottom:-'\s*\+\s*margin\s*\+\s*'px' : ''/.test(cmpCode)
  && !/type === 'double' \? \{/.test(cmpCode));
ok('1.3 类名一律 gbc- 前缀，没有裸 .box/.icon/.card/.title/.name/.price（M11 防全站互相覆盖）',
  !/^\s*\.(box|icon|card|title|name|price|info|cover|tag)\s*\{/m.test(cmp));
ok('1.4 双列那一档不放按钮（卡窄，按钮会挤掉价格），整卡可点',
  /v-if="type !== 'double'"/.test(cmpCode) && /@tap="goGoods\(item\)"/.test(cmpCode));

ok('1.5 价条第一行恒是一行（价 + 起 + 标签/原价），单列档第二行另起一行（列方向不许把这一行拆成三行）',
  /<view class="gbc-price-line">/.test(cmp)
  && /<view class="gbc-price-line" v-if="type === 'single'"/.test(cmp)
  && (cmp.match(/<view class="gbc-price-line"/g) || []).length === 2);
ok('1.6 单列档价条高度给下限不给定值（两行 18+12 加内衬 12 已经 52，写死 50 会压掉第二行）',
  /\.gbc-card\.single \.gbc-price-bar \{[^}]*min-height: 50px/.test(cmp) && !/\.gbc-card\.single \.gbc-price-bar \{[^}]*[^-]height: 50px/.test(cmp));

/* ───────────────────── ② 端上不重判（判据只在服务端） ───────────────────── */
ok('2.1 组件里没有来源/显示数量/两个隐藏开关的任何判据（M22：这些只在 DecorPage 生效）',
  !/\b(hide_ended|hide_sold_out|max_show_num)\b/.test(cmpCode) && !/\bitem\.source\b/.test(cmpCode));
ok('2.2 标签词条读后端 item.tag_text，端上不写死「人多更优惠 / N人团」',
  /item\.tag_text/.test(cmpCode) && !/人多更优惠/.test(cmpCode) && !/人团/.test(cmpCode));
ok('2.3 「起」读后端 price_from，端上不按活动类型自己判（阶梯型是否多档只有后端知道）',
  /item\.price_from/.test(cmpCode) && !/ladder/.test(cmpCode));
ok('2.4 状态词读后端 state_label，端上不写死「已失效 / 进行中」',
  /item\.state_label/.test(cmpCode) && !/已失效/.test(cmpCode) && !/进行中/.test(cmpCode));
ok('2.5 商品类型角标读后端 goods_type_text，显隐吃装修配置 showGoodsType',
  /item\.goods_type_text/.test(cmpCode) && /showGoodsType/.test(cmpCode) && /v-if="showType && item\.goods_type_text"/.test(cmpCode));

/* ───────────────────────── ③ 倒计时与销毁闸门 ───────────────────────── */
ok('3.1 整块卡片只有一只定时器（不是每行一只），且用 setInterval 每秒一跳',
  (cmpCode.match(/setInterval\(/g) || []).length === 1 && /now: Date\.now\(\)/.test(cmpCode));
ok('3.2 定时器在 beforeDestroy / beforeUnmount 两处都清（硬约束 23）',
  /beforeDestroy\(\)\s*\{\s*this\.clearTimer\(\)/.test(cmpCode)
  && /beforeUnmount\(\)\s*\{\s*this\.clearTimer\(\)/.test(cmpCode));
ok('3.3 每一跳都过已销毁闸门 _isDestroyed',
  /_isDestroyed/.test(cmpCode) && /that\._isDestroyed/.test(cmpCode));
ok('3.4 没有可倒数的行就不起定时器（hasCountdown 判据存在并被用到）',
  /hasCountdown\(\)/.test(cmpCode) && /if \(!this\.hasCountdown\)/.test(cmpCode));

/* ───────────────────────── ④ 去路与兜底 ───────────────────────── */
ok('4.1 「去拼团」落商品详情页：路径走 $nav.getPagePath(goods_id, goods_type)，不写死 pages 路径',
  /\$nav\.getPagePath\(item\.goods_id, item\.goods_type\)/.test(cmpCode)
  && !/\/pages\/app\/group_buy/.test(cmpCode) && !/'\/pages\//.test(cmpCode));
ok('4.2 封面失败有兜底（按活动 id 记失败 + tz-icon picture 占位，M27 键里不含点）',
  /imgErrors\[item\.id\]/.test(cmpCode) && /onCoverError/.test(cmpCode) && /name="picture"/.test(cmpCode));
/* 4.3 「去拼团」＝原生 `<text class="gbc-btn">`，六项尺寸逐值照抄装修预览 `.gb-btn`
   2026-10-29 用户点名两处：按钮被拉成整行宽（`u-button` 的 block 语义）、圆角与设计稿不一致。
   参照页（web 装修预览）优先于 M17 的 4px 按钮通则，故这里钉的是「与参照页同值」而不是 4px。 */
const refFile = read('../tuzi-web/src/views/page/decorate/components/mobile/components/group-buy.vue');
const ruleOf = (src, sel) => {
  const at = src.indexOf(sel + ' {');
  if (at < 0) return '';
  const end = src.indexOf('}', at);
  return end < 0 ? '' : src.slice(at, end + 1);
};
const gbcBtn = ruleOf(cmp, '.gbc-btn');
const gbBtn = ruleOf(refFile, '.group-buy-box .gb-btn');
const BTN_DECLS = ['flex-shrink: 0;', 'height: 24px;', 'line-height: 24px;', 'padding: 0 12px;',
  'border-radius: 12px;', 'linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)'];
const btnBad = BTN_DECLS.filter((d) => gbcBtn.indexOf(d) < 0 || gbBtn.indexOf(d) < 0);
ok('4.3 「去拼团」按内容收缩、六项尺寸与装修预览 .gb-btn 一致'
  + (btnBad.length ? '（缺：' + btnBad.join(' ') + '）' : ''),
  /<text class="gbc-btn"/.test(cmpCode) && !/<u-button\b/.test(cmpCode) && btnBad.length === 0);
ok('4.4 不用 rpx / 转圈加载态（§1 只用 px；DIY 组件数据随页面下发，不需要加载态）',
  !/rpx/.test(cmp) && !/u-loading|showLoading/.test(cmp));
ok('4.6 整卡与「去拼团」是同一条去路 ⇒ goGoods 必须防连点（组件那一发会冒泡到整卡，否则一次点进两层详情页）',
  /this\._navAt/.test(cmpCode) && /now - this\._navAt < 600/.test(cmpCode));
ok('4.5 价格文案复用共用工具 priceText（不在这里再写一份去尾零）',
  /import \{ priceText \} from '@\/common\/utils\/group-buy-share'/.test(cmpCode));

/* ───────────────── ⑤ 颜色契约（硬约束 29：有色底上每档实算对比） ───────────────── */
ok('5.1 小字档用深一档 #cf350e（白底 5.04、压在价条 #fff0ee 上 4.55，两处都过 4.5）',
  /color: #cf350e/.test(cmp));
ok('5.2 价条上的原价/标签用暖灰 #8a5a4d（冷灰 #86909c 压 #fff0ee 只有 2.92，禁用）',
  /color: #8a5a4d/.test(cmp) && !/color: #86909c/.test(cmpCode.split('.gbc-price-bar')[1] || ''));
ok('5.3 价条底色 #fff0ee',
  /background-color: #fff0ee/.test(cmp));
/* 「拼团」角标：2026-10-29 用户点名「左上角的拼团 tag 没有渐变，要参考 web 自定义页面中的拼团预览组件」
   ⇒ 参照页（装修预览 `.gb-badge-team`）优先，两边逐值同一条渐变；不再用纯色 #cf350e。
   渐变浅端白字只有 2.28:1（低于 4.5），这是用户点名的口径，改回纯色会被本条抓红。 */
const gbcBadge = ruleOf(cmp, '.gbc-badge-team');
const gbBadge = ruleOf(refFile, '.group-buy-box .gb-badge-team');
const BADGE_GRAD = 'linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%)';
ok('5.4 「拼团」角标底色＝装修预览同一条业务色渐变（两边逐值一致，且不再回落到纯色）',
  !!gbcBadge && !!gbBadge
  && gbcBadge.indexOf(BADGE_GRAD) > -1 && gbBadge.indexOf(BADGE_GRAD) > -1
  && !/background-color:\s*#cf350e/.test(gbcBadge));

/* ───────────────── ⑥ 装修页接线（四跳逐跳点名，硬约束 27③） ───────────────── */
ok('6.1 首页模板挂了组件，判据＝组件类型 AND 插件安装态（付费插件）',
  /<tz-group-buy-list v-if="item && item\.type == 'group_buy' && groupBuyInstalled"/.test(idx));
['list', 'type', 'show-goods-type', 'border', 'round', 'margin'].forEach((prop) => {
  ok('6.2 首页模板把 config.' + prop + ' 透给组件',
    new RegExp(':' + prop + '="data\\.compontents\\[index\\]\\.config\\.' + prop.replace(/-/g, '_') + '"').test(idx));
});
ok('6.3 安装态初值 false，取值键是 app_isinstall_group_buy（init 下发的那一枚）',
  /groupBuyInstalled: false/.test(idxjs)
  && /that\.groupBuyInstalled = !!that\.\$tools\.systemConfig\("app_isinstall_group_buy"\);/.test(idxjs));
ok('6.4 组件走 easycom（tz- 前缀），首页没有多余 import',
  !/import .*group-buy-list/.test(idx));

/* ───────────────── ⑦ 字段与后端逐键对上（少一键＝某一格永远空） ───────────────── */
const CARD_KEYS = ['id', 'name', 'type', 'type_text', 'tag_text', 'goods_id', 'goods_name', 'goods_cover',
  'goods_type', 'goods_type_text', 'price', 'price_from', 'origin_price', 'team_num',
  'start_time', 'end_time', 'state', 'state_label'];
const used = new Set();
const re = /\bitem\.([a-z_]+)/g;
let m;
while ((m = re.exec(cmpCode))) used.add(m[1]);
const missing = [...used].filter((k) => CARD_KEYS.indexOf(k) < 0);
ok('7.1 组件读的每一格都由后端 DecorPage 下发' + (missing.length ? '（多出：' + missing.join(',') + '）' : ''),
  missing.length === 0);
const notInBe = CARD_KEYS.filter((k) => CARDS.indexOf("'" + k + "'") < 0);
ok('7.2 DecorPageCards 的卡片键与端上读的键同一份' + (notInBe.length ? '（后端缺：' + notInBe.join(',') + '）' : ''),
  notInBe.length === 0);
ok('7.3 后端行口径 18 列且不下发运营列（admin_id / active_uniq / join_limit）',
  CARD_KEYS.length === 18 && !/'(admin_id|active_uniq|join_limit)'\s*=>/.test(CARDS)
  && /const FIELDS =/.test(ROWS) && !/'(admin_id|active_uniq|join_limit)'/.test(ROWS));

/* ───────────────── ⑧ 插件闸门与配置默认值 ───────────────── */
ok('8.1 DecorPage 自带 isInstall(group_buy) 自防护',
  /App::isInstall\('group_buy'\)/.test(code(DECOR)));
const modelCode = code(MODEL);
// 闸门两档都认：2026-10-14 起核心侧的 isInstall 收进 `goods\GroupBuy::ready()`，
// 只认字面 isInstall 会让「把判据收进适配器」这种正当整改把本条门禁弄红
const gateAt = Math.max(
  modelCode.indexOf("isInstall('group_buy')"),
  modelCode.indexOf('GroupBuy::ready()')
);
const useAt = modelCode.indexOf('group_buy\\DecorPage::components');
ok('8.2 核心装修模型先判安装、后引用插件类（顺序反了未安装时就是 Class not found）',
  gateAt > 0 && useAt > 0 && gateAt < useAt);
ok('8.3 服务端常量与装修端默认值同一档（缺省 6 / 上限 50）',
  /const DEFAULT_LIMIT = 6;/.test(DECOR) && /const MAX_SHOW = 50;/.test(DECOR)
  && /max_show_num: 6,/.test(read('../tuzi-web/src/views/page/decorate/diy.vue')));

/* ───────────────────────── 汇总 ───────────────────────── */
let fail = 0;
results.forEach((r) => {
  if (!r.pass) {
    fail++;
  }
  console.log((r.pass ? '[PASS] ' : '[FAIL] ') + r.name + (r.note ? ' :: ' + r.note : ''));
});
console.log('\n' + (results.length - fail) + '/' + results.length + ' 通过，失败 ' + fail);

if (process.argv.indexOf('--can-be-red') > -1) {
  // 反例：每条改一处源码，必须让脚本变红（能红才算钉住）
  const NEG = [
    // ① 版式：双列按钮那一条去掉 ⇒ 1.4 红
    [CMP, /v-if="type !== 'double'"/, 'v-if="true"'],
    // ② 端上重判：真把隐藏开关抄进方法体（不是写进注释——判据剥注释，写注释不算反例）⇒ 2.1 红
    [CMP, 'goGoods(item) {', 'goGoods(item) {\n\t\t\tif (item.hide_ended) { return; }'],
    // ③ 写死词条 ⇒ 2.2 红
    [CMP, '{{ item.tag_text }}', '人多更优惠'],
    // ④ 定时器不清 ⇒ 3.2 红（样件按当前文件行尾：LF）
    [CMP, '\tbeforeUnmount() {\n\t\tthis.clearTimer();', '\tbeforeUnmount() {'],
    // ⑤ 写死路径 ⇒ 4.1 红
    [CMP, "this.$nav.to(this.$nav.getPagePath(item.goods_id, item.goods_type));",
      "this.$nav.to('/pages/app/group_buy/detail/detail?team_id=' + item.id);"],
    // ⑩ 价条第一行也套上 v-if，两行都只在单列档出 ⇒ 1.5 红
    [CMP, '\t\t\t\t\t\t<view class="gbc-price-line">', '\t\t\t\t\t\t<view class="gbc-price-line" v-if="type === \'single\'">'],
    // ⑪ 单列档价条改回写死高度 ⇒ 1.6 红
    [CMP, '\tmin-height: 50px;', '\theight: 50px;'],
    // ⑨ 摘掉防连点 ⇒ 4.6 红
    [CMP, '\t\t\tif (this._navAt && now - this._navAt < 600) {', '\t\t\tif (false) {'],
    // ⑥ 冷灰压价条 ⇒ 5.2 红
    [CMP, 'color: #8a5a4d;', 'color: #86909c;'],
    // ⑦ 页面闸门摘掉安装态 ⇒ 6.1 红
    [IDX, "&& groupBuyInstalled", ''],
    // ⑧ 后端闸门摘掉 ⇒ 8.2 红（核心侧现行判据是 goods\GroupBuy::ready()）
    ['../tuzhi-selfbuilt-backend/application/common/model/page/Decorate.php',
      "&& \\app\\common\\model\\goods\\GroupBuy::ready()", ''],
    // ⑫ 按钮圆角改回 4px ⇒ 4.3 红（与参照页 .gb-btn 的 12px 不一致）
    [CMP, '\tborder-radius: 12px;', '\tborder-radius: 4px;'],
    // ⑬ 出卡少一枚键 ⇒ 7.2 红
    ['../tuzhi-selfbuilt-backend/application/common/library/app/group_buy/DecorPageCards.php',
      "'state_label' =>", "'state_labels' =>"],
    // ⑭ 列表封面改回写死 80（图片不再跟右侧文字拉伸）⇒ 1.2 红
    [CMP, '\theight: auto;\n\tmin-height: 80px;\n\talign-self: stretch;', '\theight: 80px;'],
    // ⑮ 双列价条去掉贴底 ⇒ 1.2c 红
    [CMP, '\theight: 28px;\n\tmargin-top: auto;', '\theight: 28px;\n\tmargin-top: 6px;'],
    // ⑯ 「拼团」角标改回纯色 ⇒ 5.4 红（与装修预览的渐变不一致；样件只命中角标那一条，
    //    不连带 .gbc-btn 的同一串渐变，保证红的是 5.4 这条判据本身）
    [CMP, '\tborder-radius: 0 0 8px 0;\n\tbackground: linear-gradient(90deg, #ff4b2b 0%, #ff8f2b 100%);',
      '\tborder-radius: 0 0 8px 0;\n\tbackground-color: #cf350e;'],
    // ⑰ 双列最后一张退回 margin 0（stretch 拉平 margin box 的老写法）⇒ 1.2e 红
    [CMP, "(type === 'double' || index !== list.length - 1) ? margin + 'px' : '0px'",
      "index === list.length - 1 ? '0px' : margin + 'px'"],
  ];
  let red = 0;
  NEG.forEach(([rel, from, to]) => {
    const file = path.isAbsolute(rel) ? rel : path.join(ROOT, rel);
    const target = path.resolve(ROOT, rel);
    const src = fs.readFileSync(target, 'utf8');
    const fromStr = typeof from === 'string' ? from : null;
    if (fromStr !== null && src.indexOf(fromStr) < 0) {
      console.log('[SKIP] 样件不匹配：' + rel + ' :: ' + fromStr.slice(0, 40));
      return;
    }
    const next = fromStr !== null ? src.split(fromStr).join(to) : src.replace(from, to);
    fs.writeFileSync(target, next);
    let broke = false;
    try {
      require('child_process').execSync('node ' + __filename, { encoding: 'utf8', cwd: path.resolve(ROOT, '..') });
    } catch (e) {
      broke = true;
    }
    fs.writeFileSync(target, src);
    if (broke) {
      red++;
    } else {
      console.log('[恒绿] 反例没让任何判据变红：' + rel + ' :: ' + String(from).slice(0, 40));
    }
    void file;
  });
  console.log('能红 ' + red + ' / ' + NEG.length);
  process.exit(0);
}
process.exit(fail ? 1 : 0);
