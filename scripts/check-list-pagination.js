/**
 * 列表分页三件套：下拉刷新 / 上滑加载 / 分页参数与总数消费 —— 不构建、不开浏览器
 *
 * 2026-10-28 用户点名「留意：送好友列表、拼团列表是否支持下拉刷新 上滑加载，分页功能」。
 * 这一族坏法在 sfc-check / ui-audit / curl 里都看不见：
 *   · 页面开了 `enablePullDownRefresh` 却没有 `onPullDownRefresh`（下拉没有回音、收条挂死）；
 *   · 有 `onReachBottom` 但没在途闸门（快速触底两次 page +2，跳页/重复拼同一页）；
 *   · 有 page/limit 却没消费 `total`（末页停不下来 / 永远翻）；
 *   · 请求回来了才读 `this.page`（下拉把 page 重置成 1，晚到的第 2 页回体被按第 1 页替换）；
 *   · 只判 `loading` 不判静默档的 `fetching`（onShow 静默重取与翻页并发）。
 *
 * 两个列表都按同一份合同钉：
 *  ① 路由开了 enablePullDownRefresh；
 *  ② onPullDownRefresh → getData，且 stopPullDownRefresh 有收口；
 *  ③ onReachBottom 有在途闸门 + 末页闸门 + page 自增；
 *  ④ 取数载荷带 page/limit；回体 total 被消费并驱动 loadStatus；
 *  ⑤ 有 fetching（静默档也挡）与 seq（旧回体丢弃）。
 *
 * 用法：node tuzi-mobile/scripts/check-list-pagination.js            # 验真件
 *       node tuzi-mobile/scripts/check-list-pagination.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const PAGES_JSON = path.join(ROOT, 'src/pages.json');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
	if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
	else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
	return !!ok;
}
const read = (f) => fs.readFileSync(f, 'utf8');
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ')
	.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');

/** 两个列表的源码位置（gift 是三段式，group_buy 是整页 SFC） */
const LISTS = [
	{
		name: '送好友 · 赠送记录',
		route: 'send_friend/gift/gift',
		page: path.join(ROOT, 'src/pages/app/send_friend/gift/gift.vue'),
		js: path.join(ROOT, 'src/pages/app/send_friend/gift/js.vue'),
		backend: path.join(BACKEND, 'application/api/controller/app/send_friend/Gift.php'),
		apiMethod: 'public function list($status = \'\', $page = 1, $limit = 10)',
		apiCall: 'send_friend.gift.list',
	},
	{
		name: '拼团 · 我的拼团',
		route: 'group_buy/index/index',
		page: path.join(ROOT, 'src/pages/app/group_buy/index/index.vue'),
		js: null,
		backend: path.join(BACKEND, 'application/api/controller/app/group_buy/Team.php'),
		// 这口的 return 形状在 library 那一层（控制器只转发），分页闸门要连它一起读
		listFile: path.join(BACKEND, 'application/common/library/app/group_buy/MyTeamPage.php'),
		apiMethod: 'public function myList($state = 0, $page = 1, $limit = 10)',
		apiCall: 'group_buy.team.myList',
	},
];

/** pages.json 里这条路由的 style 里有没有 enablePullDownRefresh: true（只看这条路由自己的块） */
function routePullDown(json, route) {
	const at = json.indexOf('"path": "' + route + '"');
	if (at < 0) { return false; }
	const next = json.indexOf('"path":', at + 10);
	const block = json.slice(at, next < 0 ? json.length : next);
	return /"enablePullDownRefresh"\s*:\s*true/.test(block);
}

