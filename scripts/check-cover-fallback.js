/**
 * 「列表/卡片里的图片取不到要有默认填充图」这一族的门禁 —— 不构建、不开浏览器（M65）
 *
 * 为什么单拉一个脚本：这一族**看不见**。接口一路 200、页面结构完整、`sfc-check` 编译通过、
 * `ui-audit` 的正则也只看版式，可图片地址一失效，界面上那一格就是白的（或只剩一层空圆底），
 * 用户读出来是「这张卡没配图」而不是「这张图没取到」。两次被点名（2026-10-29 送好友赠送记录
 * 列表、同日推广商品列表）都是同一个成因：**背景图没有失败这一档**。
 *
 * 钉两件事：
 *  ① **全站枚举 + 差集**：`src/**` 里「动态拼出来的背景图」（`'background-image': 'url(' + x` 这一族）
 *     只允许白名单里那几条，每条都得写明为什么不是「列表卡封面」或为什么已经兜过图；
 *     新写一处就得来这条门禁登记 —— 靠人工 review 记这一族，历史上就是漏。
 *  ② **本族落点逐个断言**：图片必须是 `<image>`/`<img>` + `@error`、失败档落到全站那两张默认图
 *     （封面 `default-goods.jpg` / 头像 `default-avatar.png`）、失败表按 `mpKey(地址)` 读写两头同口径、
 *     回调第一句过 `gone()`（M26②：图片回调常晚于页面卸载才到）。
 *
 * 用法：node tuzi-mobile/scripts/check-cover-fallback.js
 *       node tuzi-mobile/scripts/check-cover-fallback.js --selftest   # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
  if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
  return !!ok;
}
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');

function bodyOf(code, signature) {
  const at = code.search(signature);
  if (at < 0) return null;
  const open = code.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') { depth--; if (!depth) return code.slice(open + 1, i); }
  }
  return null;
}

/* ── ① 动态背景图的全站枚举（差集判红）───────────────────────────── */
/** 只有这四条允许用「拼出来的背景图」，每条都要说得出为什么：
 *  · 播放器封面 / 音轨底色那一层：它们不是「列表卡封面」，取不到时界面靠 `<img>` 与 `safePatch`
 *    自己那一档兜底（`course-audio.vue` 的 `safePatch` 已经带默认图，`audio.vue` 是播放器方格本身）；
 *  · 直播商品两处：背景层与压在它上面的 `<img>` 读同一个 `coverSrc` / `coverOf(item)`，
 *    那一份已经含默认图 —— 留着背景层只为宽高比不一的封面四周那圈模糊底。 */
const BG_ALLOW = [
  { file: 'src/pages/course/components/audio.vue', why: '播放器封面方格（patch 为空时是播放器自己的空态，不是列表卡）' },
  { file: 'src/components/tz/course-audio.vue', why: '音轨底色/封面底：safePatch 已带 filetype/audio.png 默认图 + onPatchError' },
  { file: 'src/pages/course/live/goods/goods-popover.vue', why: '直播商品浮窗模糊底：与上面那张 <img> 同读 coverSrc（已含默认图）' },
  { file: 'src/pages/course/live/goods/goods-modal.vue', why: '直播商品弹窗模糊底：与上面那张 <img> 同读 coverOf(item)（已含默认图）' },
  { file: 'src/components/order/course.vue', why: '订单卡模糊底：与上面那张 <img> 同读 currentCover（imgError 已换 default-goods.jpg）' },
];

