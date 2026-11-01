#!/usr/bin/env node
/**
 * 直播「画面加载中」起播加载态：点亮判据与收口出口（H5）
 *
 * 钉住的缺陷（2026-09-28 用户点名）：真实直播第一次进直播详情页，播放器已经停在
 * 「大播放按钮」上（桌面浏览器拦掉有声自动播放），那一格「画面加载中…」却照样点亮，
 * 而且永远不消失，还能透过它点到播放按钮——症状读起来是「加载框是假的、页面卡住了」。
 * 原因是 onVideoWaiting 只按「还没出首帧」点亮遮罩，没有问一句「此刻真的在拉流吗」。
 *
 * 七条判据：
 *   A1 播放器组件暴露 isAwaitingPlay()，判据是「媒体元素没建好 或 paused」
 *   A2 页面侧 videoAwaitingPlay() 在拿不到该方法时返回 false（小程序端表现逐字不变）
 *   A3 waiting 的首帧分支必须带上「不在等待手势」这一道闸
 *   A4 用户/自动播放真的起播（play 事件）才点亮这一格
 *   A5 点亮只有 A3/A4 两处；收口至少三处（错误锁定、离开在线态、首个 timeupdate）
 *   A6 遮罩仍按 live.vue 的 v-if 渲染且点击穿透（不挡住播放按钮是既有口径）
 *   A7 包装层 components/video/video.vue 把 isAwaitingPlay 转下去——页面 ref 指的是这一层，
 *      只在实现层加就等于没加（§4 那条「透传只在包装层声明」的同一个坑）
 *
 * 2026-10-16 用户实报补 B 组（第一次进直播间：加载一段时间报错 → 画面自己重挂 → 还要再点
 * 一下播放按钮才播）：
 *   B1 js.vue 有 videoAutostart（这一屏「应当自动播放」）且初值 true
 *   B2 live.vue 的 :resumePlay = userPlayRequested || videoAutostart
 *   B3 错误锁定/解锁两支各翻一次 videoAutostart
 *   B4 roomData.status 侦听里 videoAutostart 跟在线态翻
 *   B5 video-h5 的静音续播重试窗口判据确实是 resumePlay（B1~B4 的依据）
 *   B6 错误板「刷新」不整页重载：调用点传 prop + 包装层声明并透传
 *   B7 video-h5 在该 prop 下截断 location.reload 改走 refreshPlayer
 *
 * 用法：node scripts/check-live-first-loading.js   （exit 0 = 全部通过）
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const JS_PAGE = path.join(ROOT, 'src/pages/course/live/js.vue');
const H5_PLAYER = path.join(ROOT, 'src/components/video/video-h5.vue');
const WRAP = path.join(ROOT, 'src/components/video/video.vue');
const TPL = path.join(ROOT, 'src/pages/course/live/live.vue');

const results = [];
function tell(name, pass, detail) {
  results.push({ name, pass, detail });
}
function read(p) {
  return fs.readFileSync(p, 'utf8');
}
/** 取某个方法/侦听的源码片段（从签名起，到下一个同级方法名为止的粗略切法） */
function slice(src, startMarker, endMarkers) {
  const from = src.indexOf(startMarker);
  if (from < 0) return null;
  let to = src.length;
  endMarkers.forEach((m) => {
    const i = src.indexOf(m, from + startMarker.length);
    if (i >= 0 && i < to) to = i;
  });
  return src.slice(from, to);
}

const js = read(JS_PAGE);
const h5 = read(H5_PLAYER);
const tpl = read(TPL);

// A1 播放器组件：isAwaitingPlay 存在且判据正确
const awaiting = slice(h5, 'isAwaitingPlay() {', ['syncFullScreenState']);
tell(
  'A1 video-h5 暴露 isAwaitingPlay（没建好或 paused 都算没在加载）',
  !!awaiting && /getMediaElement\(\)/.test(awaiting) && /return\s+!media\s*\|\|\s*!!media\.paused/.test(awaiting),
  awaiting ? awaiting.slice(0, 160) : 'isAwaitingPlay 未找到'
);

