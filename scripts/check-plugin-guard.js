/**
 * 付费插件（拼团 `group_buy` / 送好友 `send_friend`）安装态适配闸门
 *
 * 为什么必须有这一只（用户 2026-10-27 点名「拼团、送好友是付费插件，如果没有安装插件前端
 * 请求对应的初始化接口会报错。要做好适配」）：
 *   ① `sfc-check` 只编译模板 —— 它看不见「这条请求该不该发」；
 *   ② `ui-audit` 只按正则查版式；
 *   ③ 后端 curl 只验接口出口（未装时那条接口本来就不该被调用）；
 *   ④ 现有的 `check-send-friend-*` / `check-group-buy-*` 判的是「组件/页面接线」与
 *      「未装时入口显不显示」，**判不到「本会话 init 还没回包」这一拍**：
 *      那一拍 `systemConfig` 可能是空的（误判未装 ⇒ 入口永远不回来），也可能是上一轮的旧值
 *      （误判已装 ⇒ 发出一条必然报「功能未安装」的请求）。这一档只能靠把三态逻辑跑起来验。
 *
 * 钉四组：
 *   A 三态内核实跑（`pluginState` / `markPluginMissing` / `pluginOfUrl` / `canRequestPlugin`）；
 *   B 请求层：发出前拦、后端说「未安装」不弹全局 toast、404 同档收口；
 *   C 两个商详组件与四个插件页 / 下单页：只读 `pluginState`，并挂 `onSystemConfigReady` 重判；
 *   D 「未装时一条插件请求都不发」的源码形状（组件里不再直接读 `app_isinstall_*` 判请求）。
 *
 * 用法：node tuzi-mobile/scripts/check-plugin-guard.js
 *      node tuzi-mobile/scripts/check-plugin-guard.js --selftest   # 反例必须每条都能红
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/** 判「有没有这么写」之前先剥注释：说明文字里引用旧写法（如「原先读 systemConfig」）不算命中 */
const stripComments = (s) => s
	.replace(/<!--[\s\S]*?-->/g, ' ')
	.replace(/\/\*[\s\S]*?\*\//g, ' ')
	.replace(/^\s*\/\/[^\n]*/gm, ' ');

const FILE = {
	guard: 'src/common/utils/plugin-guard.js',
	request: 'src/common/request/index.js',
	app: 'src/App.vue',
	gbArea: 'src/components/tz/group-buy-area.vue',
	sfArea: 'src/components/tz/send-friend-area.vue',
	submit: 'src/components/order/submit-order.vue',
	gbIndex: 'src/pages/app/group_buy/index/index.vue',
	gbDetail: 'src/pages/app/group_buy/detail/detail.vue',
	sfGift: 'src/pages/app/send_friend/gift/js.vue',
	sfSend: 'src/pages/app/send_friend/send/js.vue',
	sfReceive: 'src/pages/app/send_friend/receive/js.vue',
};

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
	if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
	else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
	return !!ok;
}

/** 极简 `uni` 桩：storage + 事件总线（够跑 plugin-guard 的三态，不引 uni-app 运行时） */
function makeUni() {
	const storage = {};
	const handlers = {};
	return {
		storage,
		handlers,
		getStorageSync: (k) => (storage[k] === undefined ? '' : storage[k]),
		setStorageSync: (k, v) => { storage[k] = v; },
		$on: (e, cb) => { (handlers[e] = handlers[e] || []).push(cb); },
		$off: (e, cb) => { handlers[e] = (handlers[e] || []).filter((f) => f !== cb); },
		$emit: (e) => { (handlers[e] || []).slice().forEach((f) => f()); },
	};
}

/** 把 ESM 源码装成一颗可调用的模块（只支持本文件用到的那几种写法） */
function loadGuard(uni) {
	const src = read(FILE.guard)
		.replace(/export\s+const\s+/g, 'const ')
		.replace(/export\s+function\s+/g, 'function ')
		.replace(/export\s+default\s+[\s\S]*?\};\s*$/, '');
	// eslint-disable-next-line no-new-func
	return new Function('uni', src + `
		return { PLUGIN_FLAGS, markSystemConfigReady, isSystemConfigReady, onSystemConfigReady,
			pluginState, pluginInstalled, markPluginMissing, pluginMissing, pluginOfUrl, canRequestPlugin };
	`)(uni);
}

