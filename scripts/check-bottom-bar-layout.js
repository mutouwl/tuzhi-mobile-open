/**
 * 共用底栏 `components/tz/bottom-btn.vue` 的**版式**闸门 —— 不构建、不开浏览器
 *
 * 为什么单拉一个脚本：2026-10-16 用户点名「底部按钮已经完全乱套了，立即按钮把拼团按钮覆盖掉了」
 * 与「分数（份数）这个步进选择器为什么要靠左侧呀」。这两条 `sfc-check`（只编译模板）、
 * `ui-audit`（只按正则查版式）、`check-group-buy-*`（只查接线与接口出口）**一条都看不见**：
 *
 *  ① **flex 分配**：主按钮的 `customStyle` 是 `width: 100%`（flex-basis 100%），而插件入口
 *     （拼团 / 送好友）是 `flex: 1`（basis 0）。容器没有剩余空间时 basis 0 的那一枚被压成 **0 宽**
 *     ⇒ 用户读作「被覆盖掉了」。这不是正则能判的：两个值各自都合法，错在**它们凑在一行里**。
 *  ② **行内间距**：插件入口是 `<view>`（H5 编译成 `uni-view`），匹配不到 `.box > div`
 *     那条按项写的 `margin: 0 5px` ⇒ 它左右邻居是 0 间距（用户问过「间距大小你觉得合适吗」）。
 *  ③ **形态照参照页**：购买栏（order）的同栏兄弟是纯图标，送好友那一枚却照**另一条栏**的
 *     `.control-btn` 抄了「图标 + 文字」两格（用户点名「左侧这几个 icon 都没有底下的文字，
 *     为什么你要添加呢」）。
 *
 * 所以本脚本做两件事：
 *  A. 源码形状（哪条分支带 `box--peer-main`、CSS 里有没有 `flex: 1` 与 `gap`、按项 margin 是否已撤净）；
 *  B. **真的算一遍 flex 分配**（把各子的 basis/grow/shrink/min 代进 flex 解析算法），
 *     逐档断言「插件入口宽度 > 0 且与主按钮等分」——并**反证**改造前那一档算出来是 0
 *     （证明这道判据抓的就是用户报的那一档，不是恒真的空断言）。
 *
 * 用法：node tuzi-mobile/scripts/check-bottom-bar-layout.js            # 验真件
 *       node tuzi-mobile/scripts/check-bottom-bar-layout.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BTN = path.join(ROOT, 'src/components/tz/bottom-btn.vue');
const GBB = path.join(ROOT, 'src/components/tz/group-buy-btn.vue');
const SFA = path.join(ROOT, 'src/components/tz/send-friend-area.vue');
// 2026-10-27 起购买栏不再挂送好友那一枚（入口在信息卡长条里）：③b 要读宿主那一份模板确认
const DETAIL = path.join(ROOT, 'src/pages/course/detail/detail.vue');
// 2026-10-29 第三次点名后：底栏插槽里的插件入口宽度规则落在全局表（两端都够得着），见 ⑥
const APP = path.join(ROOT, 'src/App.vue');
// 送好友入口是动态的：宿主「这一拍不占宽度」的旗子住在页面 data 里，见 ⑦
const DETAILJS = path.join(ROOT, 'src/pages/course/detail/js.vue');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}
const read = (f) => fs.readFileSync(f, 'utf8');
/** 注释不是界面/不是样式：判「有没有这一块」之前先剥干净，免得注释里的反面教材被判成命中 */
const stripComments = (s) => s
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
/** 取某个 `v-if="type == 'X'"` 那一整块（按缩进层级不靠谱，按下一个同级 view 开标签定位） */
function branchBlock(tmpl, type) {
  const at = tmpl.indexOf("v-if=\"type == '" + type + "'\"");
  if (at < 0) return '';
  const open = tmpl.lastIndexOf('<view', at);
  const rest = tmpl.slice(open + 5);
  const next = rest.indexOf('<view class="box');
  return tmpl.slice(open, next < 0 ? tmpl.length : open + 5 + next);
}
/** 取一段 CSS 规则体（选择器逐字匹配，避免 `.box` 命中 `.box--peer-main`） */
function cssRule(css, selector) {
  const re = new RegExp('(^|[}\\/\\s])' + selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}');
  const m = re.exec(css);
  return m ? m[2] : '';
}

/* ---------- flex 解析（按 CSS Flexbox 的 resolve-flexible-lengths 简化实现） ----------
   只求「谁被压成 0」这一个结论，所以够用：先按 basis 求和、负剩余按 shrink×basis 摊派，
   摊派时逐轮把撞到 min 的项冻住再重摊（这一步正是「主按钮 basis 100% ⇒ 插件入口 0 宽」的关键）。 */
function resolveFlex(items, containerW, gap) {
  const avail = containerW - gap * (items.length - 1);
  const w = items.map((it) => it.basis);
  let free = avail - w.reduce((a, b) => a + b, 0);
  if (free > 0) {
    const gsum = items.reduce((a, it) => a + it.grow, 0);
    if (gsum > 0) items.forEach((it, i) => { w[i] += free * it.grow / gsum; });
  } else if (free < 0) {
    let need = -free;
    let active = items.map((it, i) => i).filter((i) => items[i].shrink > 0 && w[i] > items[i].min + 1e-9);
    let guard = 0;
    while (need > 1e-9 && active.length && guard++ < 100) {
      const total = active.reduce((a, i) => a + items[i].shrink * items[i].basis, 0);
      if (total <= 0) break;
      let consumed = 0;
      const next = [];
      active.forEach((i) => {
        const cut = need * (items[i].shrink * items[i].basis) / total;
        const room = w[i] - items[i].min;
        if (cut >= room) { consumed += room; w[i] = items[i].min; }
        else { w[i] -= cut; consumed += cut; next.push(i); }
      });
      need -= consumed;
      active = next;
    }
  }
  return w;
}

/**
 * 购买栏（course `type="order"`）那一行的宽度模型。
 * 子项从左到右：N 枚纯图标 + 拼团 + 主按钮（`mainBasis` 分改造前/后两档）。
 * **2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，就不用在底部操作栏再显示
 * iconfont icon-lipin」⇒ 送好友那一格已从这个模型里撤掉**（它的入口在信息卡长条里，
 * 不在底栏 flex 行里；模型再留着那一格就会算出一条页面上并不存在的行宽）。
 * **常量一律从真源码现取**（不是抄进脚本的死数，否则改一处就静默过期）：
 *   图标数 = order 那条里 `<div class="icon"` 的枚数；
 *   图标字号 = `tz/icon.vue` 的 `size` 缺省；
 *   内衬与行距 = `.box` 的 `padding` 首值与 `gap`（gap 本身也是本门禁要钉的东西）。
 */