/** 全站扫描 `src/**` 的 .vue（第三方组件库与打包产物不参与本仓规则） */
const SKIP_DIR = /[\\/](node_modules|unpackage|dist|uview-ui|tdesign|assets)[\\/]/;
function walk(dir, out) {
  fs.readdirSync(dir).forEach((name) => {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) { if (!SKIP_DIR.test(p + path.sep)) walk(p, out); }
    else if (name.endsWith('.vue')) out.push(p);
  });
  return out;
}
// 「拼出来的」背景图：字符串里先写 url( 再拼变量（静态资源写成完整字面量的不算，如 coupon-bg.png）
const DYNAMIC_BG = /background-image'?\s*:\s*'url\('\s*\+|background-image:\s*url\('\s*\+/;
const BG_LINE = /background-image/;

function scanDynamicBg(files) {
  const hits = [];
  files.forEach((f) => {
    const rel = path.relative(ROOT, f).split(path.sep).join('/');
    const code = stripComments(fs.readFileSync(f, 'utf8'));
    code.split('\n').forEach((line, i) => {
      if (!BG_LINE.test(line)) return;
      if (!DYNAMIC_BG.test(line)) return;
      hits.push({ rel, line: i + 1, text: line.trim().slice(0, 120) });
    });
  });
  return hits;
}

function checkEnumeration(files, label) {
  const hits = scanDynamicBg(files);
  const allow = BG_ALLOW.map((a) => a.file);
  const unexpected = hits.filter((h) => allow.indexOf(h.rel) < 0);
  // 白名单里那条被删/改成 <image> 之后要回来删白名单，否则下一处新写的会拿它当挡箭牌
  const stale = allow.filter((f) => !hits.some((h) => h.rel === f));
  return {
    ok: unexpected.length === 0 && stale.length === 0,
    got: '命中 ' + hits.length + ' 处（白名单 ' + allow.length + ' 处）'
      + (unexpected.length ? '；越界：' + unexpected.map((h) => h.rel + ':' + h.line + ' ' + h.text).join(' | ') : '')
      + (stale.length ? '；白名单已过期（这几处不再拼背景图，请从 BG_ALLOW 删掉）：' + stale.join('、') : '')
      + ' [' + label + ']',
  };
}

/* ── ② 本族落点逐个断言 ──────────────────────────────────────────── */
/** 每一处：图片节点必须挂 @error、失败档落到默认图、失败表读写两头同口径、回调过 gone() */
const SPECS = [
  {
    n: 'tz-course-mini 商品封面（送好友 / 拼团 / 分类页…共用）',
    file: 'src/components/tz/course-mini.vue',
    handler: /onCoverError\s*\(item\)\s*\{/,
    need: [
      [/<image[^>]*class="mini-cover"[^>]*@error="onCoverError\(item\)"/, '封面 <image> 挂 @error'],
      [/default-goods\.jpg/, '失败档 = 默认商品图'],
      [/coverErrors\[mpKey\(cover\)\]/, '读点过 mpKey'],
      [/\$set\(\s*this\.coverErrors\s*,\s*mpKey\(cover\)/, '写点过 mpKey'],
      [/class="placeholder"[^>]*v-else|v-else[^>]*class="placeholder"/, '空封面仍走浅灰占位'],
    ],
  },
  {
    n: '赠送记录 领取人头像',
    file: 'src/pages/app/send_friend/gift/gift.vue',
    handler: null,
    need: [
      [/<image[^>]*class="sfg-avatar"[^>]*@error="onAvatarError\(row\)"/, '头像 <image> 挂 @error'],
      [/:src="avatarSrc\(row\)"/, 'src 走 avatarSrc()'],
    ],
  },
  {
    n: '赠送记录 头像兜底链（脚本）',
    file: 'src/pages/app/send_friend/gift/js.vue',
    handler: /onAvatarError\s*\(row\)\s*\{/,
    need: [
      [/default-avatar\.png/, '失败档 = 默认头像'],
      [/avatarErrors\[mpKey\(url\)\]/, '读点过 mpKey'],
      [/\$set\(\s*this\.avatarErrors\s*,\s*mpKey\(url\)/, '写点过 mpKey'],
    ],
  },
  {
    n: '推广商品列表 封面（agent/recommend/goods）',
    file: 'src/pages/app/agent/recommend/goods/js.vue',
    handler: /onCoverError\s*\(item\)\s*\{/,
    need: [
      [/default-goods\.jpg/, '失败/空地址 = 默认商品图'],
      [/coverErrors\[mpKey\(url\)\]/, '读点过 mpKey'],
      [/\$set\(\s*this\.coverErrors\s*,\s*mpKey\(url\)/, '写点过 mpKey'],
    ],
  },
  {
    n: '推广商品列表 封面（模板）',
    file: 'src/pages/app/agent/recommend/goods/goods.vue',
    handler: null,
    need: [
      [/<image[^>]*class="goods-item-cover-img"[^>]*@error="onCoverError\(item\)"/, '封面 <image> 挂 @error'],
      [/:src="coverOf\(item\)"/, 'src 走 coverOf()'],
      [/background-image/, '背景图零残留', true],
    ],
  },
  ...[
    ['我的收藏 课程卡', 'src/pages/user/collect/components/course.vue', /onCoverError\s*\(\s*\)\s*\{/],
    ['我的订阅 课程卡', 'src/pages/user/subscription/components/course.vue', /onCoverError\s*\(\s*\)\s*\{/],
    ['积分商城 课程卡', 'src/pages/app/score/compoents/course.vue', /onCoverError\s*\(\s*\)\s*\{/],
  ].map(([n, file, handler]) => ({
    n,
    file,
    handler,
    need: [
      [/<image[^>]*class="(col|sub|score)-cover-img"[^>]*@error="onCoverError"/, '封面 <image> 挂 @error'],
      [/:src="coverSrc"/, 'src 走 coverSrc（空/失败都回落默认图）'],
      [/default-goods\.jpg/, '失败档 = 默认商品图'],
      [/coverErrors\[mpKey\(url\)\]/, '读点过 mpKey'],
      [/\$set\(\s*this\.coverErrors\s*,\s*mpKey\(url\)/, '写点过 mpKey'],
      [/background-image/, '背景图零残留', true],
    ],
  })),
  {
    n: '我的学习 课程卡',
    file: 'src/pages/user/study/components/course.vue',
    handler: /onCoverError\s*\(item\)\s*\{/,
    need: [
      [/<image[^>]*class="study-cover-img"[^>]*@error="onCoverError\(item\)"/, '封面 <image> 挂 @error'],
      [/:src="coverOf\(item\)"/, 'src 走 coverOf()'],
      [/default-goods\.jpg/, '失败档 = 默认商品图'],
      [/coverErrors\[mpKey\(url\)\]/, '读点过 mpKey'],
      [/\$set\(\s*this\.coverErrors\s*,\s*mpKey\(url\)/, '写点过 mpKey'],
      [/background-image/, '背景图零残留', true],
    ],
  },
  {
    n: '直播商品浮窗 封面',
    file: 'src/pages/course/live/goods/goods-popover.vue',
    handler: /onCoverError\s*\(\s*\)\s*\{/,
    need: [
      [/<img[^>]*:src="coverSrc"[^>]*@error="onCoverError"/, '封面 <img> 挂 @error'],
      [/default-goods\.jpg/, '失败档 = 默认商品图'],
      [/coverErrors\[mpKey\(url\)\]/, '读点过 mpKey'],
    ],
  },
  {
    n: '直播商品弹窗 封面',
    file: 'src/pages/course/live/goods/goods-modal.vue',
    handler: /onCoverError\s*\(item\)\s*\{/,
    need: [
      [/<img[^>]*:src="coverOf\(item\)"[^>]*@error="onCoverError\(item\)"/, '封面 <img> 挂 @error'],
      [/default-goods\.jpg/, '失败档 = 默认商品图'],
      [/coverErrors\[mpKey\(url\)\]/, '读点过 mpKey'],
    ],
  },
];

function checkSpec(spec, srcOverride) {
  const src = srcOverride === undefined ? read(spec.file) : srcOverride;
  const flat = stripComments(src);
  const missing = [];
  spec.need.forEach(([re, label, negate]) => {
    const ok = negate ? !re.test(flat) : re.test(flat);
    if (!ok) missing.push(label);
  });
  if (spec.handler) {
    const body = bodyOf(flat, spec.handler);
    if (!body) missing.push('找不到回调方法体');
    else if (!/gone\(\)/.test(body)) missing.push('回调没过 gone() 闸门（M26②）');
  }
  return { ok: missing.length === 0, got: (missing.length ? '缺：' + missing.join('、') : '五项齐') + ' [' + spec.file + ']' };
}

/* ── 主流程 ─────────────────────────────────────────────────────── */
function run(files, specs) {
  const results = [];
  results.push(['① 动态背景图全站枚举 = 白名单（新写一处封面背景图就得来登记或改成 <image>）',
    checkEnumeration(files, '真件')]);
  specs.forEach((spec) => {
    results.push(['② ' + spec.n + '：<image>+@error / 默认图 / mpKey 两头 / gone()', checkSpec(spec)]);
  });
  return results;
}

const ALL_VUE = walk(SRC, []);
const REAL = run(ALL_VUE, SPECS);

if (process.argv.indexOf('--selftest') >= 0) return selftest();
console.log('=== check-cover-fallback（M65：列表图片取不到要有默认填充图）===');
REAL.forEach(([name, r]) => assert(name, r.ok, r.got));
console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
  : '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
process.exitCode = fail === 0 ? 0 : 1;
return;

function selftest() {
  console.log('=== --selftest：坏样件必须每一条都被同一组判据抓红 ===');
  let fired = 0;
  let bad = 0;
  const expect = (name, r) => {
    if (r.ok) { console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到（这条判据是瞎的）-> ' + r.got); bad++; }
    else { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红 -> ' + r.got); }
  };
  const okCase = (name, r) => {
    if (r.ok) { console.log('[SELFTEST-OK] ' + name + ' 未被误判 -> ' + r.got); }
    else { console.log('[SELFTEST-FAIL] ' + name + ' 被误判成红 ⇒ 判据太宽 -> ' + r.got); bad++; }
  };

  // ① 枚举那一半：造一个目录外的动态背景图，且把白名单故意弄过期
  const fakeVue = path.join(SRC, '__selftest_cover__.vue');
  fs.writeFileSync(fakeVue, '<template><div class="cover" :style="{ \'background-image\': \'url(\' + item.cover + \')\' }"></div></template>');
  try {
    expect('坏样件 1：又出现一处「拼出来的背景图」当封面', checkEnumeration(ALL_VUE.concat([fakeVue]), '样件1'));
  } finally {
    fs.unlinkSync(fakeVue);
  }
  okCase('好样件：现有全站（白名单 + 无越界）', REAL[0][1]);

  // ② 逐个落点那一半：拿真件逐条摘掉一件，必须各自报红
  let broke = 0;
  SPECS.filter((sp) => sp.handler).forEach((spec) => {
    const good = checkSpec(spec);
    if (!good.ok) { console.log('[SELFTEST-FAIL] 真件「' + spec.n + '」本来就是红的，摘件验不出东西：' + good.got); bad++; return; }
    // 把回调里的 gone() 闸门拆掉（只动调用点，不动方法定义）——这一条必须翻红
    const broken = read(spec.file).replace(/this\.gone\(\)/g, 'this.goneUnplugged()');
    if (broken === read(spec.file)) { console.log('[SELFTEST-FAIL] 「' + spec.n + '」找不到 this.gone() 可拆，摘件写法要跟上真件'); bad++; return; }
    broke++;
    expect('坏样件：' + spec.n + ' 的回调没过 gone() 闸门（M26②）', checkSpec(spec, broken));
  });
  if (broke < 8) { console.log('[SELFTEST-FAIL] 只摘到 ' + broke + ' 个回调（要求 ≥8），覆盖不全'); bad++; }

  // ③ 图片节点那条 @error 被摘掉 ⇒ 必须报红（这是本族的成因本身）
  const miniSpec = SPECS[0];
  expect('坏样件：封面 <image> 没挂 @error（地址失效时那一格永远是白的）',
    checkSpec(miniSpec, read(miniSpec.file).replace(/@error="onCoverError\(item\)"/g, '')));
  const agentTpl = SPECS.find((sp) => sp.file.indexOf('agent/recommend/goods/goods.vue') >= 0);
  expect('坏样件：推广商品列表封面 <image> 没挂 @error',
    checkSpec(agentTpl, read(agentTpl.file).replace(/@error="onCoverError\(item\)"/g, '')));

  // ④ 默认图与键：把默认图路径与 mpKey 两头各摘一次
  expect('坏样件：默认商品图被摘掉（失败档又变空白）',
    checkSpec(miniSpec, read(miniSpec.file).replace(/default-goods\.jpg/g, 'default-x.jpg')));
  const agentJs = SPECS.find((sp) => sp.file.indexOf('agent/recommend/goods/js.vue') >= 0);
  expect('坏样件：失败表用裸地址当键（读写都没过 mpKey）',
    checkSpec(agentJs, read(agentJs.file)
      .replace(/this\.coverErrors\[mpKey\(url\)\]/g, 'this.coverErrors[url]')
      .replace(/\$set\(\s*this\.coverErrors\s*,\s*mpKey\(url\)/g, '$set(this.coverErrors, url')));

  console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥10），合格样件不误报；总失败 ' + bad);
  process.exitCode = bad === 0 && fired >= 12 && fail === 0 ? 0 : 1;
}
