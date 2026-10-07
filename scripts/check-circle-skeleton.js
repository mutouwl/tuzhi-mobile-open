#!/usr/bin/env node
/**
 * 圈子模块（src/pages/app/circle/** + 承载圈子卡片的 components/tz/circle*.vue）加载态骨架屏验收
 *
 * 依据：.trae/rules/ui-baseline-mobile.md M16（加载态一律骨架屏）+ M11（裸类名全站互相覆盖）
 * 用法：node tuzi-mobile/scripts/check-circle-skeleton.js      （exit 0 = 全部通过）
 *
 * 为什么要单独一只脚本：`node tools/ui-audit.js --pattern loading-not-skeleton` 只抓
 * u-loading-page / tz-loading-page 两种整页遮罩，`--pattern loading-spinner-text-block`
 * 只抓模板里的「转圈 + 加载中文字」，两条都抓不到下面这四类，改回去照样全绿：
 *   ① `uni.showLoading({ title: '加载中…' })` 那枚黑底转圈 toast（M16 点名的第三档同族病）
 *   ② 旧式「手写 linear-gradient 流光灰块」骨架——它也是骨架屏，但和全站现行那一档
 *      （#e5e6eb 静态块 + u-skeleton 文字行）不是一套外观，同一模块里两种加载态并排出现
 *   ③ 骨架类名不带页面前缀的裸名（本模块 my/index 与 post/detail 当年就是 .sk-line / .sk-avatar
 *      且非 scoped，与全站其它页面互相覆盖）
 *   ④ 切档没另给标志位、或判据里漏了 `!list.length`（翻页会闪骨架）
 */
const fs = require('fs');
const path = require('path');

const MOBILE = path.resolve(__dirname, '..');
const SRC = path.join(MOBILE, 'src');
const CIRCLE_PAGES = path.join(SRC, 'pages', 'app', 'circle');
const CIRCLE_COMPS = path.join(SRC, 'components', 'tz');

/**
 * 每页的期望档：
 *   tpl      = 模板文件相对 CIRCLE_PAGES 的路径
 *   skPrefix = 骨架类名前缀（M11）。传 null = 该页不该自己写骨架，版式由组件出（骨架档开在组件上）
 *   flag     = 驱动骨架的那个字段名。取 data 里的标志位时判初值，取计算属性时只判判据本身
 *   initialFlag = data 里要判初值的那个字段（默认与 flag 相同）
 *   paging   = 该页的列表是否分页。分页才要求判据含 !list.length（翻页不闪骨架）；
 *              售前页的动态预览是随详情一次下发的、根本没有翻页，不适用
 */
const PAGES = [
  { dir: 'index', tpl: 'index/index.vue', skPrefix: 'ci-sk', flag: 'loading', paging: true },
  { dir: 'my/home', tpl: 'my/home.vue', skPrefix: 'mh-sk', flag: 'loading', paging: false },
  { dir: 'my/index', tpl: 'my/index.vue', skPrefix: null, flag: 'loading', paging: false },
  { dir: 'post/detail', tpl: 'post/detail.vue', skPrefix: null, flag: 'loading', paging: false },
  // 发布页的 loading 只有编辑态才置 true（新建态初值 false、输入框立即可填），初值那条按例外记账
  { dir: 'post/publish', tpl: 'post/publish.vue', skPrefix: 'pub-sk', flag: 'loading', paging: false, initialFlag: null },
  { dir: 'presale', tpl: 'presale/presale.vue', skPrefix: 'ps-sk', flag: 'loading', paging: false },
  // 搜索页的骨架判据是一个计算属性（首屏 loading 与切档 tabLoading 两支都驱动它）
  { dir: 'search', tpl: 'search/search.vue', skPrefix: null, flag: 'listLoading', initialFlag: 'loading', paging: true },
  { dir: 'user/home', tpl: 'user/home.vue', skPrefix: 'uh-sk', flag: 'loading', paging: true },
];

/** 只看标记里的 class，不看注释里提到类名的那几行（注释是给人读的，不是给门禁判的） */
const stripComments = (src) => src.replace(/<!--[\s\S]*?-->/g, '').replace(/\/\*[\s\S]*?\*\//g, '');

/** 本模块要一起查的组件：骨架档开在这里，页面不再各抄一份卡尺寸 */
const COMPS = ['circle-post.vue', 'circle.vue', 'circle-comment-list.vue'];

/** 只有这四枚组件允许出加载态；circle-post-head / circle-media-grid 等纯展示件不参与 */
const SKELETON_HOSTS = ['circle-post.vue', 'circle.vue'];

let failed = 0;
const ok = (label, msg) => console.log(`  [ok]   ${label} :: ${msg}`);
const bad = (label, msg) => {
  failed++;
  console.log(`  [FAIL] ${label} :: ${msg}`);
};

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null);