/** A. 三态内核（真跑） */
function checkKernel() {
	const uni = makeUni();
	const g = loadGuard(uni);
	const got = [];

	// ① init 未回包：storage 里就算躺着上一轮的 true，也必须是 null（不许拿旧值判）
	uni.storage.systemConfig = JSON.stringify({ app_isinstall_group_buy: true, app_isinstall_send_friend: true });
	got.push(['未回包不读旧值', g.pluginState('group_buy') === null]);
	got.push(['未回包不许发请求', g.canRequestPlugin('app/group_buy/activity/detail') === false]);

	// ② 回包（markSystemConfigReady）：已装 true / 未装 false
	g.markSystemConfigReady();
	got.push(['回包后已装=true', g.pluginState('group_buy') === true]);
	got.push(['回包后已装可发', g.canRequestPlugin('app/group_buy/activity/detail') === true]);
	uni.storage.systemConfig = JSON.stringify({ app_isinstall_group_buy: false });
	got.push(['flag=false ⇒ false', g.pluginState('group_buy') === false]);
	got.push(['flag=false ⇒ 不发', g.canRequestPlugin('app/group_buy/activity/detail') === false]);

	// ③ 后端说未安装：本会话恒 false，且 storage 里那一枚被翻成 false（旧调用点一起静默）
	uni.storage.systemConfig = JSON.stringify({ app_isinstall_group_buy: true });
	g.markSystemConfigReady();
	g.markPluginMissing('group_buy');
	const flipped = JSON.parse(uni.storage.systemConfig).app_isinstall_group_buy;
	got.push(['mark 后恒 false', g.pluginState('group_buy') === false && g.pluginMissing('group_buy') === true]);
	got.push(['mark 顺手翻 flag', flipped === false]);

	// ④ 地址认插件
	got.push(['地址认插件', g.pluginOfUrl('app/group_buy/activity/detail') === 'group_buy'
		&& g.pluginOfUrl('/app/send_friend/gift/entry') === 'send_friend'
		&& g.pluginOfUrl('course/detail') === '']);

	// ⑤ 事件：未回包时订阅，回包后收到且只收到一次
	const uni2 = makeUni();
	const g2 = loadGuard(uni2);
	let hits = 0;
	g2.onSystemConfigReady(() => { hits++; });
	g2.markSystemConfigReady();
	g2.markSystemConfigReady();
	got.push(['回包广播一次', hits === 1]);

	return got;
}

/** B. 请求层源码形状 */
function checkRequest(src) {
	const pre = src.indexOf('canRequestPlugin(');
	const send = src.indexOf('return request.request(');
	return {
		ok: pre > -1 && send > -1 && pre < send
			&& /Promise\.reject\(\{\s*errMsg:\s*'plugin-not-installed:/.test(src)
			&& /markPluginMissing\(pluginTag\)/.test(src)
			&& /pluginMissingMsg/.test(src) && /!pluginMissingMsg/.test(src)
			&& /statusCode\)\s*===\s*404/.test(src)
			&& /pluginOfUrl/.test(src),
		got: 'pre=' + (pre > -1) + ' beforeSend=' + (pre > -1 && send > pre)
			+ ' 静默reject=' + /plugin-not-installed:/.test(src)
			+ ' 未装标记=' + /markPluginMissing\(pluginTag\)/.test(src)
			+ ' toast免掉=' + (/pluginMissingMsg/.test(src) && /!pluginMissingMsg/.test(src))
			+ ' 404收口=' + /statusCode\)\s*===\s*404/.test(src),
	};
}