/** 一份页面的分页合同 */
function checkList(src, spec) {
	const js = stripComments(src);
	const pull = /onPullDownRefresh\s*\(\s*\)\s*\{/.test(js);
	const pullCalls = /onPullDownRefresh\s*\(\s*\)\s*\{[\s\S]{0,400}?getData\(/.test(js);
	const stop = /uni\.stopPullDownRefresh\s*\(/.test(js);
	const reach = /onReachBottom\s*\(\s*\)\s*\{/.test(js);
	const reachGuard = /onReachBottom\s*\(\s*\)\s*\{[\s\S]{0,400}?(this\.loading|this\.fetching|loadStatus)/.test(js);
	// 两种翻页写法都收：拼团写 `page += 1`；送礼记录在上拉入口只 `getData(false)`、
	// 由 getData 里 `Math.floor(rows.length / limit) + 1` 现算（2026-10-28 复核时按真源码放宽）
	const reachPage = /onReachBottom\s*\(\s*\)\s*\{[\s\S]{0,600}?(this\.page\s*\+=\s*1|this\.page\s*=\s*.*\+\s*1)/.test(js)
		|| (/onReachBottom\s*\(\s*\)\s*\{[\s\S]{0,600}?getData\(\s*false\s*\)/.test(js)
			&& /Math\.floor\(this\.rows\.length\s*\/\s*this\.limit\)\s*\+\s*1/.test(js));
	const reachEnd = /onReachBottom\s*\(\s*\)\s*\{[\s\S]{0,400}?(nomore|this\.rows\.length\s*>=\s*this\.total|!this\.hasMore)/.test(js);
	// page/limit 必须出现在**这一发 API 调用的载荷**里（不能拿 data 里的 `page: 1, limit: 10` 冒充）：
	//  · 送礼记录：先 `const params = { page, limit }`，再 `$api(key, params)`；
	//  · 拼团：`$api(key, { state, page, limit })` 内联。
	const key = spec.apiCall.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const paramsObj = new RegExp('const params\\s*=\\s*\\{[^}]*\\bpage\\b[^}]*\\blimit\\b[^}]*\\}').test(js)
		&& new RegExp("\\$api\\(\\s*['\"]" + key + "['\"]\\s*,\\s*params").test(js);
	const inlineObj = new RegExp("\\$api\\(\\s*['\"]" + key + "['\"][\\s\\S]{0,260}?\\bpage\\b[\\s\\S]{0,80}?\\blimit\\b").test(js);
	const params = paramsObj || inlineObj;
	const apiCall = js.indexOf(spec.apiCall) >= 0;
	const total = /this\.total\s*=\s*Number\([^)]*total/.test(js) || /that\.total\s*=\s*Number\([^)]*total/.test(js);
	// 收口优先吃后端 has_more（M3）；total 只作兜底，不能反过来
	const hasMore = /data\.has_more/.test(js);
	// 回体按**发出去那一刻**的页码/刷新档合并，不能读响应回来时的 this.page：
	// 送礼记录用 `refresh` 布尔（闭包），拼团用 `const page = this.page`，两种都算对
	const pageCaptured = (/const page\s*=\s*this\.page/.test(js) && /page === 1/.test(js))
		|| (/refresh\s*\?\s*1\s*:/.test(js) && /refresh\s*\?\s*rows\s*:/.test(js));
	const status = /loadStatus\s*=\s*[^;\n]*'nomore'/.test(js) && /loadStatus\s*=\s*[^;\n]*'loadmore'/.test(js);
	const fetching = /fetching\s*:\s*false/.test(js) && /this\.fetching\s*=\s*true/.test(js)
		&& /this\.fetching\s*=\s*false/.test(js);
	const seq = /seq\s*:\s*0/.test(js) && /const seq\s*=\s*\+\+this\.seq/.test(js)
		&& /seq !== this\.seq|seq !== (that|this)\.seq/.test(js);
	return {
		pull, pullCalls, stop, reach, reachGuard, reachPage, reachEnd, params, apiCall, total, status, fetching, seq,
		ok: pull && pullCalls && stop && reach && reachGuard && reachPage && reachEnd && params && apiCall && total && hasMore && status && fetching && seq && pageCaptured,
		pageCaptured, hasMore,
	};
}

function got(c) {
	return 'pull=' + c.pull + ' pull→getData=' + c.pullCalls + ' stop=' + c.stop
		+ ' reach=' + c.reach + ' reach闸门=' + c.reachGuard + ' reach翻页=' + c.reachPage + ' 末页闸=' + c.reachEnd
		+ ' page/limit=' + c.params + ' API=' + c.apiCall + ' total=' + c.total + ' loadStatus=' + c.status
		+ ' fetching=' + c.fetching + ' seq=' + c.seq + ' 页码快照=' + c.pageCaptured + ' has_more=' + c.hasMore;
}

/** 后端两口都真的收 page/limit（不是前端自说自话） */
function backendPaged(spec) {
	const api = stripComments(read(spec.backend));
	const listSrc = spec.listFile ? stripComments(read(spec.listFile)) : api;
	const paged = /\$page\s*=\s*(intval|max)/.test(api) && /\$limit\s*=\s*(intval|max)/.test(api);
	const shape = /'has_more'\s*=>/.test(listSrc) && /\$page/.test(listSrc) && /\$limit/.test(listSrc);
	return paged && shape && api.indexOf(spec.apiMethod) >= 0;
}

function loadSpec(spec) {
	const src = spec.js ? read(spec.js) : read(spec.page);
	return { src, spec };
}

console.log('=== check-list-pagination（下拉刷新 / 上滑加载 / 分页）===');
const json = read(PAGES_JSON);
for (const spec of LISTS) {
	const { src } = loadSpec(spec);
	const c = checkList(src, spec);
	assert(spec.name + '：下拉刷新 / 上滑加载 / 分页三件套齐全', c.ok, got(c));
	assert(spec.name + '：路由开了 enablePullDownRefresh', routePullDown(json, spec.route), spec.route);
	assert(spec.name + '：后端列表接口真收 page/limit 且回 has_more', backendPaged(spec), spec.apiMethod.slice(0, 44));
}

if (process.argv.indexOf('--selftest') >= 0) {
	const spec = LISTS[0];
	const { src } = loadSpec(spec);
	const bad = [
		['摘掉 onReachBottom（上滑加载没有入口）', src.replace(/onReachBottom\s*\(\s*\)\s*\{[\s\S]*?\n\s*\},/, '')],
		['onReachBottom 不判在途/末页（快速触底会跳页）', src.replace(/onReachBottom\s*\(\s*\)\s*\{[\s\S]*?\n\s*\},/, 'onReachBottom() {\n    this.page += 1;\n    this.getData();\n},')],
		['取数载荷不带 page/limit', src.replace(/const params = \{ page, limit: this\.limit \};/, 'const params = {};')],
		['回体不消费 total', src.replace(/this\.total\s*=\s*Number\([^)]*total[^)]*\)\s*\|\|\s*0;/, '')],
		['下拉没有 stopPullDownRefresh（收条挂死）', src.replace(/uni\.stopPullDownRefresh\(\)/g, '')],
		['没有 fetching 在途闸门（静默重取与翻页并发）', src.replace(/fetching/g, 'fetchingX')],
		['没有 seq 序号（晚到的旧回体盖新结果）', src.replace(/seq/g, 'seqX')],
		['回体读响应回来时的 this.page（下拉把 page 重置后，第 2 页回体被按第 1 页替换）', src.replace(/refresh \? 1 : /g, '').replace(/refresh \? rows : /g, '')],
		['不读后端 has_more（只拿 total 自己推）', src.replace(/data\.has_more/g, 'data.hasMoreX')],
	];
	let fired = 0;
	bad.forEach(([name, mutated]) => {
		const c = checkList(mutated, spec);
		if (!c.ok) { fired++; pass++; console.log('[SELFTEST-FIRE] ' + name + ' -> ' + got(c)); }
		else { fail++; console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到 -> ' + got(c)); }
	});
	const routeJson = json.replace(/"path": "send_friend\/gift\/gift"([\s\S]{0,200}?)"enablePullDownRefresh": true/, '"path": "send_friend/gift/gift"$1"enablePullDownRefresh": false');
	if (!routePullDown(routeJson, spec.route)) { fired++; pass++; console.log('[SELFTEST-FIRE] 路由关掉 enablePullDownRefresh -> 已报红'); }
	else { fail++; console.log('[SELFTEST-FAIL] 路由关掉 enablePullDownRefresh 没被抓到'); }
	console.log('\n[SELFTEST] 坏样件 ' + fired + ' 条被抓红（要求 ≥10）；总通过 ' + pass + ' / 失败 ' + fail);
	process.exitCode = fail === 0 && fired >= 10 ? 0 : 1;
} else {
	console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
		: '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
	process.exitCode = fail === 0 ? 0 : 1;
}