/** 收集该页要一起看的源文件：页面本体 + 同目录的 js.vue */
function pageSources(dir, tpl) {
  const tplPath = path.join(CIRCLE_PAGES, tpl);
  const jsPath = path.join(CIRCLE_PAGES, path.dirname(tpl), 'js.vue');
  const tplSrc = read(tplPath);
  const jsSrc = fs.existsSync(jsPath) ? read(jsPath) : null;
  return { tpl: tplSrc, js: jsSrc, tplPath, jsPath };
}

console.log('=== ① 组件：骨架档开在组件上 ===');
COMPS.forEach((name) => {
  const label = `components/tz/${name}`;
  const src = read(path.join(CIRCLE_COMPS, name));
  if (src === null) return bad(label, '文件缺失');
  if (!SKELETON_HOSTS.includes(name)) {
    return ok(label, '纯展示件，不参与骨架档判据');
  }
  if (!/skeleton:\s*\{\s*type:\s*Boolean,\s*default:\s*false/.test(src)) {
    bad(label, '没有 skeleton（Boolean，默认 false）prop —— 页面只能自己抄一份卡尺寸');
  } else ok(label, '有 skeleton prop（默认 false，不影响既有调用点）');
  if (!/skeletonCount:\s*\{\s*type:\s*Number/.test(src)) {
    bad(label, '没有 skeletonCount prop（骨架铺几张卡没法由调用点决定）');
  } else ok(label, '有 skeletonCount prop');
  // 骨架档下真实卡必须走空数组，否则灰卡与真卡同屏叠出
  if (!/rows\(\)\s*\{\s*return this\.skeleton \? \[\] : this\.list;/.test(src)) {
    bad(label, '骨架档下真实卡没有走空数组（rows 计算属性），灰卡与真卡会同屏叠出');
  } else ok(label, '骨架档下真实卡走空数组');
  // 全站现行那一档：静态块 #e5e6eb
  if (!/#e5e6eb/i.test(src)) {
    bad(label, '骨架静态块没有取 uview 骨架灰 #e5e6eb');
  } else ok(label, '骨架静态块取 #e5e6eb');
  // 旧式手写流光：同一模块两种外观并排
  if (/linear-gradient\(90deg,\s*#f1f2f4/i.test(src) || /@keyframes\s+\w*sk\w*-animate/i.test(src)) {
    bad(label, '还在手写 linear-gradient 流光骨架（与全站现行那一档不是一套外观）');
  } else ok(label, '无手写流光骨架');
});

PAGES.forEach((page) => {
  const label = `circle/${page.dir}`;
  console.log(`\n=== ② 页面 ${label} ===`);
  const { tpl, js, tplPath } = pageSources(page.dir, page.tpl);
  if (tpl === null) return bad(label, `模板缺失：${page.tpl}`);
  const sources = [tpl, js].filter(Boolean);
  const all = sources.join('\n');

  // 1. 禁整页加载遮罩 / 黑底转圈 toast / 「转圈 + 加载中」文字块（M16 三档同族病）
  const banned = [
    [/<u-loading-page/, 'u-loading-page 整页遮罩'],
    [/<tz-loading-page/, 'tz-loading-page 整页遮罩'],
    [/uni\.showLoading\(\s*\{[^}]*加载中/, 'uni.showLoading 黑底转圈 toast（首屏加载态那一档）'],
    [/<u-loading-icon[^>]*text\s*=\s*["']加载中/, 'u-loading-icon 带 text=加载中（转圈 + 文字块）'],
    [/>\s*加载中\s*</, '独立的「加载中」文字块'],
  ];
  banned.forEach(([re, what]) => {
    re.test(all) ? bad(label, `仍在使用 ${what}`) : ok(label, `无 ${what}`);
  });

  // 2. 旧式手写流光骨架（本模块曾经三页都是，与上面那一档并排出现）
  if (/linear-gradient\(90deg,\s*#f1f2f4/i.test(all) || /@keyframes\s+sk-animate/i.test(all)) {
    bad(label, '还有旧式手写流光骨架（linear-gradient + sk-animate）');
  } else ok(label, '无旧式手写流光骨架');

  // 3. 模板要有 loading 驱动的骨架分支，且真实内容与之互斥
  const flag = page.flag;
  const skRe = new RegExp(`v-(if|show)="${flag}"`);
  if (!skRe.test(tpl)) bad(label, `模板没有 v-if="${flag}" 的骨架分支`);
  else ok(label, `模板有 ${flag} 骨架分支`);
  if (!/v-else|v-if="!loading/.test(tpl)) {
    bad(label, '真实内容没有 v-else / v-if="!loading" 分支（会与骨架屏同屏）');
  } else ok(label, '真实内容在互斥分支里');

  // 4. 骨架类名带页面前缀（M11）。skPrefix 为 null 的页版式由组件出，页面自己不该再写骨架块
  const tplNoComment = stripComments(tpl);
  if (page.skPrefix) {
    if (!tpl.includes(page.skPrefix)) bad(label, `骨架类名未带页面前缀 ${page.skPrefix}`);
    else ok(label, `骨架类名前缀 ${page.skPrefix}`);
  } else {
    if (/\bsk-(line|avatar|cover|btn|card|block|head|grid|main|stat)\b/.test(tplNoComment)) {
      bad(label, '页面自己写了裸名骨架块（版式应由 tz-circle-post / tz-circle 的 skeleton 档出）');
    } else ok(label, '骨架由组件档出，页面无裸名骨架块');
  }

  // 5. 首屏那个标志位的初值必须是 true（初值 false 会先渲染一帧空态再切骨架）。
  //    flag 本身是计算属性时（如搜索页 listLoading）不适用，改判它背后那个 data 标志位。
  const initField = page.initialFlag === undefined ? flag : page.initialFlag;
  if (js) {
    if (initField === null) {
      ok(label, '首屏 loading 只有编辑态才 true（新建态页面立即可填），初值那条按例外记账');
    } else {
      const initial = new RegExp(`\\b${initField}\\s*:\\s*(true|false)`).exec(js);
      if (!initial) {
        bad(label, `data 里找不到 ${initField} 初值`);
      } else if (initial[1] !== 'true') {
        bad(label, `${initField} 初值不是 true（首帧会闪一帧空态再切骨架）`);
      } else {
        ok(label, `${initField} 初值 true`);
      }
    }
    // flag 是计算属性时，判据本身要含 !list.length（见下面第 7 条，这里只确认它确实是个计算属性）
    if (flag !== initField) {
      if (!new RegExp(`${flag}\\s*\\(\\)\\s*\\{`).test(js)) {
        bad(label, `${flag} 不是计算属性，模板里的 v-if="${flag}" 会恒为 undefined`);
      } else ok(label, `${flag} 是计算属性`);
    }
  } else {
    ok(label, '无独立 js.vue（逻辑在页面本体里）');
  }

  // 6. 撤骨架要有出口：成功 / 业务失败 / 网络异常三条都要把 loading 收回去
  if (js) {
    const clears = (js.match(/loading\s*=\s*false/g) || []).length;
    if (!clears) bad(label, '没有任何 loading = false ⇒ 骨架屏撤不掉');
    else ok(label, `撤骨架 ${clears} 处`);
    if (!/catch\s*\(/.test(js)) {
      bad(label, '没有 catch 分支（网络异常时骨架屏撤不掉）');
    } else ok(label, '有网络异常出口');
  }

  // 7. 分页列表的判据要含 !list.length：翻页追加时不闪骨架
  if (page.paging) {
    // 判据写在模板还是计算属性里，取决于 flag 是不是那个计算属性
    const judged = flag !== initField ? js : tpl;
    if (!judged || !/!\s*(this\.)?(posts|list|showcaseList)\.length/.test(judged)) {
      bad(label, '分页列表的加载态判据里没有 !list.length（翻页会闪一帧骨架）');
    } else ok(label, '分页判据含 !list.length');
  } else {
    ok(label, '该页列表不分页，跳过 !list.length 判据');
  }
});

console.log(`\n${failed === 0 ? '全部通过' : '存在失败项'}：圈子模块 ${PAGES.length} 页 + ${COMPS.length} 组件，[FAIL]=${failed}`);
process.exit(failed ? 1 : 0);
