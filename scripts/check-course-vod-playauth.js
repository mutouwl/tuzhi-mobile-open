#!/usr/bin/env node
/**
 * check-course-vod-playauth.js —— 课程点播「VID + PlayAuth」这一条链接线自检（只读）
 *
 * 钉的是 2026-10-26 收口的那一条长期复发的故障：
 *   · 电脑浏览器打课程视频 → Aliplayer 报 error_code 4400 / error_msg "4 || "
 *     （= MEDIA_ERR_SRC_NOT_SUPPORTED，且 mediaId/requestId 全空 ⇒ 一次网络响应都没发生）；
 *   · 手机端 H5 第一次打开异常，要整页刷新才能播。
 * 根因是「形态选错」而不是「代码写错」：课程走的是地址档（详情接口每次重签一条 6 小时有效期的
 * 私有加密 m3u8），桌面浏览器把它交给 MSE 却拿不到阿里云侧的分片密钥；而签名是一次性资产
 * （播放器重试会给地址拼 `_t=<毫秒>` 当场弄废），端上没有任何二次取址的出口，只能刷新整页。
 * 修复 = 课程改吃阿里云官方对私有加密 VID 的 VID+PlayAuth 档（圈子早就这一档），
 * 凭证起播前现取、过期再取一枚，页面不用重载。
 *
 * 为什么必须落成脚本而不是加一条 ui-audit 正则（细则 requirement-delivery L1-2.17 / 硬约束 28）：
 * 这一族的判据全在「跨文件的接线」与「两个 prop 的组合形态」上——
 * `vid && !source` 是 vendored Aliplayer 构造里那句 `if(t.vid&&!t.source)`，
 * 单看任何一份文件都合规，少接一环就整条链静默失效；sfc-check 只编译模板、
 * ui-audit 只按正则查版式，都看不见它们。
 *
 * 用法：node tuzi-mobile/scripts/check-course-vod-playauth.js
 * 退出码：0 全绿；1 有判红。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const READ = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const wrapper = READ('src/components/video/video.vue');
const h5 = READ('src/components/video/video-h5.vue');
const pageTpl = READ('src/pages/course/detail/detail.vue');
const pageJs = READ('src/pages/course/detail/js.vue');
const apiList = READ('src/common/request/api_list.js');
const mp = READ('src/components/video/video-mp.vue');

const results = [];
const ok = (name, detail) => results.push({ name, pass: true, detail });
const bad = (name, detail) => results.push({ name, pass: false, detail });
const check = (name, pass, detail) => (pass ? ok(name, detail) : bad(name, detail));

/** 取 <script> 段（注意 video.vue 写的是 `<script >`，标签里带空格） */
function scriptOf(src) {
  const m = src.match(/<script[^>]*>([\s\S]*)<\/script>/);
  return m ? m[1] : '';
}
/** 取 template 段 */
function templateOf(src) {
  const m = src.match(/<template>([\s\S]*)<\/template>/);
  return m ? m[1] : '';
}
/** 取某个方法的源码块（按大括号配对扫） */
function methodBody(src, name) {
  const start = src.indexOf('\n    ' + name + '(');
  if (start < 0) return '';
  let i = src.indexOf('{', start);
  if (i < 0) return '';
  let depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}') {
      depth--;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  return '';
}

const h5Script = scriptOf(h5);
const wrapperScript = scriptOf(wrapper);
const wrapperTpl = templateOf(wrapper);
const pageScript = scriptOf(pageJs);