function readConstants() {
  const btn = read(BTN);
  const code = stripComments(btn);
  const tmpl = code.slice(0, code.indexOf('<script'));
  const css = code.slice(code.indexOf('<style'));
  const orderBlock = branchBlock(tmpl, 'order');
  const icons = (orderBlock.match(/<div class="icon"/g) || []).length;
  const iconSize = Number((/size:\s*\{\s*type:\s*\[Number,\s*String\],\s*default:\s*(\d+)/.exec(read(path.join(ROOT, 'src/components/tz/icon.vue'))) || [])[1] || 0);
  const boxRule = cssRule(css, '.tbb-bar');
  const padding = Number((/padding:\s*(\d+)px/.exec(cssRule(css, '.box')) || [])[1] || 0);
  const gap = Number((/gap:\s*(\d+)px/.exec(boxRule) || [])[1] || 0);
  return { icons, iconSize, padding, gap };
}

function orderBarWidths(viewportW, mainBasisPct, C) {
  const items = [];
  for (let i = 0; i < C.icons; i++) {
    items.push({ name: 'icon', basis: C.iconSize, grow: 0, shrink: 1, min: C.iconSize });
  }
  items.push({ name: 'gbb', basis: 0, grow: 1, shrink: 1, min: 0 });
  const content = viewportW - C.padding * 2;
  items.push({
    name: 'main',
    basis: content * mainBasisPct / 100,
    grow: mainBasisPct === 100 ? 0 : 1,
    shrink: 1,
    min: 60,
  });
  const w = resolveFlex(items, content, C.gap);
  return { gbb: w[w.length - 2], main: w[w.length - 1] };
}

/**
 * 控制栏（已订阅，`type="control"`）那一行的宽度模型。
 * 同一处被用户点了三次（2026-10-29）：① 送好友三行字 → ② 送好友占一半 → ③
 * 「收藏、评论、分享、送好友四个按钮为什么不能等宽」。
 * 终态口径：**每一枚都是 `flex: 1 1 0` + `min-width: 0`**（basis 0，不看内容、不看枚数），
 * 宽度规则一律落在 `App.vue` 的全局表（`.sf-control-slot` / `.tbb-slot`）：底栏组件自己的
 * 样式表够不着插槽宿主（MP 组件样式隔离 / H5 自动 scoped，见 bottom-btn.vue 那段注释）。
 *
 * 三种喂法：
 *   · `sfMode: 'equal'`     —— 合格档：四枚 flex:1，逐枚等分；
 *   · `sfMode: 'content'`   —— 反证档 A：全局表那条规则失效时插件入口按**内容**收缩（≈ 三字 12px
 *                             = 36px，用户实际看到的「窄一截」）；
 *   · `sfMode: 'width100'`  —— 反证档 B：组件根无条件 `width:100%`（basis = 整条栏宽 ⇒ 占一半）。
 * 另可传 `count`（3/4/5/6 枚）验「枚数变了还是等分」——百分比方案在这一轴必然会红。
 */
function controlBarWidths(viewportW, C, opts) {
  opts = opts || {};
  const count = opts.count || 4;          // 收藏 + 评论 + 分享 + 送好友
  const sfMode = opts.sfMode || 'equal';
  const content = viewportW - C.padding * 2;
  const items = [];
  for (let i = 0; i < count - 1; i++) {
    items.push({ name: 'btn' + i, basis: 0, grow: 1, shrink: 1, min: 0 });
  }
  const sf = { name: 'sf', basis: 0, grow: 1, shrink: 1, min: 0 };
  if (sfMode === 'content') { sf.basis = 36; sf.grow = 0; }
  if (sfMode === 'width100') { sf.basis = content; sf.grow = 0; }
  items.push(sf);
  return resolveFlex(items, content, C.gap);
}

/** 源码形状那几条（同一组判据喂坏样件也用它） */
function checkShape(src) {
  const code = stripComments(src);
  const tmpl = code.slice(0, code.indexOf('<script'));
  const css = code.slice(code.indexOf('<style'));
  const out = {};
  out.orderPeer = /<view class="box[^"]*box--peer-main[^"]*" v-if="type == 'order'"/.test(tmpl);
  // 空档那一支 2026-10-31 起是**动态 class**（`:class="['box', 'tbb-bar', 'box--peer-main', …]"`，
  // 要为拼团提交页挂 `tbb-bar--gb`），只认静态 `class=` 会让这条判据永远红（等于没有）。
  out.emptyPeer = /(?:class="box[^"]*box--peer-main[^"]*"|:class="[^"]*'box--peer-main'[^"]*")[^>]*v-if="type == ''"/.test(tmpl);
  out.submitPlain = !/box--peer-main[^>]*v-if="type == 'submit'"/.test(tmpl);
  out.evaluatePlain = !/box--peer-main[^>]*v-if="type == 'evaluate'"/.test(tmpl);
  out.peerRule = /\.box--peer-main\s+\.u-button\s*\{[^}]*flex:\s*1/.test(css);
  // 2026-10-31 实测：MP 端 u-button 是 **virtualHost** —— 组件标签不产生宿主节点，class 也不落到
  // 内部 `<button>` 上，底栏 wxss 进不去 u-button 内部 ⇒ 真正生效的只有 `customStyle` 的内联样式。
  // 所以 order / 空档所有主按钮必须绑 `mainBtnStyle`，且 computed 对这两档返回 basis 0 + min-width 0。
  // `.custom-style` 那条只留作老基础库（virtualHost 不可用）的兜底，不能单独当 MP 的判据。
  const mainStyleBinds = (block) => (block.match(/:customStyle="mainBtnStyle"/g) || []).length > 0;
  out.mainStyleBinds = mainStyleBinds(branchBlock(tmpl, 'order')) && mainStyleBinds(branchBlock(tmpl, ''));
  out.mainStyleInline = /mainBtnStyle\(\)\s*\{[\s\S]*?type\s*===\s*'order'[\s\S]*?return\s*\{\s*width:\s*'100%',\s*flex:\s*'1 1 0',\s*minWidth:\s*0\s*\}/.test(code);
  const peerHostRule = cssRule(css, '.box--peer-main .custom-style');
  out.peerHostRule = /flex:\s*1\s+1\s+0/.test(peerHostRule) && /min-width:\s*0/.test(peerHostRule);
  // 五条分支都带 `tbb-bar`（gap 的落点），且 gap 不许挂在裸 `.box` 上
  // —— 本 `<style>` 没有 scoped，`.box` 是全站共用类名（十几个组件都叫 `.box`），
  //    挂上去等于给全站每一处 `.box` 塞 10px 间距。
  //    五条分支都带 `tbb-bar`（gap 的落点）。submit 那一条是**动态 class**
  //    （`:class="['box', 'tbb-bar', 'h5-bottom-bar', {...}]"`，因为要按 theme 加 `tbb-bar--sf`），
  //    只数静态 `class="box…"` 会 stuck 在 4 —— 两种写法都要认，否则这条判据永远红、等于没有。
  out.allBars = (tmpl.match(/class="box[^"]*\btbb-bar\b/g) || []).length
    + (tmpl.match(/:class="\['box',\s*'tbb-bar'/g) || []).length === 5;
  out.gap = /\.tbb-bar\s*\{[^}]*gap:\s*10px/.test(css);
  out.noLeakGap = !/\.box\s*\{[^}]*\bgap\s*:/.test(css);
  out.noItemMargin = !/\.box\s*>\s*div\s*\{[^}]*margin\s*:/.test(css)
    && !/\.box\s+\.u-button\s*,[^{]*\{[^}]*margin\s*:/.test(css);
  return out;
}

const shapeOk = (s) => s.orderPeer && s.emptyPeer && s.submitPlain && s.evaluatePlain
  && s.peerRule && s.peerHostRule && s.mainStyleBinds && s.mainStyleInline
  && s.allBars && s.gap && s.noLeakGap && s.noItemMargin;

/**
 * ③b 送好友那一枚**不再占购买栏**（2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，
 * 就不用在底部操作栏再显示 iconfont icon-lipin」）。
 *
 * 三处要一起撤，只撤一处下一轮就会被挂回来：
 *   ① 组件的模板/样式里那一档 `.sfa-entry--order`（纯图标、`flex: none`）；
 *   ② `scene` 的缺省值不许再是 `'order'`（缺省值留着＝按老档摆的调用点还在）；
 *   ③ 宿主 `detail.vue` 的 `<slot="order-extra">` 里不许再挂 `tz-send-friend-area`。
 * 只判「宿主没挂」是不够的：样式与缺省值都是「这一档还在」的证据。
 */
function checkSfaOrderGone(sfaFileSrc, detailFileSrc) {
  const sfaCss = stripComments(sfaFileSrc.slice(sfaFileSrc.indexOf('<style')));
  const sfaCode = stripComments(sfaFileSrc);
  const detailSrc = stripComments(detailFileSrc);
  const cssGone = !/\.sfa-entry--order\s*\{/.test(sfaCss);
  const defaultGone = !/scene:\s*\{\s*type:\s*String,\s*default:\s*'order'/.test(sfaCode);
  const mountGone = !/<tz-send-friend-area[^>]*slot="order-extra"/.test(detailSrc);
  return {
    ok: cssGone && defaultGone && mountGone,
    got: 'CSS 档=' + (cssGone ? '撤' : '在') + ' / 缺省 order=' + (defaultGone ? '撤' : '在')
      + ' / order-extra 挂载=' + (mountGone ? '撤' : '在'),
  };
}

/**
 * ⑤ 「并排两枚以上按钮」的底栏：间距必须有来源（容器 gap 或每格 padding），不许贴死。
 *
 * 这是本条正半句的**普查面**：上一轮给六个页面各加了一枚拼团入口（course/exam 走共用底栏，
 * 其余四页各自底栏自带一枚 `gb-btn`），每一处都得自己回答「新加的那一枚与原有那一枚之间
 * 隔了多少」——`checkin/intro` 那一版就是漏了（`.cdi-main-btn{flex:1}` 两枚并排、容器
 * `.school-footer` 没有 gap、价格档的 `margin-right` 只撑开了价格那一档）⇒ 两枚按钮贴死，
 * 2026-10-16 全面 review 时抓到并改成容器 gap。
 */
const PEER_BARS = [
  { name: '实物商详', tpl: 'src/pages/app/physical/detail/detail.vue', css: 'src/pages/app/physical/detail/css.css', bar: '.detail-tabbar', rule: /\.detail-tabbar\s*\{[^}]*gap:\s*10px/ },
  { name: '组合商详', tpl: 'src/pages/app/composite/detail/detail.vue', css: 'src/pages/app/composite/detail/css.css', bar: '.tabbar-right', rule: /\.tabbar-right\s*\{[^}]*gap:\s*10px/ },
  { name: '圈子预售', tpl: 'src/pages/app/circle/presale/presale.vue', css: 'src/pages/app/circle/presale/css.css', bar: '.footer-btn-group', rule: /\.footer-btn-group\s*\{[^}]*gap:\s*10px/ },
  { name: '打卡介绍', tpl: 'src/pages/app/checkin/intro/intro.vue', css: 'src/pages/app/checkin/intro/css.css', bar: '.cdi-footer', rule: /\.cdi-footer\s*\{[^}]*gap:\s*12px/ },
  // 拼团详情页 2026-10-28 起不再并排：动作区改成**竖排两枚**（`tz-button size="normal" long` 各占整行），
  // 间距由 `.gbd-action-gap{height:12px}` 那一条给（原先的 `.gbd-foot-cell{padding:0 6px}` 那一版已删）。
  // 这一档留在普查里是为了「这一页也在清单里被看过」，判据换成现在的形状。
  { name: '拼团详情', tpl: 'src/pages/app/group_buy/detail/detail.vue', css: 'src/pages/app/group_buy/detail/detail.vue', bar: '.gbd-actions', rule: /\.gbd-action-gap\s*\{\s*height:\s*12px/ },
];

function checkPeerBars() {
  return PEER_BARS.map((p) => {
    const tpl = read(path.join(ROOT, p.tpl));
    const css = read(path.join(ROOT, p.css));
    // 模板里找的是类名本身（`class="detail-tabbar …"`），CSS 里找的才是 `.detail-tabbar { … }`
    const cls = p.bar.replace(/^\./, '');
    const inTpl = new RegExp('class="[^"]*\\b' + cls + '\\b').test(tpl);
    return {
      name: p.name,
      ok: inTpl && p.rule.test(css),
      got: p.name + '：栏类=' + (inTpl ? '在' : '缺') + ' / 间距来源=' + (p.rule.test(css) ? '有' : '无'),
    };
  });
}

/**
 * ⑥ 插件入口的宽度口径（2026-10-29 同一处被点了三次：底栏两枚不等宽 → 送好友三行字 →
 * 送好友占一半 → 「收藏、评论、分享、送好友 四个按钮为什么不能等宽」）。
 *
 * 前两轮把宽度规则写在 `bottom-btn.vue` 的样式表里（`.box--peer-main .tbb-slot{flex:1}` /
 * `.control-box .sf-control-slot{width:24%}`），**两个端都是死的**：
 *   · 小程序端：这一行的 flex 项是自定义组件的**宿主节点**（页面所有），组件 wxss 受样式隔离；
 *     子组件根类（`.gbb-entry` / `.sfa-entry`）写在组件自己 wxss 里，同样到不了宿主；
 *   · H5 端：uni-app 把组件样式自动 scoped，规则里的 `[data-v-底栏]` 要求插槽节点带**底栏的**
 *     scope id，而插槽内容是页面渲染的（只带页面的 scope id）⇒ 选择器不命中。
 * 症状就是插件入口按内容收缩（≈36px）、同栏 `.control-btn` 等分 ⇒ 四枚里有一枚窄一截。
 *
 * 终态（本轮）：宽度一律落在**全局样式表 `src/App.vue`**（H5 全局 CSS / 小程序 app.wxss 两端都够得着），
 * 且所有入口同一档 `flex: 1 1 0 + min-width: 0`（basis 0，不看内容、不看枚数）。五处缺一不可：
 *   ① `App.vue` 有 `.sf-control-slot, .tbb-slot { flex: 1 1 0; min-width: 0 }`；
 *   ② `bottom-btn.vue` 的 `.control-btn` 也是 `flex: 1 1 0 + min-width: 0`，**不许再写百分比宽**；
 *   ③ `bottom-btn.vue` **不许**再出现 `.tbb-slot` / `.sf-control-slot` 的宽度规则（写了也是死规则，
 *      下一个人还会以为它在生效）；
 *   ④ 每个 `slot="order-extra"` 的拼团入口标签都带 `class="tbb-slot"`（铺开普查）；
 *   ⑤ 送好友控制栏那一枚：根节点 H5 侧 `flex: 1 1 0`、`width:100%` 只许在 `#ifdef MP` 里
 *      （H5 根就是 flex 项，无条件 `width:100%` = 又回到「占一半」那一版）。
 */
function walkVue(dir, out) {
  fs.readdirSync(dir).forEach((name) => {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) { walkVue(p, out); }
    else if (/\.vue$/.test(name)) { out.push(p); }
  });
  return out;
}

/**
 * ⑦a 的普查：所有挂进 `slot="order-extra"` 的拼团入口，**每个调用点都要点出宿主 class，且带 `v-if`**。
 *
 * 为什么 `v-if` 是必须的（2026-10-29 用户「下面的按钮不一定是固定 4 个，这个送好友它是动态显示的，
 * 你要做兼容处理」）：MP 端这一行的 flex 项是自定义组件的**宿主节点**，它不随组件根的 `v-if` 消失。
 * 摘要为空（未装 / 没进行中活动 / 已结束 / 取数失败）时组件根不渲染，宿主却仍按 `flex:1 1 0`
 * 吃掉一格的宽度 —— 没开拼团的店会看到「主按钮只占半条栏、右半边一片空白」。
 * 拼团这一枚是**无状态**的（摘要全由宿主 `gbEntry` 传进来），卸载重挂没有副作用，所以用 `v-if` 最干净。
 * 送好友那一枚不能这么干（要保持挂载接 `reload()`），走 `.sf-control-slot--off{display:none}`（⑦b–⑦e）。
 */
function collectGroupBuySites(sources) {
  const list = sources || walkVue(path.join(ROOT, 'src/pages'), []).map((f) => ({ file: f, src: read(f) }));
  const missing = [];
  const noGate = [];
  list.forEach((it) => {
    const src = stripComments(it.src);
    const label = path.relative(ROOT, it.file);
    const re = /<tz-group-buy-btn\b[^>]*>/g;
    let m;
    while ((m = re.exec(src)) !== null) {
      const tag = m[0];
      if (!/slot="order-extra"/.test(tag)) continue;
      if (!/class="[^"]*\btbb-slot\b/.test(tag)) missing.push(label);
      // `v-if` 必须吃活动摘要（`v-if="true"` 这种常量不算）；`v-else` / `v-show` 都不认
      if (!/\bv-if="[^"]*gbEntry[^"]*"/.test(tag)) noGate.push(label);
    }
  });
  return { missing: missing, noGate: noGate };
}

function checkHostSlots(over) {
  over = over || {};
  const btn = over.btn || read(BTN);
  const btnCss = stripComments(btn.slice(btn.indexOf('<style')));
  const sfaSrc = over.sfa || read(SFA);
  // MP 端判据要看得见 `/* #ifdef MP */`（stripComments 会把它当注释删掉，所以留一份原文）
  const sfaRawCss = sfaSrc.slice(sfaSrc.indexOf('<style'));
  const detailTpl = stripComments(over.detail || read(DETAIL));
  const appSrc = over.app || read(APP);
  const appCss = stripComments(appSrc.slice(appSrc.indexOf('<style')));
  const out = {};

  // ① 全局表那一条：两个宿主 class 同一条规则、flex: 1 1 0 + min-width: 0
  //    （按「选择器里同时出现这两个 class」找，不假设是逗号列表还是并列写法）
  let globalBody = '';
  const ruleRe = /([^{}]*\.(?:sf-control-slot|tbb-slot)[^{}]*)\{([^{}]*)\}/g;
  let rm;
  while ((rm = ruleRe.exec(appCss)) !== null) {
    const sel = rm[1];
    if (/\.sf-control-slot/.test(sel) && /\.tbb-slot/.test(sel)) { globalBody = rm[2]; break; }
  }
  out.appGlobalRule = /flex:\s*1\s+1\s+0/.test(globalBody) && /min-width:\s*0/.test(globalBody);
  out.appGlobalBody = globalBody.replace(/\s+/g, ' ').trim();

  // ② `.control-btn` 等分、不写百分比宽
  out.controlBtnFlex = /\.control-btn\s*\{[^}]*flex:\s*1\s+1\s+0/.test(btnCss)
    && /\.control-btn\s*\{[^}]*min-width:\s*0/.test(btnCss);
  out.controlBtnNoPct = !/\.control-btn\s*\{[^}]*width:\s*[\d.]+%/.test(btnCss);

  // ③ 底栏组件里不许再有宿主宽度的死规则
  out.noDeadSlotRule = !/\.(box--peer-main|control-box)[^{]*\.(tbb-slot|sf-control-slot)[^{]*\{/.test(btnCss);

  out.detailSlot = /<tz-group-buy-btn[^>]*\bclass="tbb-slot"[^>]*slot="order-extra"|<tz-group-buy-btn[^>]*slot="order-extra"[^>]*\bclass="tbb-slot"/.test(detailTpl);
  out.detailSfSlot = /<tz-send-friend-area[^>]*\bclass="sf-control-slot"/.test(detailTpl);

  // ⑤ 组件根：H5 侧 flex: 1 1 0 + min-width: 0；width:100% 必须在 MP 条件块里
  const sfaH5Css = stripComments(sfaRawCss.replace(/\/\*\s*#ifdef\s+MP\s*\*\/[\s\S]*?\/\*\s*#endif\s*\*\//g, ''));
  out.sfRootFlex = /\.sfa-entry--control\s*\{[^}]*flex:\s*1\s+1\s+0/.test(sfaH5Css)
    && /\.sfa-entry--control\s*\{[^}]*min-width:\s*0/.test(sfaH5Css);
  out.sfRootFollowsMp = /\/\*\s*#ifdef\s+MP\s*\*\/[\s\S]*?\.sfa-entry--control\s*\{[^}]*width:\s*100%[\s\S]*?\/\*\s*#endif\s*\*\//.test(sfaRawCss);
  out.sfRootH5NoWidth = !/\.sfa-entry--control\s*\{[^}]*width:\s*[\d.]+(%|px|rpx)/.test(sfaH5Css);

  // 铺开：所有把拼团入口塞进 order-extra 的调用点都必须点出宿主 class，且**必须带 `v-if`**
  // （2026-10-29 用户「下面的按钮不一定是固定 4 个，这个送好友它是动态显示的，你要做兼容处理」）：
  // 小程序端宿主节点不随组件根的 `v-if` 消失，没有 `v-if` 时没活动的店会白占半条栏
  // `over.pageSources` 只给 --selftest 喂坏样件用（真实调用不传，扫全部页面）
  const sites = collectGroupBuySites(over.pageSources);
  out.allCallSites = sites.missing.length === 0;
  out.missing = sites.missing;
  out.allGated = sites.noGate.length === 0;
  out.noGate = sites.noGate;

  // ⑦ 送好友那一枚是**动态**的（未装 / 开关关 / 品类不可送 / 积分商品都会收掉），
  //    所以它的宿主还多一层「这一拍不占宽度」：`display:none` 那一档 + 组件把判据落定时抛 `visible`。
  //    `display:none` 而不是 `v-if` 卸载：页面下拉刷新 / 支付回来还要 `$refs.sfArea.reload()` 重新点亮。
  out.offRule = /\.sf-control-slot--off[^{]*\{[^}]*display:\s*none/.test(appCss);
  out.sfVisibleEmit = /emits:\s*\[[^\]]*'visible'/.test(sfaSrc)
    && /this\.\$emit\('visible',\s*!!\(this\.installed && this\.entry\)\)/.test(sfaSrc);
  out.detailSfOffClass = /<tz-send-friend-area[\s\S]*?sf-control-slot--off[\s\S]*?@visible="sfEntryShown = \$event"/.test(detailTpl);
  // ⑦ 旗子：`stripComments` 在这份 js 上会吞掉中段（存在成对错位的块注释），这一条改读原文即可
  out.detailSfFlag = /sfEntryShown:\s*true\b/.test(over.detailJs || read(DETAILJS));

  out.ok = out.appGlobalRule && out.controlBtnFlex && out.controlBtnNoPct && out.noDeadSlotRule
    && out.detailSlot && out.detailSfSlot
    && out.sfRootFlex && out.sfRootFollowsMp && out.sfRootH5NoWidth && out.allCallSites
    && out.allGated && out.offRule && out.sfVisibleEmit && out.detailSfOffClass && out.detailSfFlag;
  return out;
}

(async () => {
  if (process.argv.indexOf('--selftest') >= 0) return selftest();

  console.log('=== check-bottom-bar-layout（共用底栏版式：flex 分配 / 行内间距 / 按栏形态）===');
  const btnSrc = read(BTN);
  const gbbSrc = read(GBB);
  const sfaSrc = read(SFA);

  // ① 主按钮与插件入口等分（order 与空档两条；submit 那条不许带 —— 它的 `.price{width:400px}`
  //    配上 flex:1 会把支付按钮压成 0）
  const s = checkShape(btnSrc);
  assert('① order 与空档两条底栏带 box--peer-main（submit / evaluate 两条不带）',
    shapeOk(s), JSON.stringify(s));

  // ② 行内间距只由容器 gap 给（硬约束 20），且落点必须是底栏自己的 `.tbb-bar`、不许挂在裸 `.box` 上
  assert('② 行内间距只由 `.tbb-bar { gap: 10px }` 给，按项 margin 已撤净（插件入口是 uni-view，匹配不到 `.box > div`）',
    s.allBars && s.gap && s.noLeakGap && s.noItemMargin,
    '五条分支都带 tbb-bar=' + s.allBars + ' gap=' + s.gap + ' 没挂在裸 .box 上=' + s.noLeakGap + ' 按项 margin 已撤=' + s.noItemMargin);

  // ③ 插件入口自身的 flex 档
  const gbbCss = stripComments(gbbSrc.slice(gbbSrc.indexOf('<style')));
  const sfaCss = stripComments(sfaSrc.slice(sfaSrc.indexOf('<style')));
  assert('③ 拼团入口 `flex: 1 + min-width: 0`（占位靠 flex，不靠 width）',
    /\.gbb-entry\s*\{[^}]*flex:\s*1/.test(gbbCss) && /min-width:\s*0/.test(cssRule(gbbCss, '.gbb-entry')),
    'gbb-entry=' + cssRule(gbbCss, '.gbb-entry').replace(/\s+/g, ' ').trim());
  // ③c 同栏**主按钮**的宽度档（2026-10-31 用户点名活动详情页「立即报名接近百分百、
  //    立即拼团只剩 10px」）：MP 端 u-button 是 **virtualHost**，没有宿主节点、class 也不落到
  //    内部 `<button>` 上，所以真正生效的是 `customStyle` 内联的 `flex:1 1 0; min-width:0`
  //    （③d）。`.custom-style` 那条只留作老基础库（virtualHost 不可用）的兜底。
  assert('③c 老基础库兜底：`.box--peer-main .custom-style` 有 `flex: 1 1 0 + min-width: 0`',
    s.peerHostRule, 'peerHostRule=' + s.peerHostRule);
  // ③d **当前基础库（virtualHost）真正生效的那一档**：order / 空档三端所有主按钮绑
  //    `customStyle="mainBtnStyle"`，computed 返回 `{ width:'100%', flex:'1 1 0', minWidth:0 }`。
  //    只改 CSS 不改这里，MP 端按钮仍是 inline width:100% ⇒ 拼团入口 0 宽（上一版的假绿就在这）。
  assert('③d 小程序端主按钮走 `customStyle` 内联：order / 空档的 u-button 都绑 mainBtnStyle，'
    + '且返回 `flex:1 1 0 + minWidth:0`（virtualHost 下 class 不落地，wxss 也进不去 u-button 内部）',
    s.mainStyleBinds && s.mainStyleInline,
    'binds=' + s.mainStyleBinds + ' inline=' + s.mainStyleInline);
  // ③b 送好友不再占购买栏（2026-10-27 用户点名「送好友已经有 sfa-entry sfa-entry--card 了，
  //    就不用在底部操作栏再显示 iconfont icon-lipin」）：
  //    组件里那一档（`--order` 纯图标 + `flex: none` + `scene` 缺省 order）与宿主 order-extra
  //    里那一枚必须一起撤净 —— 只撤一半（入口撤了、CSS/缺省值还留着）下一轮就会有人把它挂回来。
  const sfaOrder = checkSfaOrderGone(sfaSrc, read(DETAIL));
  assert('③b 送好友不再占购买栏：`.sfa-entry--order` 档 / `scene` 缺省 order / 宿主 order-extra 那一枚，三处一起为 0',
    sfaOrder.ok, sfaOrder.got);

  // ④ 真的算一遍：375 / 320 两档视口，插件入口与主按钮都必须拿到宽度且等分
  //    （常量从真源码现取：图标枚数 / 字号 / 内衬 / gap，见 readConstants）
  const C = readConstants();
  assert('④ 模型常量从真源码取到（图标 ' + C.icons + ' 枚 × ' + C.iconSize + 'px、内衬 ' + C.padding + 'px、行距 ' + C.gap + 'px）',
    C.icons > 0 && C.iconSize > 0 && C.padding > 0 && C.gap > 0, JSON.stringify(C));
  [375, 320].forEach((W) => {
    // 合格档的 basis 按**真实生效的那一档**取：当前基础库靠 ③d 的内联 flex（virtualHost），
    // 老基础库靠 ③c 的宿主档；两者都没有 ⇒ 主按钮仍按 inline width:100% 算 basis，
    // 正是 2026-10-31 用户在 MP 看到的那一版（拼团入口 0 宽）。
    const mainBasis0 = (s.mainStyleBinds && s.mainStyleInline) || s.peerHostRule;
    const after = orderBarWidths(W, mainBasis0 ? 0 : 100, C);
    const before = orderBarWidths(W, 100, C); // 主按钮 basis = 整条栏宽（缺档那一版）
    assert('④ ' + W + 'px 视口：拼团入口与主按钮等分剩余宽度（各 ' + after.gbb.toFixed(1) + 'px）',
      after.gbb > 0 && Math.abs(after.gbb - after.main) < 0.01 && after.gbb >= 60,
      'gbb=' + after.gbb.toFixed(1) + ' main=' + after.main.toFixed(1));
    assert('④ ' + W + 'px 视口 · 反证：主按钮宿主 basis=100%（`.custom-style` 没被宿主档盖住）算出来拼团入口 ' + before.gbb.toFixed(1) + 'px',
      before.gbb < 0.01 && before.main > 100,
      'gbb=' + before.gbb.toFixed(1) + ' main=' + before.main.toFixed(1) + '（0 宽就是用户读到的「被覆盖 / 只剩一道缝」）');
  });

  // ⑤ 普查：六个挂了拼团入口的底栏，并排两枚以上时的间距来源都在
  const peerBars = checkPeerBars();
  peerBars.forEach((r) => assert('⑤ ' + r.name + ' 底栏并排按钮的间距有来源（容器 gap 或每格 padding）', r.ok, r.got));

  // ⑥ 插件入口宽度（2026-10-29 同一处三次点名：两枚不等宽 / 送好友三行 / 四个按钮不等宽）
  const hs = checkHostSlots();
  assert('⑥a 全局表 `App.vue` 里有 `.sf-control-slot, .tbb-slot { flex: 1 1 0; min-width: 0 }`'
    + '（写进底栏组件的样式表两端都够不着插槽宿主）',
    hs.appGlobalRule, 'body=' + hs.appGlobalBody);
  assert('⑥b 控制栏 `.control-btn` 也是 `flex: 1 1 0 + min-width: 0`，且不再写百分比宽',
    hs.controlBtnFlex && hs.controlBtnNoPct,
    'flex=' + hs.controlBtnFlex + ' 无百分比=' + hs.controlBtnNoPct);
  assert('⑥c 底栏组件里不再留着宿主宽度的死规则（`.box--peer-main .tbb-slot` / `.control-box .sf-control-slot`）',
    hs.noDeadSlotRule, 'noDeadSlotRule=' + hs.noDeadSlotRule);
  assert('⑥d 课程商详：拼团入口挂 `.tbb-slot`、控制栏送好友挂 `.sf-control-slot`（class 必须落在组件标签上，那是全局表能选中它的唯一抓手）',
    hs.detailSlot && hs.detailSfSlot, 'gbb=' + hs.detailSlot + ' sf=' + hs.detailSfSlot);
  assert('⑥e 送好友根节点：H5 侧 `flex:1 1 0`、`width:100%` 只许在 `#ifdef MP` 里（H5 根就是 flex 项，无条件 100% = 「占一半」那一版）',
    hs.sfRootFlex && hs.sfRootFollowsMp && hs.sfRootH5NoWidth,
    'H5 flex=' + hs.sfRootFlex + ' MP 条件块里的 100%=' + hs.sfRootFollowsMp + ' H5 无宽度=' + hs.sfRootH5NoWidth);
  assert('⑥f 铺开：所有塞进 `slot="order-extra"` 的拼团入口都点了宿主 class（缺一个就回到「一枚按内容收缩、一枚吃掉剩余」）',
    hs.allCallSites, hs.allCallSites ? '全部到位' : ('漏：' + hs.missing.join('、')));

  // ⑥g 控制栏真的算一遍：合格档四枚等分；两个反证档必须「不等宽」（证明这道判据抓的就是用户看的那一版）
  [375, 320].forEach((W) => {
    const eq = controlBarWidths(W, C);                     // 合格档：四枚 flex:1 1 0
    const even = eq.every((x) => Math.abs(x - eq[0]) < 0.01);
    assert('⑥g ' + W + 'px 控制栏（已订阅）：收藏 / 评论 / 分享 / 送好友四枚等分（各 ' + eq[3].toFixed(1) + 'px）',
      even && eq[3] >= 60, 'sf=' + eq[3].toFixed(1) + ' 兄弟=' + eq[0].toFixed(1));

    // 枚数轴：3~6 枚都必须等分（百分比方案在这一轴必红，这就是本轮根因）
    const counts = [3, 4, 5, 6].map((n) => {
      const w = controlBarWidths(W, C, { count: n });
      return w.every((x) => Math.abs(x - w[0]) < 0.01);
    });
    assert('⑥g ' + W + 'px 控制栏：3 / 4 / 5 / 6 枚都等分（目录、打卡按条件出，枚数会变）',
      counts.every(Boolean), JSON.stringify(counts));

    const content = controlBarWidths(W, C, { sfMode: 'content' });  // 反证 A：全局规则失效 ⇒ 内容宽
    assert('⑥g ' + W + 'px 控制栏 · 反证 A：宿主规则失效时送好友按内容收缩，算出 ' + content[3].toFixed(1)
      + 'px ≠ 兄弟 ' + content[0].toFixed(1) + 'px（用户读到的「不等宽」）',
      Math.abs(content[3] - content[0]) > 1,
      'sf=' + content[3].toFixed(1) + ' 兄弟=' + content[0].toFixed(1));

    const half = controlBarWidths(W, C, { sfMode: 'width100' });    // 反证 B：根上无条件 width:100%
    assert('⑥g ' + W + 'px 控制栏 · 反证 B：组件根无条件 width:100% 时送好友算出 ' + half[3].toFixed(1)
      + 'px（≈ 半条栏），兄弟只剩 ' + half[0].toFixed(1) + 'px',
      half[3] > eq[0] * 2 && half[3] > (W - C.padding * 2) * 0.4,
      'sf=' + half[3].toFixed(1) + ' 兄弟=' + half[0].toFixed(1));
  });

  // ⑦ 入口是**动态的**：枚数随插件/开关/品类/积分商品变，空宿主不许白占一格
  assert('⑦a 拼团那一枚的每个调用点都带 `class="tbb-slot"` **且** `v-if` 吃 `gbEntry`'
    + '（没有 v-if 时没活动的店在 MP 端白占半条栏、主按钮被挤成一半）',
    hs.allGated, hs.allGated ? '全部到位' : ('漏：' + hs.noGate.join('、')));
  assert('⑦b 送好友「这一拍不占宽度」那一档在全局表（`.sf-control-slot--off{display:none}`，连 gap 一起收掉）',
    hs.offRule, 'offRule=' + hs.offRule);
  assert('⑦c 送好友组件把判据落定时抛 `visible`（`emits` 声明 + `$emit(\'visible\', !!(installed && entry))`）',
    hs.sfVisibleEmit, 'emit=' + hs.sfVisibleEmit);
  assert('⑦d 课程商详：送好友宿主挂 `sf-control-slot--off` 且接 `@visible`（**不是 v-if 卸载**——要留 `$refs.sfArea` 给刷新/支付回来重新点亮）',
    hs.detailSfOffClass, 'offClass+visible=' + hs.detailSfOffClass);
  assert('⑦e 页面旗子 `sfEntryShown` 初值必须是 `true`（给 false ⇒ 组件挂不上、永远收不到 visible，硬约束 31② 的自锁）',
    hs.detailSfFlag, 'sfEntryShown=true=' + hs.detailSfFlag);

  console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
    : '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
  process.exitCode = fail === 0 ? 0 : 1;

  // ── 坏样件：同一组判据喂「非命中不可」的样件，验这道门禁能红 ──────────────
  function selftest() {
    console.log('=== --selftest：坏样件必须每一条都被同一组判据抓红 ===');
    let fired = 0;
    const expect = (name, ok, got) => {
      if (ok) { console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到（门禁是瞎的）-> ' + got); fail++; }
      else { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红 -> ' + got); pass++; }
    };
    const real = read(BTN);
    // ⚠ 所有 patch 一律用正则（源文件是 CRLF）：拿含 `\n` 的字面串去 replace 会静默不命中，
    //   那一条样件就成了「假绿」（坏样件 4 第一版就是这么假绿过的）。

    // 坏样件 1：order 那条没带 box--peer-main（= 主按钮 width:100%，插件入口被压成 0）
    const BAD_NO_PEER = real.replace(/box tbb-bar box--peer-main h5-bottom-bar" v-if="type == 'order'"/,
      'box tbb-bar h5-bottom-bar" v-if="type == \'order\'"');
    expect('坏样件 1：order 那条没带 box--peer-main', shapeOk(checkShape(BAD_NO_PEER)), JSON.stringify(checkShape(BAD_NO_PEER)));

    // 坏样件 2：把按项 margin 加回来（插件入口 0 间距那一版）
    const BAD_MARGIN = real.replace(/\.tbb-bar \{/, '.box>div {\r\n    margin: 0 5px;\r\n}\r\n.tbb-bar {');
    expect('坏样件 2：按项 margin 又回来了', checkShape(BAD_MARGIN).noItemMargin, 'noItemMargin=' + checkShape(BAD_MARGIN).noItemMargin);

    // 坏样件 3：gap 被摘掉
    const BAD_NO_GAP = real.replace(/(\.tbb-bar \{[\s\S]*?)gap:\s*10px;/, '$1');
    expect('坏样件 3：容器 gap 被摘掉', checkShape(BAD_NO_GAP).gap, 'gap=' + checkShape(BAD_NO_GAP).gap);

    // 坏样件 4：peer 规则写成了别的（`.box--peer-main .u-button { flex: 0 0 auto }`）
    const BAD_RULE = real.replace(/(\.box--peer-main \.u-button \{[\s\S]*?)flex:\s*1 1 0;/, '$1flex: 0 0 auto;');
    expect('坏样件 4：peer 规则不是 flex: 1', checkShape(BAD_RULE).peerRule, 'peerRule=' + checkShape(BAD_RULE).peerRule);

    // 坏样件 4b：主按钮**宿主**档被摘掉（老基础库兜底那一档）
    const BAD_HOST_RULE = real.replace(/\n\.box--peer-main \.custom-style \{[\s\S]*?\}/, '');
    expect('坏样件 4b：主按钮宿主兜底丢了 `flex: 1 1 0`（`.custom-style` 的 width:100% 把 basis 撑成整条栏）',
      checkShape(BAD_HOST_RULE).peerHostRule, 'peerHostRule=' + checkShape(BAD_HOST_RULE).peerHostRule);

    // 坏样件 4c：当前基础库真正生效的 `customStyle` 内联档被摘掉（上一版的假绿：只改了 CSS）
    const BAD_MAIN_INLINE = real.replace(/, flex: '1 1 0', minWidth: 0/, '');
    expect('坏样件 4c：`mainBtnStyle` 丢了 `flex: 1 1 0 + minWidth: 0`（virtualHost 下按钮回到 inline width:100%）',
      checkShape(BAD_MAIN_INLINE).mainStyleInline, 'inline=' + checkShape(BAD_MAIN_INLINE).mainStyleInline);

    // 坏样件 4d：模板没把主按钮绑到 mainBtnStyle（CSS/计算属性都在，但没接到按钮上）
    const BAD_MAIN_BIND = real.replace(/:customStyle="mainBtnStyle"/g, ':customStyle="{ width: \'100%\' }"');
    expect('坏样件 4d：order / 空档的主按钮没绑 `customStyle="mainBtnStyle"`（规则接不到按钮上）',
      checkShape(BAD_MAIN_BIND).mainStyleBinds, 'binds=' + checkShape(BAD_MAIN_BIND).mainStyleBinds);

    // 坏样件 5：gap 挂到裸 `.box` 上（本 `<style>` 没有 scoped ⇒ 会给全站每一处 `.box` 塞 10px 间距）
    const BAD_LEAK = real.replace(/\.tbb-bar \{\r?\n\s*gap: 10px;\r?\n\}/, '.box {\r\n    gap: 10px;\r\n}');
    expect('坏样件 5：gap 挂到了裸 `.box` 上（全站共用类名，会外溢）',
      checkShape(BAD_LEAK).noLeakGap, 'noLeakGap=' + checkShape(BAD_LEAK).noLeakGap + ' gap=' + checkShape(BAD_LEAK).gap);

    // 坏样件 6：五条分支里有一条漏了 `tbb-bar`（gap 只落到四条上）
    const BAD_MISS_BAR = real.replace(/box control-box tbb-bar h5-bottom-bar/, 'box control-box h5-bottom-bar');
    expect('坏样件 6：五条分支里漏了一条 tbb-bar', checkShape(BAD_MISS_BAR).allBars, 'allBars=' + checkShape(BAD_MISS_BAR).allBars);

    // 坏样件 7：flex 分配模型本身要能算出 0（拿改造前的 basis 当「合格档」喂进去）
    const before = orderBarWidths(375, 100, readConstants());
    expect('坏样件 7：把改造前的 basis=100% 当合格档（模型必须报 0 宽）',
      before.gbb > 0, 'gbb=' + before.gbb.toFixed(1));

    // 坏样件 8：某一条底栏的间距来源被摘掉（= checkin/intro 改造前那一版：两枚 flex:1 按钮贴死）
    const REAL_INTRO = read(path.join(ROOT, 'src/pages/app/checkin/intro/css.css'));
    const BAD_INTRO = REAL_INTRO.replace(/\.cdi-footer \{[\s\S]*?\}/, '');
    PEER_BARS[3].rule.lastIndex = 0;
    const badIntroOk = PEER_BARS[3].rule.test(BAD_INTRO);
    expect('坏样件 8：打卡介绍底栏的容器 gap 被摘掉（两枚按钮贴死）', badIntroOk, '间距来源=' + (badIntroOk ? '有' : '无'));

    // 坏样件 9：送好友又挂回购买栏 order-extra（同一入口说两遍的那一版）
    expect('坏样件 9：送好友又挂回购买栏 order-extra',
      checkSfaOrderGone(read(SFA), '<tz-send-friend-area slot="order-extra" goods-type="course" />').ok,
      checkSfaOrderGone(read(SFA), '<tz-send-friend-area slot="order-extra" goods-type="course" />').got);

    // 坏样件 9b：入口撤了、`.sfa-entry--order{flex:none}` 那一档样式还留着（下一轮被挂回来的种子）
    expect('坏样件 9b：购买栏那一档的样式与缺省 order 还留着',
      checkSfaOrderGone(read(SFA) + '\n<style>.sfa-entry--order { flex: none; }</style>', read(DETAIL)).ok,
      checkSfaOrderGone(read(SFA) + '\n<style>.sfa-entry--order { flex: none; }</style>', read(DETAIL)).got);

    // 坏样件 10：⑥ 的全局规则被摘掉（送回「插件入口按内容收缩」那一版）
    const BAD_APP = read(APP).replace(/\t\.sf-control-slot,\r?\n\t\.tbb-slot \{[\s\S]*?\}/, '');
    expect('坏样件 10：全局表 `.sf-control-slot, .tbb-slot` 被摘掉（四枚里送好友又窄一截）',
      checkHostSlots({ app: BAD_APP }).appGlobalRule,
      'appGlobalRule=' + checkHostSlots({ app: BAD_APP }).appGlobalRule);

    // 坏样件 10b：`.control-btn` 又写回百分比宽（不可随枚数伸缩）
    const BAD_BTN_PCT = real.replace(/(\.control-btn \{[\s\S]*?)flex: 1 1 0;/, '$1width: 24%;');
    expect('坏样件 10b：`.control-btn` 又写回 `width: 24%`（枚数一变就不等宽）',
      checkHostSlots({ btn: BAD_BTN_PCT }).controlBtnNoPct,
      '无百分比=' + checkHostSlots({ btn: BAD_BTN_PCT }).controlBtnNoPct);

    // 坏样件 10c：死规则搬回底栏组件（上一轮那一版：写了却两端都不生效）
    const BAD_BTN_DEAD = real + '\n<style>.control-box .sf-control-slot { width: 24%; }</style>';
    expect('坏样件 10c：宿主宽度规则又被搬回 `bottom-btn.vue`（两端都是死规则）',
      checkHostSlots({ btn: BAD_BTN_DEAD }).noDeadSlotRule,
      'noDeadSlotRule=' + checkHostSlots({ btn: BAD_BTN_DEAD }).noDeadSlotRule);

    // 坏样件 11：调用点丢了 class（组件标签上没点出宿主 ⇒ 宽度规则落不到 flex 项上）
    const BAD_DETAIL = read(DETAIL).replace(' class="tbb-slot"', '');
    expect('坏样件 11：课程商详的拼团入口标签丢了 `class="tbb-slot"`',
      checkHostSlots({ detail: BAD_DETAIL }).detailSlot,
      'detailSlot=' + checkHostSlots({ detail: BAD_DETAIL }).detailSlot);

    // 坏样件 12：送好友控制栏那一枚的组件根在 MP 端又自己算 24%（三行那一版）
    const BAD_SF_ROOT = read(SFA).replace(/\.sfa-entry--control \{\s*width: 100%;\s*\}/, '.sfa-entry--control { width: 24%; }');
    expect('坏样件 12：送好友根节点（MP 档）又写回 `width: 24%`（宿主再打一次折 ⇒ 三个字变三行）',
      checkHostSlots({ sfa: BAD_SF_ROOT }).sfRootFollowsMp,
      'MP 条件块里的 100%=' + checkHostSlots({ sfa: BAD_SF_ROOT }).sfRootFollowsMp);

    // 坏样件 12b：`width:100%` 的 #ifdef MP 包被摘掉（H5 根节点自己就是 flex 项 ⇒ 占半条栏那一版）
    const BAD_SF_UNCOND = read(SFA)
      .replace(/\/\*\s*#ifdef MP\s*\*\//, '')
      .replace(/\/\*\s*#endif\s*\*\//, '');
    expect('坏样件 12b：`width:100%` 变成了无条件（H5 上按整栏 basis 参与 shrink ⇒ 送好友占一半）',
      checkHostSlots({ sfa: BAD_SF_UNCOND }).sfRootH5NoWidth,
      'H5 无宽度=' + checkHostSlots({ sfa: BAD_SF_UNCOND }).sfRootH5NoWidth);

    // 坏样件 12c：组件根丢了 flex（H5 上回到按内容收缩 ⇒ 与同栏三兄弟不等宽）
    const BAD_SF_NOFLEX = read(SFA).replace(/(\.sfa-entry--control \{[\s\S]*?)flex: 1 1 0;/, '$1');
    expect('坏样件 12c：送好友根节点丢了 `flex: 1 1 0`（H5 上按内容收缩 ⇒ 四个按钮不等宽）',
      checkHostSlots({ sfa: BAD_SF_NOFLEX }).sfRootFlex,
      'H5 flex=' + checkHostSlots({ sfa: BAD_SF_NOFLEX }).sfRootFlex);

    // 坏样件 12d：模型自己能报「不等宽」（内容宽那档）
    const badEq = controlBarWidths(375, readConstants(), { sfMode: 'content' });
    expect('坏样件 12d：把「按内容收缩」当合格档喂给模型（模型必须报不等宽）',
      badEq.every((x) => Math.abs(x - badEq[0]) < 0.01),
      JSON.stringify(badEq.map((x) => Number(x.toFixed(1)))));

    // ── ⑦ 动态枚数这一族（2026-10-29 用户「下面的按钮不一定是固定 4 个」）──────────────
    // 坏样件 13：拼团入口丢了 `v-if`（没活动的店在 MP 端白占一格、主按钮只剩半条栏）
    const detailSrc = read(DETAIL);
    const badSite = { file: DETAIL, src: detailSrc.replace(/v-if="!isScorePage && gbEntry" class="tbb-slot"/, 'class="tbb-slot"') };
    expect('坏样件 13：拼团入口丢了 `v-if="… gbEntry …"`（空宿主在 MP 端白占一格）',
      checkHostSlots({ pageSources: [badSite] }).allGated,
      'allGated=' + checkHostSlots({ pageSources: [badSite] }).allGated);

    // 坏样件 13b：入口还在、但丢的是宿主 class（回到「按内容收缩」）
    const badSite2 = { file: DETAIL, src: detailSrc.replace(/\sclass="tbb-slot"/, '') };
    expect('坏样件 13b：拼团入口丢了 `class="tbb-slot"`（宽度规则没有抓手）',
      checkHostSlots({ pageSources: [badSite2] }).allCallSites,
      'allCallSites=' + checkHostSlots({ pageSources: [badSite2] }).allCallSites);

    // 坏样件 14：全局表那条「这一拍不占宽度」被摘掉（送好友收起时仍占 1/4）
    const BAD_APP_OFF = read(APP).replace(/\.sf-control-slot--off,\r?\n\t\.tbb-slot--off \{[\s\S]*?\}/, '');
    expect('坏样件 14：`.sf-control-slot--off{display:none}` 被摘掉（送好友收起时那一格仍空着）',
      checkHostSlots({ app: BAD_APP_OFF }).offRule,
      'offRule=' + checkHostSlots({ app: BAD_APP_OFF }).offRule);

    // 坏样件 15：宿主丢了 off 档 / @visible（同上一格，页面侧那一半）
    const BAD_DETAIL_OFF = detailSrc
      .replace(/:class="\{ 'sf-control-slot--off': !sfEntryShown \}"/, '')
      .replace(/@visible="sfEntryShown = \$event"/, '');
    expect('坏样件 15：送好友宿主丢了 `sf-control-slot--off` 与 `@visible`（组件收起时宿主仍在排班）',
      checkHostSlots({ detail: BAD_DETAIL_OFF }).detailSfOffClass,
      'offClass+visible=' + checkHostSlots({ detail: BAD_DETAIL_OFF }).detailSfOffClass);

    // 坏样件 16：旗子初值写成 false（组件永远挂不上 ⇒ 入口永远出不来，自锁）
    const BAD_FLAG = read(DETAILJS).replace(/sfEntryShown:\s*true\b/, 'sfEntryShown: false');
    expect('坏样件 16：`sfEntryShown` 初值写成 false（组件挂不上、永远收不到 visible）',
      checkHostSlots({ detailJs: BAD_FLAG }).detailSfFlag,
      'sfEntryShown=true=' + checkHostSlots({ detailJs: BAD_FLAG }).detailSfFlag);

    // 坏样件 17：组件的 `visible` 事件被摘掉（宿主再也收不到「该不该占位」）
    const BAD_EMIT = read(SFA)
      .replace(/emits:\s*\['open',\s*'visible'\]/, "emits: ['open']")
      .replace(/this\.\$emit\('visible',\s*!!\(this\.installed && this\.entry\)\);/, '');
    expect('坏样件 17：组件不再抛 `visible`（宿主拿不到「该不该占位」）',
      checkHostSlots({ sfa: BAD_EMIT }).sfVisibleEmit,
      'emit=' + checkHostSlots({ sfa: BAD_EMIT }).sfVisibleEmit);

    // 反向样件：合格写法不许被误判
    if (shapeOk(checkShape(real))) { pass++; console.log('[SELFTEST-OK] 真件没被误判（这条断言不是恒真也不是恒假）'); }
    else { fail++; console.log('[SELFTEST-FAIL] 真件被判红 ⇒ 判据太宽'); }
    if (checkSfaOrderGone(read(SFA), read(DETAIL)).ok) { pass++; console.log('[SELFTEST-OK] ③b 真件没被误判（送好友确实已从购买栏撤净）'); }
    else { fail++; console.log('[SELFTEST-FAIL] ③b 真件被判红 ⇒ 判据太宽'); }
    if (checkHostSlots().ok) { pass++; console.log('[SELFTEST-OK] ⑥ 真件没被误判（宿主 class 全程到位）'); }
    else { fail++; console.log('[SELFTEST-FAIL] ⑥ 真件被判红 ⇒ 判据太宽'); }

    console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥8），真件不误报；总通过 ' + pass + ' / 失败 ' + fail);
    process.exitCode = fail === 0 && fired >= 8 ? 0 : 1;
  }
})().catch((e) => {
  console.log('[HARNESS-ERROR] ' + (e && e.stack ? e.stack : e));
  process.exitCode = 1;
});
