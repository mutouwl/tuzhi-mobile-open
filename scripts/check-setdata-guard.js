/**
 * 出口闸门（src/main.js 那一层）的行为钉子 —— 不构建、不开浏览器
 *
 * 为什么单拉一个脚本：这一层挡的是「App 全片卡死」那一类故障（所有页面停在首屏、点击像失灵、
 * 接口却全是 200，见 ui-baseline-mobile.md M26）。它的判据全在运行时——setData 的回调到点有没有回来、
 * 抛不抛、所属页面还在不在栈里——而本机禁止构建与开浏览器，只能把那段真源码抠出来、喂一只假页面上机跑。
 *
 * 钉四件事（都是 2026-09-28「分享弹窗一直加载中、关不掉，包括最新版本」那一轮补的）：
 *  ① 微信对已出栈页面的 setData 抛错：就地吞掉 + 复位在途标志 + **在控制台留一声**（不再静默）；
 *  ② 在途标志卡死（uni 把复位写在 setData 回调里，回调跑不到就永久停更）：看门表到点复位并补一次重渲染；
 *  ③ 回调正常回来时不打扰（不许无谓 $forceUpdate）；
 *  ④ 已出栈页面的那一拍直接丢，不喂给微信（这是那条报错本身的来源）。
 *
 * 抠的是 src/main.js 的真源码（按标记 + 花括号配平），假页面只需三样：`mpType === 'page'`
 * （uni 认页面的标记，属性名不带 $）、`$scope.setData`、可被 `getCurrentPages()` 返回。
 * 用法：node tuzi-mobile/scripts/check-setdata-guard.js
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src', 'main.js');
const mainSrc = fs.readFileSync(SRC, 'utf8');

/** 抠一段真源码：到行尾就收口的语句（常量 / new Set() 这类）整行取；带 `{` 的按花括号配平到收口（含尾分号） */
function cut(startMarker) {
  const i = mainSrc.indexOf(startMarker);
  if (i === -1) throw new Error('抠不到：' + startMarker);
  const lineEnd = mainSrc.indexOf('\n', i);
  const line = mainSrc.slice(i, lineEnd < 0 ? mainSrc.length : lineEnd);
  if (line.trim().slice(-1) === ';' && line.indexOf('{') === -1) return line;
  const open = mainSrc.indexOf('{', i);
  if (open === -1) throw new Error('既没有花括号也不到行尾收口：' + startMarker);
  let depth = 0;
  for (let j = open; j < mainSrc.length; j++) {
    const c = mainSrc[j];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return mainSrc.slice(i, mainSrc[j + 1] === ';' ? j + 2 : j + 1);
    }
  }
  throw new Error('花括号没配平：' + startMarker);
}

const pieces = [
  'const knownPages = new Set();',
  'const livePages = new Set();',
  'const guardStats = {',
  'const PENDING_STALL_MS = 1000;',
  'function guardTell(kind, detail) {',
  'function ownerInStack(owner) {',
  'function healStuckPending(owner) {',
  'function ownerPageOf(vm) {',
  'function guardSetData(vm) {',
];

const code = pieces.map(cut).join('\n');
const boot = new Function(
  'getCurrentPages',
  'console',
  code + '\nreturn { guardStats: guardStats, guardSetData: guardSetData, ownerPageOf: ownerPageOf };'
);

let fail = 0;
const assert = (name, ok, got) => {
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + (got === undefined ? '' : ' -> ' + got));
  if (!ok) fail++;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** 一只假页面/实例合一的对象：mpType 是 uni 打在页面实例上的标记；setData 由闸门替换 */
function fakePage(setDataImpl) {
  const page = {
    mpType: 'page',
    route: 'pages/app/checkin/diary/diary',
    __next_tick_pending: false,
    updateCount: 0,
    $scope: { data: {}, __webviewId__: 1 },
  };
  page.$forceUpdate = () => { page.updateCount++; };
  page.$scope.setData = setDataImpl || function (d, cb) {
    page.pushes = (page.pushes || 0) + 1;
    if (cb) cb();
  };
  return page;
}