/** C. 组件/页面：三态 + 回包重判，且不再自己读 install flag 决定发不发请求 */
function checkConsumer(src, tag) {
	const noDirectFlag = !new RegExp("systemConfig\\(['\"]app_isinstall_" + tag + "['\"]\\)").test(src);
	const hasState = new RegExp("pluginState\\('" + tag + "'\\)").test(src);
	const hasReady = /onSystemConfigReady\(/.test(src) && /plugin-guard/.test(src);
	return {
		ok: noDirectFlag && hasState && hasReady,
		got: '直接读 flag=' + (noDirectFlag ? '无' : '有') + ' pluginState=' + hasState + ' 等回包=' + hasReady,
	};
}

/** C2. 组件额外：请求层拦下的那一档要收入口（`err.plugin`） */
function checkPluginCatch(src) {
	return { ok: /err\s*&&\s*err\.plugin/.test(src), got: 'err.plugin 分支=' + /err\s*&&\s*err\.plugin/.test(src) };
}

/** D. 下单页：三态闸门方法 + 复核那一档收口 */
function checkSubmit(src) {
	const twoTags = /pluginGate\('group_buy',\s*'拼团'\)/.test(src) && /pluginGate\('send_friend',\s*'送好友'\)/.test(src);
	// 等待那一拍（state === null）的两条纪律（2026-10-29：两个插件入口进来都白屏）：
	//  ① **骨架留着**：把 `loading` 关掉会让模板翻到内容那一支、而 `data` 还是空的 ⇒ 整页只剩页脚 = 白屏；
	//     所以 gate 的 null 分支里必须是 `this.loading = true` 而不是 `= false`；
	//  ② **退出分支写全**（硬约束 22）：init 一直不回时 `onSystemConfigReady` 永远不触发，
	//     必须有一只到点撤骨架、说一句原因的兜底计时器（`_gateTimer`），并在 destroyed 里清掉。
	// 判据要是「null 分支里**第一处** `this.loading =` 就是 true」：先写成 false 再在下面某处
	// 补一个 true 也算白屏那一版（负向先行断言挡住中间任何一处 `this.loading =`）
	const waitKeepsSkeleton = /if \(state === null\) \{(?:(?!this\.loading =)[\s\S])*this\.loading = true;/.test(src);
	const hasGateExit = /this\._gateTimer = setTimeout\(/.test(src)
		&& /clearTimeout\(this\._gateTimer\)/.test(src);
	return {
		ok: twoTags && /pluginState\(tag\)/.test(src)
			&& /pluginMissing\('send_friend'\)/.test(src) && /onSystemConfigReady\(/.test(src)
			&& waitKeepsSkeleton && hasGateExit,
		got: '拼团档走 pluginGate=' + /pluginGate\('group_buy',\s*'拼团'\)/.test(src)
			+ ' 送好友档走 pluginGate=' + /pluginGate\('send_friend',\s*'送好友'\)/.test(src)
			+ ' pluginMissing复核=' + /pluginMissing\('send_friend'\)/.test(src)
			+ ' 等待期留骨架=' + waitKeepsSkeleton + ' 兜底退出=' + hasGateExit,
	};
}

/** App.vue：init 成功落库之后才置「本会话已就绪」 */
function checkApp(src) {
	const atStorage = src.indexOf('uni.setStorageSync("systemConfig"');
	const atReady = src.indexOf('markSystemConfigReady()');
	return { ok: atStorage > -1 && atReady > atStorage, got: 'storage=' + atStorage + ' ready=' + atReady };
}

function runPositive() {
	console.log('=== check-plugin-guard（付费插件安装态适配：三态 / 请求层闸门 / 回包重判）===');

	const kernel = checkKernel();
	kernel.forEach(([name, ok]) => assert('A ' + name, ok));

	const req = checkRequest(stripComments(read(FILE.request)));
	assert('B 请求层：插件地址发出前过闸门，未装/未就绪静默拦下；后端说「未安装」不弹全局 toast，404 同档收口', req.ok, req.got);

	assert('C App.vue：`common.init` 成功落库之后才置「本会话已就绪」（失败不置真，不许拿旧 flag 判）', checkApp(stripComments(read(FILE.app))).ok, checkApp(stripComments(read(FILE.app))).got);

	[['拼团区', FILE.gbArea, 'group_buy'], ['送好友区', FILE.sfArea, 'send_friend']].forEach(([label, file, tag]) => {
		const r = checkConsumer(stripComments(read(file)), tag);
		assert('C ' + label + '只吃三态 `pluginState(\'' + tag + '\')` 并挂 init 回包重判（不再自己读 flag 决定发不发请求）', r.ok, r.got);
	});
	['拼团区', '送好友区'].forEach((label, i) => {
		const file = i === 0 ? FILE.gbArea : FILE.sfArea;
		const r = checkPluginCatch(stripComments(read(file)));
		assert('C ' + label + '：请求层拦下的「未装/未就绪」那一档收入口（不弹网络错误）', r.ok, r.got);
	});

	[['我的拼团', FILE.gbIndex, 'group_buy'], ['拼团详情', FILE.gbDetail, 'group_buy'],
		['赠送记录', FILE.sfGift, 'send_friend'], ['送礼页', FILE.sfSend, 'send_friend'], ['领取页', FILE.sfReceive, 'send_friend']].forEach(([label, file, tag]) => {
		const r = checkConsumer(stripComments(read(file)), tag);
		assert('C ' + label + '：深链首屏按三态判，init 未回包先等（不误报「未安装」、不发请求）', r.ok, r.got);
	});

	const sub = checkSubmit(stripComments(read(FILE.submit)));
	assert('D 下单页：拼团/送好友两条建单入口都走 `pluginGate()` 三态；送礼复核读到「未安装」时就地拦住', sub.ok, sub.got);

	console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
		: '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
	process.exitCode = fail === 0 ? 0 : 1;
}

function selftest() {
	console.log('=== --selftest：反例必须被同一组判据抓红 ===');
	let fired = 0;
	const expect = (name, ok, got) => {
		if (ok) { console.log('[SELFTEST-FAIL] ' + name + ' 没被抓到（门禁是瞎的）-> ' + got); fail++; }
		else { fired++; console.log('[SELFTEST-FIRE] ' + name + ' 已报红 -> ' + got); pass++; }
	};

	const req = stripComments(read(FILE.request));
	expect('反例 1：请求层把插件闸门摘掉', checkRequest(req.replace(/if \(pluginTag && !canRequestPlugin\(api\.url\)\) \{/, 'if (false) {')).ok,
		checkRequest(req.replace(/if \(pluginTag && !canRequestPlugin\(api\.url\)\) \{/, 'if (false) {')).got);
	expect('反例 2：后端「未安装」又弹回全局 toast', checkRequest(req.replace(/if \(!pluginMissingMsg\r?\n/, 'if (true\n')).ok,
		checkRequest(req.replace(/if \(!pluginMissingMsg\r?\n/, 'if (true\n')).got);

	const app = stripComments(read(FILE.app));
	// 「在落库之前先置就绪」= 把那一行提到文件最前（判据只看先后，位置一换就该红）
	const badApp = 'markSystemConfigReady();\n' + app;
	expect('反例 3：App.vue 在落库之前就置就绪', checkApp(badApp).ok, checkApp(badApp).got);

	const gbArea = stripComments(read(FILE.gbArea));
	expect('反例 4：拼团区退回直接读 install flag 决定发不发请求',
		checkConsumer(gbArea.replace("pluginState('group_buy')", "($tools.systemConfig('app_isinstall_group_buy') ? true : false)"), 'group_buy').ok,
		checkConsumer(gbArea.replace("pluginState('group_buy')", "($tools.systemConfig('app_isinstall_group_buy') ? true : false)"), 'group_buy').got);

	const sf = stripComments(read(FILE.sfArea));
	expect('反例 5：送好友区把「等 init 回包」那一枚摘掉（入口永远补不回来）',
		checkConsumer(sf.replace(/this\._offInstallReady = onSystemConfigReady\(\(\) => this\.checkInstall\(\)\);/, ''), 'send_friend').ok,
		checkConsumer(sf.replace(/this\._offInstallReady = onSystemConfigReady\(\(\) => this\.checkInstall\(\)\);/, ''), 'send_friend').got);

	const sub = stripComments(read(FILE.submit));
	const badSub = sub.replace(/that\.pluginGate\('group_buy', '拼团'\)/, "that.$tools.systemConfig('app_isinstall_group_buy')");
	expect('反例 6：下单页拼团档退回直接读 flag', checkSubmit(badSub).ok, checkSubmit(badSub).got);

	// 反例 6b/6c：等待那一拍把「留骨架」改回关骨架（= 白屏那一版）/ 把兜底退出计时器摘掉（= 永久骨架）
	const badSub2 = sub.replace(/if \(state === null\) \{\r?\n/, 'if (state === null) {\n                    this.loading = false;\n');
	expect('反例 6b：下单页等待 init 那一拍又把骨架关掉（整页只剩页脚 = 白屏）', checkSubmit(badSub2).ok, checkSubmit(badSub2).got);
	const badSub3 = sub.replace(/this\._gateTimer = setTimeout\(/, 'void (');
	expect('反例 6c：下单页闸门没有兜底退出计时器（init 不回 = 永久骨架）', checkSubmit(badSub3).ok, checkSubmit(badSub3).got);

	// 内核反例：把「未回包回 null」改成「未回包读 storage」——必须被抓到
	const uni = makeUni();
	uni.storage.systemConfig = JSON.stringify({ app_isinstall_group_buy: true });
	const src = read(FILE.guard).replace('if (!sessionReady) { return null; }', 'if (false) { return null; }');
	const g = (() => {
		const code = src.replace(/export\s+const\s+/g, 'const ').replace(/export\s+function\s+/g, 'function ')
			.replace(/export\s+default\s+[\s\S]*?\};\s*$/, '');
		// eslint-disable-next-line no-new-func
		return new Function('uni', code + '\nreturn { pluginState };')(uni);
	})();
	expect('反例 7：未回包就拿上一轮 storage 的 flag 判', g.pluginState('group_buy') === null,
		'未回包时 pluginState=' + JSON.stringify(g.pluginState('group_buy')));

	console.log('\n[SELFTEST] 反例 ' + fired + ' 条被抓红（要求 ≥6）；总通过 ' + pass + ' / 失败 ' + fail);
	process.exitCode = fail === 0 && fired >= 6 ? 0 : 1;
}

if (process.argv.indexOf('--selftest') > -1) { selftest(); } else { runPositive(); }
