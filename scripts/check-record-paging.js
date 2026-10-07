// 打卡记录页「当日列表」校验（不构建、不开浏览器）：把 record/js.vue 的 script 原样抽出来，
// 用桩喂 uni / $api，按用户 2026-09-26 点名的三条需求断言：
//   A. 每次只列日历上选中的那一天，且这一天是分页的：请求带 day + page/limit=10，
//      第一页取满 10 条时 has_more 为真 → 上拉(onReachBottom)要第二页，取完不再多发一次；
//   B. 点日历换日 = 触发刷新：先清空旧列表、期间铺「当日列表」的局部骨架屏（dayLoading），
//      落地后收起；而 onShow / 下拉刷新 / 卡片删改后的重取必须静默（不闪骨架，见 M23）；
//   C. 顶部活动卡（打卡名称 + 已加入 N 天）落点是本活动详情页，且页面栈里已压着同一场活动的主页时
//      退回那一层，不重复开第二张；
//   D. 分组隔离下跨组看别人（2026-09-26 用户口径）：个人信息卡照给，统计/月历/当日列表一概不取，
//      落一句吃接口文案的空态；未遮蔽（本人 / 同组 / 未分组）时口径不得被一起收掉。
// 另钉两条护栏：连点两个日期时旧响应不得覆盖新日期的列表（seq）；取数失败必须有可读出口（M13）。
// 用法：node tuzi-mobile/scripts/check-record-paging.js   （exit 0 = 全部符合预期）
const fs = require('fs');
const path = require('path');

const PAGE = path.resolve(__dirname, '../src/pages/app/checkin/record');

function loadOptions(stub) {
  let src = fs.readFileSync(path.join(PAGE, 'js.vue'), 'utf8');
  src = src.replace(/^[\s\S]*?<script>/, '').replace(/<\/script>[\s\S]*$/, '').replace('export default', 'module.exports =');
  src = src.replace(/^import\s*\{([^}]*)\}\s*from\s*["'][^"']*["'];?\s*$/gm, (m, names) =>
    'const ' + names.split(',').map((n) => n.trim()).filter(Boolean).map((n) => n + ' = () => ({})').join(', ') + ';');
  src = src.replace(/^import\s+([A-Za-z_$][\w$]*)\s+from\s*["'][^"']*["'];?\s*$/gm, 'const $1 = () => ({});');
  const m = { exports: {} };
  new Function('module', 'exports', 'uni', 'getCurrentPages', src)(m, m.exports, stub.uni, stub.getCurrentPages);
  return m.exports;
}

const dayStr = (offset) => {
  const d = new Date(Date.now() + offset * 86400000);
  const pad = (n) => (n < 10 ? '0' + n : '' + n);
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
};

// 可控的 $api 桩：请求先记下，回不回、回什么由用例决定（分页必须有先后两页，不能一把全回）
function makeApi() {
  const reqs = [];
  const open = [];
  const toasts = [];
  const api = (name, params) => {
    reqs.push({ name, params: params || {} });
    return new Promise((resolve) => { open.push({ name, params: params || {}, resolve }); });
  };
  const take = (name, pick) => {
    const i = open.findIndex((x) => x.name === name && (pick === undefined || pick(x)));
    if (i < 0) throw new Error('没有在飞的 ' + name + ' 请求');
    return open.splice(i, 1)[0];
  };
  const tick = () => new Promise((r) => setTimeout(r, 5));
  return {
    reqs, toasts, api,
    // 回一份某日列表：rows 由条数生成，id 递增（后端按 id 倒序翻页）
    replyDay(n, hasMore, fromId) {
      const it = take('checkin.checkin.dayDetail');
      const base = fromId === undefined ? 1000 : fromId;
      const records = [];
      for (let i = 0; i < n; i++) records.push({ id: base + i, day: it.params.day, content: 'c' + (base + i), like_count: 0, comment_count: 0 });
      it.resolve({ code: 1, msg: 'ok', data: { day: it.params.day, total: n, has_more: hasMore, records, tasks: [] } });
      return tick();
    },
    replyDayFail(msg) {
      const it = take('checkin.checkin.dayDetail');
      it.resolve({ code: 0, msg: msg || '后端故障', data: {} });
      return tick();
    },
    replyCalendar(data) {
      const it = take('checkin.checkin.calendar');
      it.resolve({ code: 1, msg: 'ok', data: Object.assign({ title: '自律行动营', stats: {}, days: {}, joined_days: 3, is_self: 1, owner_id: 0 }, data) });
      return tick();
    },
    lastDayReq: () => [...reqs].reverse().find((r) => r.name === 'checkin.checkin.dayDetail'),
    dayReqCount: () => reqs.filter((r) => r.name === 'checkin.checkin.dayDetail').length,
  };
}

