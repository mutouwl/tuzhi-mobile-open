/**
 * 移动端 H5 播放器「iPad 不能全屏」这一族的机器验法
 * （硬约束 26：一类问题被点名时先补机器化验法；硬约束 27③：这类跨组件/跨 API 的接线
 *   sfc-check 只编译模板、ui-audit 只查版式，都看不见它）
 *
 * 跑法：node tuzi-mobile/scripts/check-video-fullscreen.js
 *       node tuzi-mobile/scripts/check-video-fullscreen.js --selftest   （验门禁能红）
 *
 * 背景：2026-10-25 用户报「很多小伙伴使用 iPad 平板观看视频，不能全屏，手机/电脑正常」。
 * 根因在 vendored Aliplayer 2.15.2 的 iOS 判据只认 UA 里的 iPad/iPhone/iPod：
 * iPadOS 13 起 Safari 默认发 Macintosh 桌面 UA，判不出 iOS ⇒ 不走 `video.webkitEnterFullscreen()`
 * 那条原生全屏链，改走元素 Fullscreen API / 模拟全屏；iPad 浏览器与微信内置浏览器上
 * 这条链要么没有 API、要么只对 video 生效，表现为「全屏按钮点了没反应」。
 *
 * 钉六件事（任何一条被改回去都必须报红）：
 *   A. iPadOS 判据同时覆盖传统 iPad UA 与「Macintosh + 多点触控」的桌面级 UA；
 *   B. requestFullScreen 先走 video 原生全屏，且排在播放器 fullscreenService 之前；
 *   C. exitFullScreen 走原生退出（原生全屏不在 document.fullscreenElement 里）；
 *   D. 播放器内置全屏按钮在**捕获阶段**被接管（按钮点击落在 Aliplayer 自己的服务上，
 *      不拦就永远走不到我们的方法）；
 *   E. 进入原生全屏前挂好 webkitbegin/end 事件（否则系统播放器「完成」退出后状态收不回来）；
 *   F. video.vue 包装层继续把 requestFullScreen/exitFullScreen 透传给实现层。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

const IMPL = 'src/components/video/video-h5.vue';
const WRAPPER = 'src/components/video/video.vue';

/** 取对象方法体（含方法名那一行到配对右花括号），按花括号深度配平 */
function methodBlock(src, name) {
  const start = src.search(new RegExp('\\n\\s{4}' + name + '\\s*\\([^)]*\\)\\s*\\{'));
  if (start < 0) return '';
  const brace = src.indexOf('{', start);
  let depth = 0;
  for (let i = brace; i < src.length; i++) {
    if (src[i] === '{') depth++;
    else if (src[i] === '}') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return '';
}

function check(src, wrapper) {
  const results = [];
  const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

  const request = methodBlock(src, 'requestFullScreen');
  const exit = methodBlock(src, 'exitFullScreen');
  const iosFamily = methodBlock(src, 'isIOSFamily');
  const enterNative = methodBlock(src, 'enterNativeVideoFullscreen');
  const exitNative = methodBlock(src, 'exitNativeVideoFullscreen');
  const guard = methodBlock(src, 'bindFullscreenButtonGuard');
  const buildPlayer = methodBlock(src, 'buildPlayer');

  /* A. iPadOS 判据 */
  ok(
    'A1 传统 iPad/iPhone/iPod UA 仍判为 iOS 家族',
    /iPad\|iPhone\|iPod/.test(iosFamily),
    'UA 正则丢了会让 iPhone 也失去原生全屏'
  );
  ok(
    'A2 iPadOS 13+ 桌面级 UA（Macintosh + 多点触控）判为 iOS 家族',
    /Macintosh/.test(iosFamily) && /maxTouchPoints/.test(iosFamily),
    '只认 iPad UA 就会漏掉现代 iPadOS —— 本次故障的根因'
  );

  /* B. 进入全屏 */
  ok(
    'B1 requestFullScreen 里有 iOS 原生化分支',
    /isIOSFamily\s*\(\s*\)/.test(request) && /enterNativeVideoFullscreen\s*\(/.test(request)
  );
  ok(
    'B2 原生全屏排在 fullscreenService 之前',
    request.indexOf('enterNativeVideoFullscreen') >= 0 &&
      request.indexOf('enterNativeVideoFullscreen') < request.indexOf('fullscreenService')
  );
  ok(
    'B3 原生能力不可用时仍回落播放器链路（不吞掉桌面/安卓）',
    /fullscreenService/.test(request) && /requestFullscreen|webkitRequestFullscreen/.test(request)
  );

  /* C. 退出全屏 */
  ok(
    'C1 exitFullScreen 先走原生退出',
    /isIOSFamily\s*\(\s*\)/.test(exit) && /exitNativeVideoFullscreen\s*\(/.test(exit),
    '原生视频全屏不在 document.fullscreenElement 里，走 document.exitFullscreen 退不掉'
  );
  ok(
    'C2 原生退出内部确实调用 webkitExitFullscreen 且按 webkitDisplayingFullscreen 判活',
    /webkitExitFullscreen/.test(exitNative) &&
      /isNativeVideoFullscreenActive/.test(exitNative) &&
      /webkitDisplayingFullscreen/.test(methodBlock(src, 'isNativeVideoFullscreenActive'))
  );

  /* D. 内置全屏按钮接管 */
  ok(
    'D1 捕获阶段拦截 .prism-fullscreen-btn',
    /prism-fullscreen-btn/.test(guard) && /addEventListener/.test(guard) && /,\s*\n?\s*true\s*\n?\s*\)/.test(guard),
    '不拦这一下点击，按钮永远走 Aliplayer 自己的 fullscreenService'
  );
  ok(
    'D2 拦截后阻断播放器自己的点击链',
    /stopImmediatePropagation/.test(guard) && /stopPropagation/.test(guard)
  );
  ok(
    'D3 没有原生能力时放行（不破坏桌面/安卓的按钮）',
    /webkitEnterFullscreen/.test(guard) && /return;/.test(guard)
  );
  ok(
    'D4 按钮接管在 buildPlayer 的 nextTick 里挂上',
    /this\.bindFullscreenButtonGuard\s*\(\s*\)/.test(buildPlayer)
  );

  /* E. 原生全屏进出事件 */
  ok(
    'E1 进入原生全屏前挂 webkitbegin/end 事件',
    /bindVideoFullscreenEvents\s*\(\s*\)/.test(enterNative) && /webkitEnterFullscreen/.test(enterNative),
    '系统播放器退出后 fullScreen 收不回来，画面偏移/布局会停在错误一档'
  );

  /* F. 包装层透传 */
  ok(
    'F1 video.vue 透传 requestFullScreen / exitFullScreen',
    /requestFullScreen\s*\(\s*\)/.test(wrapper) &&
      /exitFullScreen\s*\(\s*\)/.test(wrapper) &&
      /videoPlayer\.requestFullScreen/.test(wrapper) &&
      /videoPlayer\.exitFullScreen/.test(wrapper)
  );

  return results;
}

const src = read(IMPL);
const wrapper = read(WRAPPER);
const results = check(src, wrapper);

if (process.argv.includes('--selftest')) {
  /* 门禁能红：分别摘掉三处关键实现，对应项必须失守 */
  const mutants = [
    {
      name: '摘掉 iPadOS 桌面 UA 判据',
      mutate: (s) => s.replace(/return \/Macintosh\/i\.test\(ua\)[\s\S]*?> 1;/, 'return false;'),
      expectRed: ['A2']
    },
    {
      name: '摘掉 requestFullScreen 的原生分支',
      mutate: (s) => {
        const block = methodBlock(s, 'requestFullScreen');
        return s.replace(block, block.replace(/if \(this\.isIOSFamily\(\)\) \{[\s\S]*?\n      \}/, ''));
      },
      expectRed: ['B1', 'B2']
    },
    {
      name: '摘掉内置按钮接管',
      mutate: (s) => {
        const block = methodBlock(s, 'bindFullscreenButtonGuard');
        return s.replace(block, block.replace(/playerElement\.addEventListener\([\s\S]*?true\s*\n?\s*\);/g, ''));
      },
      expectRed: ['D1']
    }
  ];

  let redOk = true;
  for (const mutant of mutants) {
    const mutated = mutant.mutate(src);
    if (mutated === src) {
      console.log('[FAIL] 自检样件没生效（源码结构变了，先修 --selftest 的替换式）：' + mutant.name);
      redOk = false;
      continue;
    }
    const mutantResults = check(mutated, wrapper);
    for (const name of mutant.expectRed) {
      const hit = mutantResults.find((r) => r.name.startsWith(name + ' '));
      if (!hit || hit.pass) {
        console.log('[FAIL] 门禁没能红：' + mutant.name + ' → ' + name + ' 仍判 pass');
        redOk = false;
      }
    }
  }
  console.log(redOk ? 'SELFTEST PASS（三处摘除都能让对应判据报红）' : 'SELFTEST FAIL');
  process.exit(redOk ? 0 : 1);
}

for (const r of results) {
  console.log((r.pass ? 'PASS ' : '[FAIL] ') + r.name + (r.note && !r.pass ? '｜' + r.note : ''));
}
const failed = results.filter((r) => !r.pass).length;
console.log('\n' + (results.length - failed) + '/' + results.length + ' PASS' + (failed ? '，' + failed + ' FAIL' : ''));
process.exit(failed ? 1 : 0);