// ─────────────────────────────────────────────────────────────
// ① 包装层必须声明并透传 vid / refreshNeedsNewAuth，且一都不许漏给小程序
//    （video.vue 115 行那条老教训：只写实现层等于调用点传不进来）
// ─────────────────────────────────────────────────────────────
check('①-1 video.vue 声明 vid prop', /vid:\s*\{[^}]*type:\s*String/.test(wrapperScript), '包装层 props.vid');
check('①-2 video.vue 声明 refreshNeedsNewAuth prop', /refreshNeedsNewAuth:\s*\{/.test(wrapperScript), '包装层 props.refreshNeedsNewAuth');
check('①-3 H5 分支转发 :vid', /<video-h5[^>]*:vid="vid"/s.test(wrapperTpl), '模板 H5 行');
check('①-4 H5 分支转发 :refreshNeedsNewAuth', /<video-h5[^>]*:refreshNeedsNewAuth="refreshNeedsNewAuth"/s.test(wrapperTpl), '模板 H5 行');
check('①-5 凭证参数一律不转给小程序',
  !/<video-mp[^>]*(?::|\b)(?:vid|playauth)=/s.test(wrapperTpl),
  '小程序原生 <video> 只吃播流地址，给它 VID 等于换了个坏源');
check('①-6 包装层把 error / onM3u8Retry / refresh 三枚事件上抛',
  /@error="error"/.test(wrapperTpl) && /@onM3u8Retry="onM3u8RetryHandle"/.test(wrapperTpl) && /@refresh="refresh"/.test(wrapperTpl)
    && /\$emit\('error'/.test(wrapperScript) && /\$emit\('onM3u8Retry'/.test(wrapperScript) && /\$emit\('refresh'/.test(wrapperScript),
  '页面要靠这三枚出声去重取凭证');

// ─────────────────────────────────────────────────────────────
// ② 实现层：两档形态一次定下来 + 三枚 watcher 共用同一条重建
// ─────────────────────────────────────────────────────────────
check('②-1 vid / playauth 换值也重建',
  /watch:\s*\{[\s\S]*?vid\(\)\s*\{\s*this\.rebuildOnMediaChange\(\);[\s\S]*?playauth\(\)\s*\{\s*this\.rebuildOnMediaChange\(\);/.test(h5Script),
  '凭证到手必须由 watcher 接手，页面不用重载');
check('②-2 同一拍只重建一次', /if \(this\.rebuildScheduled\) \{/.test(methodBody(h5Script, 'rebuildOnMediaChange')),
  'source 与 playauth 常常同拍变，逐枚重建会连拆三回');
check('②-3 凭证档不把播流地址一起塞给 SDK',
  /\}\s*else\s*\{\s*props\.source = this\.source;/.test(h5Script) &&
    /props\.vid = target;[\s\S]{0,220}\}\s*else\s*\{\s*props\.source = this\.source;/.test(h5Script),
  'Aliplayer 构造里那句 if(t.vid&&!t.source)：两个都给会退回地址档，凭证白取');
check('②-4 playingWithCredential 与 buildPlayer 同一处判定',
  /this\.playingWithCredential = !!\(this\.playauth && target\);/.test(h5Script),
  'refreshPlayer / 页面都要按这一档决定走重建还是 loadByUrl');

// ─────────────────────────────────────────────────────────────
// ③ 三处「只看 this.source」的旧判据必须一起改掉，否则凭证档静默失灵
//    （这是本项目最常见的一族：新形态接上了，旁边的判据还吃老字段）
// ─────────────────────────────────────────────────────────────
const leftovers = [];
[
  ['refreshPlayer', methodBody(h5Script, 'refreshPlayer')],
  ['playWithAutoplayFallback', methodBody(h5Script, 'playWithAutoplayFallback')],
].forEach(([name, body]) => {
  if (!body) {
    leftovers.push(name + ' 取不到方法体');
    return;
  }
  if (/!this\.source/.test(body)) leftovers.push(name + ' 还在拿 !this.source 当「有没有得播」');
  if (name === 'refreshPlayer' && /loadByUrl\(this\.source\)/.test(body)) {
    leftovers.push(name + ' 地址档那一条 loadByUrl(this.source) 未改成 playbackTarget()');
  }
});
if (/if \(this\.source\) \{\s*props\.skinLayout\.push\(\{ name: "bigPlayButton"/.test(h5Script)) {
  leftovers.push('大播放按钮还按 this.source 摆，凭证档（source 为空）点不出第一下');
}
check('③ 旧的「只看 source」判据已清干净', leftovers.length === 0, leftovers);

// ─────────────────────────────────────────────────────────────
// ④ 实跑 playbackTarget / looksLikeMediaUrl（硬约束 28：拼出来的那一半正则看不见，必须真跑）
// ─────────────────────────────────────────────────────────────
function runTargets(cases) {
  const targetSrc = methodBody(h5Script, 'playbackTarget');
  const urlSrc = methodBody(h5Script, 'looksLikeMediaUrl');
  if (!targetSrc || !urlSrc) return [['取不到 playbackTarget / looksLikeMediaUrl 方法体', false]];
  // 两个方法互为依赖（playbackTarget 里要调 looksLikeMediaUrl），所以照组件那样摆成
  // 「同一批方法挂在同一个 this 上」再跑，不许只挑一个方法单独求值
  const make = new Function('return function () { const methods = { playbackTarget()' + targetSrc +
    ', looksLikeMediaUrl(value)' + urlSrc + ' }; const self = Object.assign({}, this, methods);' +
    ' return methods.playbackTarget.call(self); }');
  const built = make();
  const fails = [];
  cases.forEach((c) => {
    let got = '';
    try {
      got = built.call(c.self);
    } catch (e) {
      fails.push(c.name + ' 抛错 ' + e.message);
      return;
    }
    if (got !== c.expect) fails.push(c.name + '：期望「' + c.expect + '」实得「' + got + '」');
  });
  return fails;
}

const VID = 'b07926b0d12671f18aa8e6e6d55b0102';
const URL = 'https://outin-xxx.oss-cn-beijing.aliyuncs.com/1/a-ld-m3u8-encrypt-stream.m3u8?Expires=1793010374&Signature=abc';
const targetFails = runTargets([
  { name: '新调用点：vid + playauth 都在 ⇒ 用 vid', self: { vid: VID, playauth: 'AUTH', source: URL }, expect: VID },
  { name: '旧调用点（file-preview 那一档）：只把 vid 放在 source ⇒ 仍用 source', self: { vid: '', playauth: 'AUTH', source: VID }, expect: VID },
  // 关键反例：传了 playauth 但 source 是一条签名地址、vid 没给 ⇒ 绝不能把地址当 VID 交给 SDK
  { name: 'playauth + 只有地址 ⇒ 回空串（退回地址档，不拿地址当 VID）', self: { vid: '', playauth: 'AUTH', source: URL }, expect: '' },
  { name: '没有 playauth ⇒ 地址档照吃 source', self: { vid: '', playauth: '', source: URL }, expect: URL },
  { name: '什么都没有 ⇒ 空串', self: { vid: '', playauth: '', source: '' }, expect: '' },
]);
check('④ playbackTarget 五档实跑',
  targetFails.length === 0,
  targetFails.length ? targetFails : '五档形状逐条符合（含「地址不许当 VID」那一档）');

// ─────────────────────────────────────────────────────────────
// ⑤ 课程详情页接线：判据只存一处 + 三枚事件都接上 + 不许留旧绑定
// ─────────────────────────────────────────────────────────────
const videoTags = (pageTpl.match(/<video-play[\s\S]*?\/>/g) || []);
const pageProblems = [];
if (videoTags.length !== 2) pageProblems.push('详情页应有正片/试看两处 <video-play>，实得 ' + videoTags.length);
videoTags.forEach((tag, i) => {
  const no = '#' + (i + 1);
  if (!/:vid="vodAuth\.vid"/.test(tag)) pageProblems.push(no + ' 没绑 :vid');
  if (!/:playauth="vodAuth\.play_auth"/.test(tag)) pageProblems.push(no + ' 没绑 :playauth');
  if (!/:source="vodSourceOf\(/.test(tag)) pageProblems.push(no + ' 的 :source 没走 vodSourceOf（凭证到手还会把地址发过去）');
  if (!/vodReady/.test(tag)) pageProblems.push(no + ' 没有等凭证落地就挂播放器');
  ['@error', '@onM3u8Retry', '@refresh'].forEach((ev) => {
    if (!new RegExp(ev + '="renewVodAuth').test(tag)) pageProblems.push(no + ' 少了 ' + ev + ' → renewVodAuth');
  });
});
if (/data\.video_path\.play_auth/.test(pageTpl)) {
  pageProblems.push('模板还留着 :playauth="data.video_path.play_auth"（详情从不发这一格，那一行一直是个空绑定）');
}
check('⑤ 详情页两路 <video-play> 接线齐', pageProblems.length === 0, pageProblems);

check('⑥ 凭证只由服务端那一行的 vid 决定（前端不再自己解析 <alivod> 标签）',
  !/<alivod>/.test(pageScript) && /vodMediaOf\(d\)/.test(pageScript) && /\.vid/.test(pageScript),
  '标签提取只在后端 Playback::vidFromRow 一处（硬约束 11）');

check('⑦ 重取有上限、在途只发一发',
  /VOD_AUTH_MAX_RETRY/.test(pageScript) && /vodAuthPending/.test(pageScript) &&
    /vodAuthTries >= VOD_AUTH_MAX_RETRY/.test(pageScript),
  '挡住「@error / @onM3u8Retry / @refresh 互相顶着无限循环」');

check('⑧ 取不到凭证回落地址档、不许把画面卡死',
  /that\.vodReady = true;/.test(methodBody(pageScript, 'requestVodAuth')) &&
    /vodReady:\s*true/.test(pageScript),
  'vodReady 初值必须是 true：图文/直播/音频/小程序端不受这一发影响');

check('⑨ api_list 登记 course.playAuth → course/vod/playAuth',
  /playAuth:\s*\{\s*url:\s*'course\/vod\/playAuth',\s*auth:\s*false,\s*method:\s*'POST'/.test(apiList),
  'auth=false：试看是公开内容，未登录也要能取凭证（正片那一支由服务端回 401）');

// ─────────────────────────────────────────────────────────────
// ⑩ 小程序端一行没动（这一族的修复只作用于 H5）
// ─────────────────────────────────────────────────────────────
check('⑩ video-mp.vue 不认 vid / playauth',
  !/playauth|props\.vid|\bvid:/.test(mp),
  '小程序吃接口返回的播流地址交给原生 <video>，凭证档与它无关');

// ─────────────────────────────────────────────────────────────
let failed = 0;
console.log('=== 课程点播凭证链 接线自检 ===');
results.forEach((r) => {
  if (!r.pass) failed++;
  console.log((r.pass ? '[PASS] ' : '[FAIL] ') + r.name + (r.detail && (!r.pass || typeof r.detail === 'string')
    ? ': ' + (Array.isArray(r.detail) ? r.detail.join('；') : r.detail) : ''));
});
console.log('\n通过 ' + (results.length - failed) + ' / ' + results.length + '，失败 ' + failed);
process.exit(failed ? 1 : 0);
