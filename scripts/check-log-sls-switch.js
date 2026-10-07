/**
 * 日志上云的端上切档接线（硬约束 5/27 那一族：这一类静态正则看不见，必须脚本实跑）
 *
 * 跑法：
 *   node tuzi-mobile/scripts/check-log-sls-switch.js            正常跑
 *   node tuzi-mobile/scripts/check-log-sls-switch.js --self-test 先用反样本证明每条都抓得到
 *
 * 要钉的是「哪一条走哪一档」这件事，因为它是**跨文件接线**：
 *   判据写在 log-sls.js，调用点在 course.js 与 App.vue，粒度读配置在 log-sls.js、
 *   用配置在 course.js 的桶里，直播例外写在 course.js 的另一条路径上。
 * 任何一处漏改，症状都是「切了档没反应」或「切到 SLS 学习时长断了」，
 * 而 sfc-check 只编译模板、ui-audit 只查版式，两套静态门禁都看不见这种接线。
 *
 * 手写门禁不拿注释自证，所以每条都带一个反样本变异（见 SELF_TESTS）：
 * 把源码按变异改坏之后，本门禁必须报 FAIL，否则说明这条正则是摆设。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/**
 * 注释先剥掉：门禁的字串就写在注释里，不剥会拿注释自证。
 * 顺带把换行归一成 LF —— 仓库里这几个源文件是 CRLF，正则里写 \n 匹配不上 \r\n，
 * 那样反样本会「改了等于没改」，自检报出一个假的通过。
 */