(async () => {
  // —————— ① 微信对已出栈页面抛错：吞掉 + 复位标志 + 控制台留一声 ——————
  {
    const logged = [];
    const page = fakePage(function () {
      throw new TypeError("Cannot read properties of null (reading 'mutouweb')");
    });
    const guard = boot(() => [page], { error: (m) => logged.push(String(m)) });
    guard.guardSetData(page);
    page.__next_tick_pending = true;   // uni 的 patch 是「先置标志、再 setData」
    let threw = false;
    try { page.$scope.setData({ a: 1 }, () => {}); } catch (e) { threw = true; }
    assert('① 已出栈页面的 setData 抛错被就地吞掉（不再顺着 __patch__ 打断整个调度队列）',
      !threw && guard.guardStats.setDataErrors === 1, JSON.stringify({ threw: threw, errors: guard.guardStats.setDataErrors }));
    assert('① 错误被吞掉的同时在控制台留一声（不再静默：真机复现时有据可查）',
      logged.some((l) => l.indexOf('[setData-guard]') !== -1 && l.indexOf('mutouweb') !== -1),
      JSON.stringify(logged));
    assert('① 抛出点那条路也把在途标志复位了（否则这一页视图永久停更）',
      page.__next_tick_pending === false, String(page.__next_tick_pending));
  }

  // —————— ② 在途标志卡死（回调跑不到）：看门表到点复位并补一次重渲染 ——————
  {
    const logged = [];
    // 这一次的 setData 把回调扣住不发：真机上「页面销毁 / 运行时异常」就是这一种
    const page = fakePage(function (d, cb) { page.pushes = (page.pushes || 0) + 1; });
    const guard = boot(() => [page], { error: (m) => logged.push(String(m)) });
    guard.guardSetData(page);
    page.__next_tick_pending = true;
    const held = [];
    page.$scope.setData({ b: 2 }, (r) => held.push(r));
    assert('② 推送之后、回调还没回来的那一拍：标志仍是 true（这一拍本来就不该被抢着复位）',
      page.__next_tick_pending === true && guard.guardStats.pendingHealed === 0,
      JSON.stringify({ pending: page.__next_tick_pending, healed: guard.guardStats.pendingHealed }));
    await sleep(1200);
    assert('② 回调到点没回来：标志被复位 + 补了一次重渲染（queueWatcher 才会重新入队）',
      page.__next_tick_pending === false && page.updateCount === 1 && guard.guardStats.pendingHealed === 1,
      JSON.stringify({ pending: page.__next_tick_pending, forced: page.updateCount, healed: guard.guardStats.pendingHealed }));
    assert('② 这一次自愈与控制台那一声是一起的（下一轮复现能直接看到「卡死已复位」）',
      logged.some((l) => l.indexOf('[setData-guard]') !== -1 && l.indexOf('卡死') !== -1),
      JSON.stringify(logged));
  }

  // —————— ③ 回调正常回来：不打扰 ——————
  {
    const page = fakePage(function (d, cb) {
      page.pushes = (page.pushes || 0) + 1;
      if (cb) cb();
    });
    const guard = boot(() => [page], console);
    guard.guardSetData(page);
    page.__next_tick_pending = true;
    page.$scope.setData({ c: 3 }, function () { page.__next_tick_pending = false; });
    await sleep(1200);
    assert('③ 回调照常回来时不打扰：不置 pendingHealed、不补重渲染（只多一只已清掉的表）',
      guard.guardStats.pendingHealed === 0 && page.updateCount === 0,
      JSON.stringify({ healed: guard.guardStats.pendingHealed, forced: page.updateCount }));
  }

  // —————— ④ 已出栈页面的那一拍直接丢 ——————
  {
    const page = fakePage();
    const guard = boot(() => [], console);   // 页面栈里没有它 = 已经出栈
    guard.guardSetData(page);
    page.__next_tick_pending = true;
    page.$scope.setData({ d: 4 }, () => {});
    assert('④ 页面已出栈：这一拍不喂给微信（那条 TypeError 的来源就在这儿），标记录进 dropped',
      page.pushes === undefined && page.__next_tick_pending === false && guard.guardStats.dropped === 1,
      JSON.stringify({ pushes: page.pushes, dropped: guard.guardStats.dropped }));
    const orphan = { $scope: {} };
    assert('④ 解析不出所属页面时不缓存 null（缓存的 null 会让这个 scope 从此永远走「放行」）',
      guard.ownerPageOf(orphan) === null && orphan.$scope.__guardOwner === undefined,
      'unresolved=' + guard.guardStats.unresolved);
  }

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