// A2 页面侧安全包装：小程序端拿不到方法 ⇒ false（不改既有表现）
const pageAwaiting = slice(js, 'videoAwaitingPlay() {', ['onVideoWaiting()']);
tell(
  'A2 页面 videoAwaitingPlay 在无该方法时返回 false（小程序端不变）',
  !!pageAwaiting && /typeof box\.isAwaitingPlay !== "function"/.test(pageAwaiting) && /return false;/.test(pageAwaiting),
  pageAwaiting ? pageAwaiting.slice(0, 220) : 'videoAwaitingPlay 未找到'
);

// A3 waiting 首帧分支带闸
const waiting = slice(js, 'onVideoWaiting() {', ['onVideoPlaying(']);
const firstFrameBranch = waiting ? waiting.slice(0, waiting.indexOf('this.videoFirstLoading = true;') + 40) : null;
tell(
  'A3 waiting 点亮首帧遮罩前必须过 videoAwaitingPlay 这道闸',
  !!firstFrameBranch && /!this\.videoAwaitingPlay\(\)/.test(firstFrameBranch) && /!this\.everPlayed/.test(firstFrameBranch),
  firstFrameBranch ? firstFrameBranch.slice(0, 320) : 'waiting 首帧分支未找到'
);

// A4 play 事件才点亮（且只在未出首帧时）
const onPlay = slice(js, 'onPlay() {', ['fakeVideoJump()']);
tell(
  'A4 play 事件在未出首帧时点亮这一格',
  !!onPlay && /if \(!this\.everPlayed\) \{[\s\S]{0,80}this\.videoFirstLoading = true;/.test(onPlay),
  onPlay ? onPlay.slice(0, 260) : 'onPlay 未找到'
);

// A5 点亮两处 / 收口三处
const litCount = (js.match(/this\.videoFirstLoading = true;/g) || []).length;
const clearCount = (js.match(/this\.videoFirstLoading = false;/g) || []).length;
tell(
  'A5 点亮只允许 waiting+play 两处，收口至少三处（错误锁定/离开在线态/首帧）',
  litCount === 2 && clearCount >= 3,
  JSON.stringify({ lit: litCount, clear: clearCount })
);

// A6 模板：遮罩照 v-if 渲染且点击穿透
const overlay = slice(tpl, 'v-if="videoFirstLoading"', ['<video-box']);
tell(
  'A6 遮罩仍按 videoFirstLoading 渲染，类名 video-first-loading-overlay 保持点击穿透',
  !!overlay && /video-first-loading-overlay/.test(overlay),
  overlay ? overlay.slice(0, 160) : '遮罩节点未找到'
);

// A7 包装层：页面 ref 指向 components/video/video.vue，方法不在这一层转下去就等于没有
const wrap = read(WRAP);
const wrapAwaiting = slice(wrap, 'isAwaitingPlay() {', ['play() {']);
tell(
  'A7 video-box 包装层把 isAwaitingPlay 转给内层（内层没实现返回 false）',
  !!wrapAwaiting &&
    /\$refs\.videoPlayer\.isAwaitingPlay/.test(wrapAwaiting) &&
    /return false;/.test(wrapAwaiting),
  wrapAwaiting ? wrapAwaiting.slice(0, 200) : '包装层未转发（判据会恒为 false）'
);

// ===== B 组：降级重建后的自动续播 + 错误板「刷新」不整页重载（2026-10-16 用户点名）=====
// 症状：第一次进直播间，加载一段时间报错 → 画面自己重挂（降级链换源重建）→ 还要再点一下
// 播放按钮才播。根因：续播判据只认 userPlayRequested（onPlay 才置位），首屏这一路观众还没
// 点过 ⇒ video-h5 里那条静音续播重试窗口（判据 resumePlay）没被挂上，只剩单次尝试。

// B1 页面：这一屏「应当自动播放」的状态位存在且进房即为真
const autostart = slice(js, 'videoAutostart: true,', ['videoUrlSetAt:']);
tell(
  'B1 js.vue 有 videoAutostart 且初值为 true（进房即应自动起播）',
  !!autostart && /videoAutostart:\s*true/.test(autostart),
  autostart ? autostart.slice(0, 160) : 'videoAutostart 未找到'
);

// B2 模板：续播判据必须把它并进去（只认用户点过 ⇒ 首屏那一路拿不到）
tell(
  'B2 live.vue 的 :resumePlay 判据 = userPlayRequested || videoAutostart',
  /:resumePlay="userPlayRequested \|\| videoAutostart"/.test(tpl),
  (tpl.match(/:resumePlay="[^"]*"/) || ['未找到 :resumePlay'])[0]
);

// B3 复位点：错误锁定/解锁两支各翻一次
const lockedWatcher = slice(js, 'videoErrorLocked(locked) {', ['"roomData.status"']);
tell(
  'B3 错误锁定/解锁两支各翻 videoAutostart（终态不强拉、解锁自动续播）',
  !!lockedWatcher &&
    /this\.videoAutostart = false;/.test(lockedWatcher) &&
    /this\.videoAutostart = true;/.test(lockedWatcher),
  lockedWatcher ? lockedWatcher.slice(0, 300) : 'videoErrorLocked 未找到'
);

// B4 在线态翻：只有 online 才强拉
const statusWatcher = slice(js, '"roomData.status"(val) {', ['loading(open)']);
tell(
  'B4 roomData.status 侦听里 videoAutostart 跟在线态翻',
  !!statusWatcher && /this\.videoAutostart = val === "online";/.test(statusWatcher),
  statusWatcher ? statusWatcher.slice(0, 200) : 'status 侦听未找到'
);

// B5 播放器：静音续播重试窗口的判据确实是 resumePlay（B1~B4 只在这一条成立时才有意义）
const fallback = slice(h5, 'playWithAutoplayFallback() {', ['bindMuteRestore() {']);
tell(
  'B5 video-h5 的静音续播重试窗口判据是 resumePlay（并保留补发序列）',
  !!fallback &&
    /if \(this\.resumePlay\) \{/.test(fallback) &&
    /\[800, 1600, 2400, 3600, 4800, 6000\]/.test(fallback),
  fallback ? fallback.slice(0, 200) : 'playWithAutoplayFallback 未找到'
);

// B6 错误板「刷新」不整页重载：调用点传 + 包装层声明并透传
// （只在实现层有 = 调用点传不进来，与 A7 同一个坑）
tell(
  'B6a live.vue 传 prevent-page-reload-on-refresh（错误板刷新不整页重载）',
  /:prevent-page-reload-on-refresh="true"/.test(tpl),
  (tpl.match(/:prevent-page-reload-on-refresh="[^"]*"/) || ['未找到该 prop'])[0]
);
tell(
  'B6b 包装层 video.vue 声明并透传 preventPageReloadOnRefresh',
  /preventPageReloadOnRefresh: \{/.test(wrap) &&
    /:preventPageReloadOnRefresh="preventPageReloadOnRefresh"/.test(wrap),
  '包装层缺声明或缺透传（调用点传了也到不了 video-h5）'
);

// B7 拦截点：只有传了该 prop 才截断 SDK 那枚按钮的 location.reload
const refreshBind = slice(h5, 'bindRefreshButton() {', ['unbindRefreshButton() {']);
tell(
  'B7 video-h5 在 preventPageReloadOnRefresh 下截断 location.reload 并改走 refreshPlayer',
  !!refreshBind &&
    /if \(this\.preventPageReloadOnRefresh\) \{/.test(refreshBind) &&
    /this\.refreshPlayer\(\)/.test(refreshBind),
  refreshBind ? refreshBind.slice(0, 240) : 'bindRefreshButton 未找到'
);

let failed = 0;
console.log('=== 直播起播加载态（画面加载中）判据检查 ===');
results.forEach((r) => {
  console.log((r.pass ? '[PASS] ' : '[FAIL] ') + r.name + (r.pass ? '' : '\n        ' + r.detail));
  if (!r.pass) failed++;
});
console.log(`通过: ${results.length - failed}  失败: ${failed}`);
process.exit(failed ? 1 : 0);