const strip = (src) => src
	.replace(/\r\n/g, '\n')
	.replace(/\/\*[\s\S]*?\*\//g, '')
	.replace(/^\s*\/\/.*$/gm, '');

const SRC = {
	sls: 'src/common/utils/log-sls.js',
	course: 'src/common/utils/course.js',
	detail: 'src/pages/course/detail/js.vue',
	live: 'src/pages/course/live/js.vue',
	app: 'src/App.vue',
	// PC 端在同一个仓外，按 ../tuzi-pc 找。切档接线跨两端，拆成两个脚本会让「只改了一端」漏掉
	pcGuard: '../tuzi-pc/src/router/guard/index.ts',
	pcService: '../tuzi-pc/src/utils/log-service.ts',
	pcNavbar: '../tuzi-pc/src/components/navbar/index.vue'
};

const load = () => ({
	sls: strip(read(SRC.sls)),
	course: strip(read(SRC.course)),
	detail: strip(read(SRC.detail)),
	live: strip(read(SRC.live)),
	app: strip(read(SRC.app)),
	pcGuard: strip(read(SRC.pcGuard)),
	pcService: strip(read(SRC.pcService)),
	pcNavbar: strip(read(SRC.pcNavbar))
});

/** 抓某个函数体 */
const fn = (src, sig) => {
	const m = src.match(sig);
	return m ? m[0] : '';
};

/* ------------------------------------------------------------------ *
 * 11 条检查：每条只吃一个源码集合，返回布尔
 * ------------------------------------------------------------------ */
const CHECKS = [
	{
		key: 'channel-eq',
		name: '通道判据用 === aliyun_sls',
		note: (s) => fn(s.sls, /function isSlsMode\(\)\s*\{[\s\S]*?\}/).replace(/\s+/g, ' ').trim(),
		test: (s) => {
			const body = fn(s.sls, /function isSlsMode\(\)\s*\{[\s\S]*?\}/);
			return /===\s*['"]aliyun_sls['"]/.test(body) && !/!==\s*['"]local['"]/.test(s.sls);
		}
	},
	{
		key: 'no-reverse',
		name: '全仓没有反向判据 !== local',
		note: () => '反向判据会让 storage 里没有该键的存量版本全部误判成 SLS 档',
		test: (s) => !/!==\s*['"]local['"]/.test(s.sls + s.course + s.app)
	},
	{
		key: 'granularity-whitelist',
		name: '粒度有白名单校验，非法值回落到 60',
		note: (s) => {
			const body = fn(s.sls, /export function granularity\(\)\s*\{[\s\S]*?\n\}/);
			return body.replace(/\s+/g, ' ').trim() || 'granularity 未找到';
		},
		test: (s) => {
			const body = fn(s.sls, /export function granularity\(\)\s*\{[\s\S]*?\n\}/);
			// 缺省值必须在模块里定义成 60，且函数体确实按白名单过滤后回落到它
			const fallback = /const DEFAULT_GRANULARITY\s*=\s*60\s*;/.test(s.sls);
			return fallback && /GRANULARITY\.indexOf\(/.test(body) && /:\s*DEFAULT_GRANULARITY/.test(body);
		}
	},
	{
		key: 'live-no-granularity',
		name: '直播 intervalSetStudyLog 不读粒度配置',
		note: (s) => fn(s.course, /intervalSetStudyLog\([\s\S]*?\n  \},/).replace(/\s+/g, ' ').trim().slice(0, 110),
		test: (s) => {
			const body = fn(s.course, /intervalSetStudyLog\([\s\S]*?\n  \},/);
			return /intervalSetStudyLog\([\s\S]*?\},\s*5000\s*\)/.test(body) && !/granularity\(\)/.test(body);
		}
	},
	{
		key: 'setlog-bucket',
		name: 'course.js 的 setStudyLog 走汇总桶',
		note: (s) => fn(s.course, /setStudyLog\([\s\S]*?\n  \},/).replace(/\s+/g, ' ').trim().slice(0, 110),
		test: (s) => /setStudyLog\([\s\S]*?pushStudyLog\(/.test(fn(s.course, /setStudyLog\([\s\S]*?\n  \},/))
	},
	{
		key: 'study-sls-no-setlog',
		name: 'SLS 档三处 setLog 一处都不发',
		note: (s) => '实测 ' + (s.course.match(/api\('study\.setLog'/g) || []).length + ' 处上报，全部必须落在 if (!sls.isSlsMode()) 里面',
		// 判据写成「每一处 setLog 前面紧跟通道闸门」而不是「全文至少有 3 个闸门」：
		// 只数闸门的话，把其中一处摘回 SLS 档照样发后端（正是这次被点名的现象），门禁却报绿
		test: (s) => {
			const total = (s.course.match(/api\('study\.setLog'/g) || []).length;
			const guarded = (s.course.match(/if \(!sls\.isSlsMode\(\)\)\s*\{\s*\n\s*api\('study\.setLog'/g) || []).length;
			return total >= 3 && guarded === total;
		}
	},
	{
		key: 'study-detail-user-id',
		name: '学习明细带上 user_id（回流要认人）',
		note: () => '走后端时 user_id 由 $this->auth->id 在服务端定，直连阿里云后没人补这一枚，缺了回流就认不出这段时长算谁的',
		test: (s) => {
			const bucket = fn(s.course, /function flushBucket\([\s\S]*?\n\}/);
			const detail = fn(s.course, /function flushDetailBucket\([\s\S]*?\n\}/);
			return /user_id: studyUserId\(\)/.test(bucket) && /user_id: studyUserId\(\)/.test(detail);
		}
	},
	{
		key: 'detail-timer',
		name: '主课私有定时器调的是 courseLibrary.setStudyLog',
		note: () => 'detail/js.vue 的 5 秒定时器',
		// 必须框在 setStudyLog(){...5000);} 这个方法体里判断：直接全文搜 setStudyLog( 会被
		// 页面里另外几处调用喂饱，把定时器绕开了也照样判过（自检第 5 条抓的就是这个）
		test: (s) => {
			const m = s.detail.match(/setStudyLog\(\)\s*\{[\s\S]*?5000\);/);
			return m ? /courseLibrary\.setStudyLog\(/.test(m[0]) : false;
		}
	},
	{
		key: 'live-timer',
		name: '直播定时器走 course.js 的 intervalSetStudyLog',
		note: () => 'live/js.vue 的启停点',
		test: (s) => /intervalSetStudyLog\(/.test(s.live)
	},
	{
		key: 'detail-pause',
		name: '详情页离开时仍带 pause=1 上报',
		note: (s) => 'onHide 与 onUnload 各一处，实测 ' +
			(s.detail.match(/setStudyLog\([\s\S]{0,160}?,\s*1\s*\)/g) || []).length + ' 处',
		test: (s) => (s.detail.match(/setStudyLog\([\s\S]{0,160}?,\s*1\s*\)/g) || []).length >= 2
	},
	{
		key: 'live-onhide',
		name: '直播页 onHide 补了 flushLiveStudyLog 且在 stopStudyLog 之前',
		note: (s) => fn(s.live, /onHide\(\)\s*\{[\s\S]*?\n  \},/).replace(/\s+/g, ' ').trim().slice(0, 130),
		test: (s) => {
			const body = fn(s.live, /onHide\(\)\s*\{[\s\S]*?\n  \},/);
			return /flushLiveStudyLog\(/.test(body) &&
				body.indexOf('flushLiveStudyLog') < body.indexOf('stopStudyLog');
		}
	},
	{
		key: 'app-pv-direct',
		name: 'App.vue 的 PV 在 SLS 档改直连',
		note: (s) => fn(s.app, /record\(url\)\s*\{[\s\S]*?\n\t\t\t\},/).replace(/\s+/g, ' ').trim().slice(0, 130),
		test: (s) => {
			const body = fn(s.app, /record\(url\)\s*\{[\s\S]*?\n\t\t\t\},/);
			return /isSlsMode\(\)/.test(body) && /biz_type:\s*['"]pv['"]/.test(body);
		}
	},
	{
		key: 'app-no-double',
		name: 'SLS 档直连后不会再打 data.record',
		note: () => '分支内部不许出现 $api，否则同一跳会被记两次',
		// 同样要框在 SLS 分支内部判断：跨分支找 "return false … $api" 会被前面两个
		// 守卫的 return false 喂饱（自检第 10 条抓的就是这个）
		test: (s) => {
			const body = fn(s.app, /record\(url\)\s*\{[\s\S]*?\n\t\t\t\},/);
			const branch = (body.match(/if \(this\.\$sls[\s\S]*?\n\t\t\t\t\}/) || [''])[0];
			return branch !== '' && /return/.test(branch) && !/\$api\(/.test(branch);
		}
	},
	{
		key: 'app-gate-order',
		name: '移动端 PV：访问统计闸门在通道判断之前',
		note: () => '开关管「记不记」、通道管「记到哪」，关掉之后两档都不该有数据',
		test: (s) => {
			const body = fn(s.app, /record\(url\)\s*\{[\s\S]*?\n\t\t\t\},/);
			const gate = body.indexOf('app_statistics_visit_log');
			const channel = body.indexOf('isSlsMode()');
			return gate >= 0 && channel >= 0 && gate < channel;
		}
	},
	{
		key: 'study-gate-order',
		name: '移动端 学习：学习时长闸门在汇总桶之前',
		note: () => '关掉学习时长统计时不该再攒桶',
		test: (s) => {
			const body = fn(s.course, /setStudyLog\([\s\S]*?\n  \},/);
			const gate = body.indexOf('app_statistics_study_log');
			const bucket = body.indexOf('pushStudyLog(');
			return gate >= 0 && bucket >= 0 && gate < bucket;
		}
	},
	{
		key: 'pc-gate-order',
		name: 'PC 端 路由守卫：访问统计闸门在通道判断之前',
		note: (s) => fn(s.pcGuard, /setupVisitRecordGuard\([\s\S]*?\n\}/).replace(/\s+/g, ' ').trim().slice(0, 130),
		test: (s) => {
			const body = fn(s.pcGuard, /setupVisitRecordGuard\([\s\S]*?\n\}/);
			const gate = body.indexOf('isVisitLogOn()');
			const channel = body.indexOf('isSlsMode()');
			return gate >= 0 && channel >= 0 && gate < channel;
		}
	},
	{
		key: 'pc-sendpv-gate',
		name: 'PC 端 sendPv 自己也有访问统计闸门',
		note: () => 'SLS 档 PC 不打后端了，Record::log 那层早退兜不住',
		test: (s) => {
			const body = fn(s.pcService, /export function sendPv\([\s\S]*?\n\}/);
			return /isVisitLogOn\(\)/.test(body);
		}
	},
	{
		key: 'pc-navbar-visitlog',
		name: 'PC 端 navbar 把 visit_log 一起传下去',
		note: () => '不下发这个键，PC 守卫永远读到默认值「开」',
		test: (s) => /setLogConfig\([^)]*visit_log/.test(s.pcNavbar)
	},
	{
		key: 'live-detail-bucket',
		name: '直播 intervalSetStudyLog 同时喂明细桶',
		note: () => '聚合腿固定 5 秒是为了在线人数的时间分辨率，明细按粒度攒 —— 两件事都要有',
		test: (s) => /intervalSetStudyLog\([\s\S]*?pushDetailLog\(/.test(fn(s.course, /intervalSetStudyLog\([\s\S]*?\n  \},/))
	},
	{
		key: 'live-deactivated',
		name: '直播页 onHide 与 deactivated 都补了最后一枪',
		note: (s) => 'deactivated（组件停用）也走同一条，否则停用后最后一段明细留在桶里',
		test: (s) => /deactivated\(\)\s*\{[\s\S]*?flushLiveStudyLog\(/.test(s.live)
	},
	{
		key: 'app-endpoint-config',
		name: '移动端 上报地址读后台配置、缺任一项就不发',
		note: (s) => ['app_statistics_sls_project', 'app_statistics_sls_host', 'app_statistics_sls_logstore']
			.filter((k) => s.sls.includes(k)).length + '/3 项已接配置；缺项时 buildUrl 返回空',
		test: (s) => ['app_statistics_sls_project', 'app_statistics_sls_host', 'app_statistics_sls_logstore']
			.every((k) => s.sls.includes(k)) &&
			/if \(!project \|\| !host \|\| !logstore\) \{\s*return '';/.test(s.sls.replace(/\r\n/g, '\n'))
	},
	{
		key: 'pc-endpoint-config',
		name: 'PC 端 上报地址由 navbar 下发、缺任一项就不发',
		note: (s) => ['sls_project', 'sls_host', 'sls_logstore'].filter((k) => s.pcNavbar.includes(k)).length + '/3 项已接线',
		test: (s) => ['sls_project', 'sls_host', 'sls_logstore'].every((k) => s.pcNavbar.includes(k)) &&
			/function hasEndpoint\(\)[\s\S]*?!!project && !!host && !!logstore/.test(s.pcService) &&
			/!hasEndpoint\(\)/.test(fn(s.pcService, /export function sendPv\([\s\S]*?\n\}/))
	},
	{
		key: 'no-hardcoded-endpoint',
		name: '前端不出现任何具体的日志服务账号标识',
		note: () => '标准化产品里写死任何一组 project/host/logstore，都会（a）让拿到包的人读到发布方的账号结构 （b）让忘配的商家把数据写进发布方的 logstore',
		test: (s) => {
			const leak = [];
			const scan = (src, label) => {
				if (/log\.aliyuncs\.com/.test(src)) leak.push(label + ' 含阿里云地域 endpoint');
				if (/[a-z0-9-]+\.log(Store|store)\b/.test(src)) leak.push(label + ' 含写死的 logstore 名');
				if (/(project|logstore|host)\s*=\s*'[^']+'/i.test(src)) leak.push(label + ' 有字符串字面量赋值');
			};
			scan(s.sls, 'mobile log-sls.js');
			scan(s.pcService, 'pc log-service.ts');
			return leak.length === 0;
		}
	},
	{
		key: 'pc-sendpv-endpoint',
		name: 'PC 端 sendPv 用的是下发的地址，不是写死常量',
		note: () => '写死常量的话，后台改地址 PC 仍往老 logstore 写',
		test: (s) => {
			const body = fn(s.pcService, /export function sendPv\([\s\S]*?\n\}/);
			return /'https:\/\/' \+ project \+ '\.' \+ host/.test(body) && !/\+ PROJECT \+/.test(body);
		}
	},
	{
		key: 'endpoint-fallback-local',
		name: '地址没配齐时两端都退回本地档，不静默丢明细',
		note: () => '商家把通道拨到 aliyun_sls 却漏填 project/host/logstore 时，isSlsMode() 仍判真 ⇒ 端上既不发也不打后端，PV 与学习明细整段静默消失；判据必须同时要求地址齐',
		test: (s) => {
			const mobile = fn(s.sls, /export function isSlsMode\(\)[^{]*\{[\s\S]*?\n\}/);
			const pc = fn(s.pcService, /export function isSlsMode\(\)[^{]*\{[\s\S]*?\n\}/);
			return /===\s*['"]aliyun_sls['"]\s*&&\s*hasEndpoint\(\)/.test(mobile)
				&& /===\s*['"]aliyun_sls['"]\s*&&\s*hasEndpoint\(\)/.test(pc);
		}
	},
	{
		key: 'get-track-no-beacon',
		name: '两端口直连都走匿名 GET，且没有 navigator.sendBeacon',
		note: () => 'WebTracking 的字段全挂在 query 上，而 sendBeacon 只会 POST ⇒ 阿里云收到的是空 body 的 POST、一条都进不了库；更要命的是它只要「入队」就返回 true，后面任何兜底都跑不到，症状是「埋点在发、后台一条都查不到」',
		test: (s) => {
			const dispatch = fn(s.sls, /function dispatch\([\s\S]*?\n\}/);
			const sendPv = fn(s.pcService, /export function sendPv\([\s\S]*?\n\}/);
			const noBeacon = !/sendBeacon/.test(s.sls) && !/sendBeacon/.test(s.pcService);
			return noBeacon
				&& /\/track\?/.test(s.sls) && /APIVersion=/.test(s.sls)
				&& /\/track\?APIVersion=/.test(s.pcService)
				&& /fetch\(url, \{ method: 'GET', mode: 'no-cors', keepalive: true \}\)/.test(dispatch)
				&& /fetch\(target, \{ method: 'GET', mode: 'no-cors', keepalive: true \}\)/.test(sendPv);
		}
	}
];

/* ------------------------------------------------------------------ *
 * 反样本：每条把源码改坏成「最可能真的犯的错」，门禁必须因此报 FAIL
 * ------------------------------------------------------------------ */
const SELF_TESTS = [
	{ key: 'channel-eq', what: '把 === aliyun_sls 写成 !== local', mutate: (s) => ({ ...s, sls: s.sls.replace(/===\s*'aliyun_sls'/, "!== 'local'") }) },
	{ key: 'no-reverse', what: '在别处引入反向判据', mutate: (s) => ({ ...s, course: s.course + "\n// !== 'local'\n" }) },
	{ key: 'granularity-whitelist', what: '把默认回落改成 5 秒并去掉白名单', mutate: (s) => ({ ...s, sls: s.sls.replace(/const DEFAULT_GRANULARITY = 60;/, 'const DEFAULT_GRANULARITY = 5;').replace(/GRANULARITY.indexOf(g) >= 0 ? g : DEFAULT_GRANULARITY/, 'g') }) },
	{ key: 'live-no-granularity', what: '直播也去读粒度', mutate: (s) => ({ ...s, course: s.course.replace(/(intervalSetStudyLog[\s\S]*?)\n  \},/, '$1\n      sls.granularity();\n  },') }) },
	{ key: 'setlog-bucket', what: 'setStudyLog 不再走汇总桶', mutate: (s) => ({ ...s, course: s.course.replace('pushStudyLog(courseId, columnId, currentTime, pause);', 'api("study.setLog", { course_id: courseId });') }) },
	{ key: 'study-sls-no-setlog', what: '把汇总桶那一处的通道闸门摘掉（开了 SLS 还在打 setLog）', mutate: (s) => ({ ...s, course: s.course.replace(/if \(!sls\.isSlsMode\(\)\)\s*\{\s*\n(\s*)(api\('study\.setLog')/, '$1$2') }) },
	{ key: 'study-sls-no-setlog', what: '直连的同时又补打一次后端（同一桶记两遍）', mutate: (s) => ({ ...s, course: s.course.replace("sls.send({\n    biz_type: 'study',", "api('study.setLog', { course_id: courseId });\n  sls.send({\n    biz_type: 'study',") }) },
	{ key: 'study-detail-user-id', what: '明细里不再带 user_id', mutate: (s) => ({ ...s, course: s.course.replace(/user_id: studyUserId\(\),\n/g, '') }) },
	{ key: 'detail-timer', what: '主课私有定时器绕开 courseLibrary', mutate: (s) => ({ ...s, detail: s.detail.replace(/this\.studyTimer = setInterval\([\s\S]*?courseLibrary\.setStudyLog\(/, 'this.studyTimer = setInterval(function(){ report();') }) },
	{ key: 'live-timer', what: '直播不再走 intervalSetStudyLog', mutate: (s) => ({ ...s, live: s.live.replace(/intervalSetStudyLog\(/g, 'noopStart(') }) },
	{ key: 'detail-pause', what: '去掉离开时的 pause=1', mutate: (s) => ({ ...s, detail: s.detail.replace(/(setStudyLog\([\s\S]{0,160}?),\s*1\s*\)/g, '$1, 0)') }) },
	{ key: 'live-onhide', what: '把补枪挪到 stopStudyLog 之后', mutate: (s) => ({ ...s, live: s.live.replace(/(courseLibrary\.flushLiveStudyLog\([^;]*\);)([\s\S]*?courseLibrary\.stopStudyLog\(\);)/, '$2$1') }) },
	{ key: 'app-pv-direct', what: 'PV 不判通道', mutate: (s) => ({ ...s, app: s.app.replace('if (this.$sls && this.$sls.isSlsMode()) {', 'if (false) {') }) },
	{ key: 'app-no-double', what: '直连的同时又打了一次后端（同一跳记两次）', mutate: (s) => ({ ...s, app: s.app.replace('this.$sls.send({', 'this.$api("data.record", { url: url });\n\t\t\t\t\tthis.$sls.send({') }) },
	{ key: 'app-gate-order', what: '以为后端会兜，把移动端访问统计闸门整个删掉', mutate: (s) => ({ ...s, app: s.app.replace(/\n\s*if \(this\.\$tools && this\.\$tools\.systemConfig\("app_statistics_visit_log"\) == '0'\) \{\n\s*return false;\n\s*\}/, '') }) },
	{ key: 'study-gate-order', what: '去掉移动端学习时长闸门', mutate: (s) => ({ ...s, course: s.course.replace(/\n\s*if \(tools\.systemConfig\("app_statistics_study_log"\) == '0'\) \{\n\s*return;\n\s*\}/, '') }) },
	{ key: 'pc-gate-order', what: 'PC 守卫去掉访问统计闸门', mutate: (s) => ({ ...s, pcGuard: s.pcGuard.replace(/\n\s*if \(!isVisitLogOn\(\)\) \{\n\s*return;\n\s*\}/, '') }) },
	{ key: 'pc-sendpv-gate', what: 'PC sendPv 去掉访问统计闸门', mutate: (s) => ({ ...s, pcService: s.pcService.replace('!isVisitLogOn() || ', '') }) },
	{ key: 'pc-navbar-visitlog', what: 'PC navbar 不再下发 visit_log', mutate: (s) => ({ ...s, pcNavbar: s.pcNavbar.replace(/\n\s*this\.data && this\.data\.visit_log,/, '') }) },
	{ key: 'app-endpoint-config', what: '移动端去掉「缺项就不发」的闸门（会往空地址发）', mutate: (s) => ({ ...s, sls: s.sls.replace(/if \(!project \|\| !host \|\| !logstore\) \{\n\t\treturn '';\n\t\}/, '') }) },
	{ key: 'pc-endpoint-config', what: 'PC sendPv 去掉 hasEndpoint 闸门', mutate: (s) => ({ ...s, pcService: s.pcService.replace('!hasEndpoint() || ', '') }) },
	{ key: 'no-hardcoded-endpoint', what: '把发布方的 logstore 名写回移动端源码', mutate: (s) => ({ ...s, sls: s.sls + "\nconst DEFAULT_LOGSTORE = 'tuzhi-selfbuild-logstore';\n" }) },
	{ key: 'no-hardcoded-endpoint', what: '把阿里云地域 endpoint 写回 PC 源码', mutate: (s) => ({ ...s, pcService: s.pcService + "\nconst HOST = 'cn-hangzhou.log.aliyuncs.com';\n" }) },
	{ key: 'pc-endpoint-config', what: 'PC navbar 少下发一个地址项', mutate: (s) => ({ ...s, pcNavbar: s.pcNavbar.replace(/,\n\s*this\.data && this\.data\.sls_logstore/, '') }) },
	{ key: 'pc-sendpv-endpoint', what: 'PC sendPv 改回写死常量', mutate: (s) => ({ ...s, pcService: s.pcService.replace("'https://' + project + '.' + host", "'https://' + 'example' + '.' + 'aliyuncs.com'") }) },
	{ key: 'live-detail-bucket', what: '直播不再喂明细桶（明细丢失、对账对不上）', mutate: (s) => ({ ...s, course: s.course.replace(/pushDetailLog\(courseId, columnId, currentTime\);/, '') }) },
	{ key: 'live-deactivated', what: '直播页 deactivated 不再补枪', mutate: (s) => ({ ...s, live: s.live.replace(/(deactivated\(\) \{[\s\S]*?)courseLibrary\.flushLiveStudyLog\([^;]*\);\n/, '$1') }) },
	{ key: 'get-track-no-beacon', what: '移动端改回 sendBeacon（初稿就是这么写的，实际一条都进不了库）', mutate: (s) => ({ ...s, sls: s.sls.replace(/fetch\(url, \{ method: 'GET', mode: 'no-cors', keepalive: true \}\)/, "navigator.sendBeacon(url, '')") }) },
	{ key: 'get-track-no-beacon', what: 'PC 端改回 sendBeacon', mutate: (s) => ({ ...s, pcService: s.pcService.replace(/fetch\(target, \{ method: 'GET', mode: 'no-cors', keepalive: true \}\)/, "navigator.sendBeacon(target, '')") }) },
	{ key: 'get-track-no-beacon', what: '移动端去掉 GET 形态（只留 mode 不设 method，跨源默认仍是 GET 但读不出意图）', mutate: (s) => ({ ...s, sls: s.sls.replace(/fetch\(url, \{ method: 'GET', mode: 'no-cors', keepalive: true \}\)/, "fetch(url, { mode: 'no-cors' })") }) },
	{ key: 'endpoint-fallback-local', what: '移动端 isSlsMode 不再要求地址齐（漏填地址就把明细整段丢掉）', mutate: (s) => ({ ...s, sls: s.sls.replace(/=== 'aliyun_sls' && hasEndpoint\(\);/, "=== 'aliyun_sls';") }) },
	{ key: 'endpoint-fallback-local', what: 'PC 端 isSlsMode 不再要求地址齐', mutate: (s) => ({ ...s, pcService: s.pcService.replace(/=== 'aliyun_sls' && hasEndpoint\(\);/, "=== 'aliyun_sls';") }) }
];

/* ------------------------------------------------------------------ */

/** 按 key 索引检查项：SELF_TESTS 与 CHECKS 的配对靠名字，不靠手写序号 */
const CHECK_BY_KEY = {};
CHECKS.forEach((c) => { CHECK_BY_KEY[c.key] = c; });
if (Object.keys(CHECK_BY_KEY).length !== CHECKS.length) {
	console.log('[FAIL] 有检查项没写 key，配对会漂移');
	process.exit(1);
}

const selfTestOnly = process.argv.indexOf('--self-test') >= 0;
const src = load();

if (selfTestOnly) {
	let bad = 0;
	SELF_TESTS.forEach((t) => {
		const check = CHECK_BY_KEY[t.key];
		if (!check) {
			console.log(`[FAIL] 反样本「${t.what}」→ CHECKS 里没有 key='${t.key}' 这一条，配对已漂移`);
			bad++;
			return;
		}
		const mutated = t.mutate(src);
		// 先确认变异真的改到了源码。变异没生效时 check.test(mutated) 会等于 test(src)，
		// 报出来的是「正则抓不到」这个**误导性**结论 —— 实测已有三种写法栽在这上面：
		// ① 变异依赖注释，而 strip() 已经把注释剥了 ② 源文件是 CRLF、正则里写 \n
		// ③ 变异加了死代码而没真的挪动位置。所以这一项单独判。
		const changed = Object.keys(mutated).some((k) => mutated[k] !== src[k]);
		const before = check.test(src);
		const after = check.test(mutated);

		let verdict;
		if (!changed) {
			verdict = '变异没生效（改写后的源码与原样相同），这条自检等于没测';
		} else if (before !== true) {
			verdict = '原样源码就没通过，先修代码再说';
		} else if (after !== false) {
			verdict = '本条没抓到，正则是摆设';
		} else {
			verdict = '抓到了';
		}
		const catches = verdict === '抓到了';
		if (!catches) bad++;
		console.log(`${catches ? '[PASS]' : '[FAIL]'} 反样本[${t.key}]「${t.what}」→ ${verdict}`);
	});
	console.log(`\n共 ${SELF_TESTS.length} 条反样本，没验成的 ${bad} 条`);
	process.exit(bad ? 1 : 0);
}

let fail = 0;
CHECKS.forEach((c) => {
	const pass = c.test(src);
	if (!pass) fail++;
	const note = c.note ? c.note(src) : '';
	console.log(`${pass ? '[PASS]' : '[FAIL]'} ${c.name}${note ? ' — ' + note : ''}`);
});
console.log(`\n共 ${CHECKS.length} 条，失败 ${fail} 条`);
console.log('提示：本门禁自身也要自证，抓反样本跑 node tuzi-mobile/scripts/check-log-sls-switch.js --self-test');
process.exit(fail ? 1 : 0);