function makeVm(opts, extra) {
  const vm = Object.assign({}, opts.data(), {
    $tools: { systemConfig: () => true, cachedUser: () => ({ nickname: '凸知', avatar: '' }) },
    $nav: { to: () => {}, setShareInfo: () => {} },
  }, extra);
  Object.keys(opts.methods).forEach((k) => { vm[k] = opts.methods[k].bind(vm); });
  return vm;
}

let fail = 0;
const assert = (name, ok, got) => {
  if (!ok) fail++;
  console.log((ok ? '[PASS] ' : '[FAIL] ') + name + ' -> ' + got);
};

(async () => {
  const nav = { toasts: [], back: [], push: [] };
  const uni = {
    showToast: (o) => nav.toasts.push(o && o.title),
    navigateBack: (o) => nav.back.push(o && o.delta),
    navigateTo: (o) => nav.push.push(o && o.url),
    redirectTo: (o) => nav.push.push(o && o.url),
    stopPullDownRefresh: () => {},
    setNavigationBarTitle: () => {},
    getStorageSync: () => ({}),
    getSystemInfoSync: () => ({}, {}),
  };
  const setup = (pages) => {
    const a = makeApi();
    const opts = loadOptions({ uni, getCurrentPages: () => pages || [{ route: 'x' }] });
    const vm = makeVm(opts, { $api: a.api });
    return { a, opts, vm };
  };

  // === A. 进页面只列当天，且当天是分页取的 ===
  const s = setup();
  s.opts.onLoad.call(s.vm, { id: '628' });
  await s.a.replyCalendar({});
  const first = s.a.lastDayReq();
  assert('A1 首屏按「今天」取当日列表，带 page/limit=10',
    first.params.day === dayStr(0) && Number(first.params.page) === 1 && Number(first.params.limit) === 10,
    JSON.stringify(first.params));
  await s.a.replyDay(10, true);
  assert('A2 第一页 10 条 + has_more=true → 列表 10 条、还能上拉',
    s.vm.dayRecords.length === 10 && s.vm.dayHasMore === true && s.vm.dayLoadStatus === 'loadmore',
    'len=' + s.vm.dayRecords.length + ' hasMore=' + s.vm.dayHasMore + ' status=' + s.vm.dayLoadStatus);
  const before = s.a.dayReqCount();
  s.opts.onReachBottom.call(s.vm);
  await s.a.replyDay(2, false, 2000);
  const second = s.a.lastDayReq();
  assert('A3 上拉加载第二页（page=2，同一 day）',
    s.a.dayReqCount() === before + 1 && Number(second.params.page) === 2 && second.params.day === dayStr(0),
    JSON.stringify(second.params));
  assert('A4 第二页是续接不是替换，取完 has_more=false 收到 nomore',
    s.vm.dayRecords.length === 12 && s.vm.dayRecords[11].id === 2001 && s.vm.dayLoadStatus === 'nomore',
    'len=' + s.vm.dayRecords.length + ' last=' + (s.vm.dayRecords[11] || {}).id + ' status=' + s.vm.dayLoadStatus);
  const afterMore = s.a.dayReqCount();
  s.opts.onReachBottom.call(s.vm);
  s.opts.onReachBottom.call(s.vm);
  assert('A5 已到末页再上拉不再发请求（不空转）', s.a.dayReqCount() === afterMore, 'calls=' + s.a.dayReqCount());

  // === B. 点日历换日：清空 + 局部骨架屏 + 从头取 ===
  s.vm.dayError = '残留';
  s.vm.onDayClick(dayStr(-3));
  assert('B1 换日即清空旧列表、page 归 1、铺当日骨架屏',
    s.vm.dayRecords.length === 0 && s.vm.dayPage === 1 && s.vm.dayLoading === true && s.vm.dayError === '',
    'len=' + s.vm.dayRecords.length + ' page=' + s.vm.dayPage + ' loading=' + s.vm.dayLoading);
  const sw = s.a.lastDayReq();
  assert('B2 换日发的请求带着新日期', sw.params.day === dayStr(-3) && Number(sw.params.page) === 1, JSON.stringify(sw.params));
  await s.a.replyDay(1, false);
  assert('B3 落地后收起骨架屏', s.vm.dayLoading === false && s.vm.dayRecords.length === 1,
    'loading=' + s.vm.dayLoading + ' len=' + s.vm.dayRecords.length);

  // === B4. 重取（onShow / 下拉刷新 / 卡片删改）走静默口径，不闪骨架 ===
  const ownBefore = s.a.dayReqCount();
  s.vm.ownerId = 55;
  s.vm.onDayClick(dayStr(-2));
  const ownReq = s.a.lastDayReq();
  assert('B6 看别人的记录页时，当日列表按 ownerId 收窄（与「看他人记录」同一口径，不各算一套）',
    Number(ownReq.params.user_id) === 55 && ownReq.params.day === dayStr(-2), JSON.stringify(ownReq.params));
  await s.a.replyDay(1, false);
  s.vm.ownerId = 0;
  const silent = s.a.dayReqCount();
  const p = s.vm.reloadDay();
  assert('B4 静默重取不铺骨架屏、页码归 1',
    s.vm.dayLoading === false && s.vm.dayPage === 1 && s.a.dayReqCount() === silent + 1,
    'loading=' + s.vm.dayLoading + ' page=' + s.vm.dayPage);
  await s.a.replyDay(3, false);
  assert('B5 静默重取整块替换（不是往后叠一份）', s.vm.dayRecords.length === 3, 'len=' + s.vm.dayRecords.length);
  await p;

  // === 护栏一：连点两天，先发出的那次响应（哪怕后回来）不得盖住新日期 ===
  s.vm.onDayClick(dayStr(-5));
  s.vm.onDayClick(dayStr(-6));
  // 两条都在飞：按发出顺序回（replyDay 取最早那条），即「A 先回、B 后回」
  await s.a.replyDay(4, false);   // A（-5 那天 4 条）→ seq 已过期，必须丢掉
  await s.a.replyDay(7, false);   // B（-6 那天 7 条）→ 采纳
  const staleOk = s.vm.selectedDay === dayStr(-6) && s.vm.dayRecords.length === 7
    && s.vm.dayRecords.every((r) => r.day === dayStr(-6));
  assert('护栏 连点两个日期后按最后一次点击出列表（旧响应被丢弃）', staleOk,
    'selectedDay=' + s.vm.selectedDay + ' len=' + s.vm.dayRecords.length);

  // === 护栏二：取数失败必须有可读出口（M13） ===
  s.vm.onDayClick(dayStr(-8));
  await s.a.replyDayFail('当天数据取不到');
  assert('护栏 第一页失败 → 空态文案吃后端 msg，骨架收起',
    s.vm.dayError === '当天数据取不到' && s.vm.dayLoading === false,
    'dayError=' + s.vm.dayError + ' loading=' + s.vm.dayLoading);
  s.vm.onDayClick(dayStr(0));
  await s.a.replyDay(10, true);
  const toastsBefore = nav.toasts.length;
  s.opts.onReachBottom.call(s.vm);
  await s.a.replyDayFail('翻页失败');
  assert('护栏 翻页失败 → 页码退回去（再上拉就是重试）并 toast 一句',
    s.vm.dayPage === 1 && nav.toasts.length === toastsBefore + 1 && s.vm.dayLoadStatus === 'loadmore',
    'page=' + s.vm.dayPage + ' toast=' + JSON.stringify(nav.toasts.slice(-1)) + ' status=' + s.vm.dayLoadStatus);

  // === C. 顶部活动卡 → 本活动详情页 ===
  nav.back.length = 0; nav.push.length = 0;
  const stackCase = (pages, name, want) => {
    const t = setup(pages);
    t.opts.onLoad.call(t.vm, { id: '628' });
    t.a.replyCalendar({});
    nav.back.length = 0; nav.push.length = 0;
    t.vm.goDetail();
    assert(name, want(nav), 'back=' + JSON.stringify(nav.back) + ' push=' + JSON.stringify(nav.push));
  };
  // 主页在栈里（[主页, 本页]）→ 退回那一层，不重复开
  stackCase([{ route: 'pages/app/checkin/detail/detail', $vm: { id: 628 } }, { route: 'pages/app/checkin/record/record', $vm: {} }],
    'C1 栈里已有同一场活动的主页 → navigateBack 退回那一层',
    (n) => n.back.length === 1 && n.back[0] === 1 && n.push.length === 0);
  // 栈里的主页是别的活动 → 照样新开（id 对不上不算）
  stackCase([{ route: 'pages/app/checkin/detail/detail', $vm: { id: 777 } }, { route: 'pages/app/checkin/record/record', $vm: {} }],
    'C2 栈里的主页属别的活动 → navigateTo 新开本活动主页',
    (n) => n.back.length === 0 && n.push.length === 1 && n.push[0] === '/pages/app/checkin/detail/detail?id=628');
  // 深链/分享直达：栈里只有本页
  stackCase([{ route: 'pages/app/checkin/record/record', $vm: {} }],
    'C3 深链直达（栈里没有主页）→ navigateTo 新开',
    (n) => n.back.length === 0 && n.push.length === 1 && n.push[0] === '/pages/app/checkin/detail/detail?id=628');

  // === D. 分组隔离下跨组看别人：个人信息卡照给，TA 的内容一概不取（2026-09-26 用户口径） ===
  const d = setup([{ route: 'pages/app/checkin/record/record', $vm: {} }]);
  d.opts.onLoad.call(d.vm, { id: '628', user_id: '99' });
  await d.a.replyCalendar({ masked: 1, masked_msg: '该学员与你不在同一分组，打卡记录不可见', is_self: 0, owner_id: 99, nickname: '他的打卡昵称' });
  assert('D1 遮蔽档吃接口值：masked 落上、这个人仍然拿得到',
    d.vm.masked === true && d.vm.maskedMsg.indexOf('不可见') > -1 && d.vm.nickname === '他的打卡昵称' && d.vm.isSelf === false,
    'masked=' + d.vm.masked + ' nick=' + d.vm.nickname + ' isSelf=' + d.vm.isSelf);
  assert('D2 遮蔽时不发当日列表请求（selectedDay 留空，那一块已经是空态）',
    d.a.dayReqCount() === 0 && d.vm.selectedDay === '', 'dayReqs=' + d.a.dayReqCount() + ' selected=' + JSON.stringify(d.vm.selectedDay));
  assert('D3 遮蔽时不把没给的数据填成零值（后端根本不下发 stats/days）',
    Object.keys(d.vm.stats).length === 0 && Object.keys(d.vm.days).length === 0,
    'stats=' + JSON.stringify(d.vm.stats) + ' days=' + JSON.stringify(d.vm.days));
  d.opts.onShow.call(d.vm);
  await d.a.replyCalendar({ masked: 1, masked_msg: '该学员与你不在同一分组，打卡记录不可见', is_self: 0, owner_id: 99 });
  assert('D4 回本页重取仍走同一条遮蔽分支（不补发当日列表）', d.a.dayReqCount() === 0, 'dayReqs=' + d.a.dayReqCount());
  // 遮蔽前手上还留着上一次所选那天（后台把人挪去别组后再回本页）：标题与列表要一起收掉，
  // 否则页面下方挂着一行「x 的打卡」而底下什么都没有
  d.vm.selectedDay = dayStr(-1);
  d.vm.dayRecords = [{ id: 1 }];
  d.opts.onShow.call(d.vm);
  await d.a.replyCalendar({ masked: 1, masked_msg: '该学员与你不在同一分组，打卡记录不可见', is_self: 0, owner_id: 99 });
  assert('D5 遮蔽时把上一次的 selectedDay/列表清掉（不留一行没人认领的标题）',
    d.vm.selectedDay === '' && d.vm.dayRecords.length === 0 && d.a.dayReqCount() === 0,
    'selected=' + JSON.stringify(d.vm.selectedDay) + ' len=' + d.vm.dayRecords.length + ' dayReqs=' + d.a.dayReqCount());
  // 对照：没被遮蔽时（未分组/同组）当日列表照取，这条判据不能把正常口径一起收掉
  const e = setup([{ route: 'pages/app/checkin/record/record', $vm: {} }]);
  e.opts.onLoad.call(e.vm, { id: '628', user_id: '99' });
  await e.a.replyCalendar({ is_self: 0, owner_id: 99 });
  assert('D6 未遮蔽（同组/未分组）时 masked=false 且当日列表照发',
    e.vm.masked === false && e.a.dayReqCount() === 1 && e.vm.selectedDay === dayStr(0),
    'masked=' + e.vm.masked + ' dayReqs=' + e.a.dayReqCount() + ' selected=' + e.vm.selectedDay);

  // === 版式护栏：骨架块与真实列表互斥、上拉提示跟 status 走（record.vue 被改回去时这里先红） ===
  const tpl = fs.readFileSync(path.join(PAGE, 'record.vue'), 'utf8');
  const css = fs.readFileSync(path.join(PAGE, 'css.css'), 'utf8');
  assert('版式 模板用 dayLoading 铺当日骨架，与真实列表 v-else 互斥',
    /v-if="dayLoading"/.test(tpl) && /<block v-else>[\s\S]*?tz-checkin-record-card/.test(tpl), 'record.vue');
  assert('版式 上拉提示走 u-loadmore 且取完就收起',
    /<u-loadmore :status="dayLoadStatus" v-if="dayRecords\.length && dayLoadStatus !== 'nomore'">/.test(tpl), 'record.vue');
  assert('版式 骨架灰块与真实卡同一档（#e5e6eb + 4px 圆角 + 42px 缩进）',
    /\.cr-sk-rec-avatar\s*\{[^}]*36px/.test(css) && /\.cr-sk-rec-body\s*\{[^}]*42px/.test(css) && /\.cr-sk-rec-foot\s*\{[^}]*space-between/.test(css), 'css.css');
  assert('版式 活动卡落点是 goDetail（不是原先的打卡列表页）',
    /cr-act-card" @tap="goDetail"/.test(tpl) && !/checkin\/index\/index/.test(tpl + fs.readFileSync(path.join(PAGE, 'js.vue'), 'utf8')), 'record.vue');
  assert('版式 遮蔽只收数据区：个人信息卡/活动卡不带判据，统计与月历带 v-if="!masked"，空态吃 maskedMsg',
    /<view class="school-card cr-user">/.test(tpl) && /<view class="school-card cr-act-card" @tap="goDetail">/.test(tpl)
      && /cr-stats" v-if="!masked"/.test(tpl) && /tz-checkin-calendar v-if="!masked"/.test(tpl)
      && /<u-empty v-if="masked"[^>]*:text="maskedMsg"/.test(tpl), 'record.vue');

  console.log(fail === 0 ? '全部符合预期' : '有 ' + fail + ' 项不符合预期');
  process.exitCode = fail === 0 ? 0 : 1;
})();
