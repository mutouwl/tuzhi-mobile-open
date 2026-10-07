/**
 * 学员端「昵称公开展示」这一档的机器验法（硬约束 26 / 29③：被点名的这一类必须自带机检，
 * 且机检自身要过负向反向测；口径真源 `.trae/rules/ui-baseline-mobile.md` §1 那一行）。
 *
 * 跑法：node tuzi-mobile/scripts/check-nickname-mask.js
 *
 * 背景（2026-10-03 用户点名「邀请达人榜里的这个用户昵称应该进行敏感化处理，展示第一个字符，
 * 把剩下字符显示成星号」）：同一条规则此前在学员端有**两份逐字相同**的实现，一份在
 * 主包共用工具里、一份是某只直播弹窗页面内的方法。规则是全站的，实现却是各写各的，
 * 于是「改口径时漏掉别人家弹窗」只是时间问题——这才是本次要钉死的东西，
 * 比「达人榜这一处打上了星号」更值得钉（那处另有本域的页面脚本钉着）。
 *
 * 这一族静态正则能判：① 单一真源那份实现的口径字串与空值档；② 全站没有第二份复制品；
 * ③ 三个既有落点都从真源取，不能各带一份；④ 模板里凡出现 nickname 插值的地方都被包住。
 * 「哪些昵称算公开展示要脱敏」是产品口径问题、正则判不出，故那一半落在各页面的脚本里
 * （邀请达人榜见 check-invite-rank-board.js / check-invite-rank-my-invite.js 的脱敏一节）。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/** 注释先剥掉：头注释里就把那一标字符当示例写了出来，不剥的话每一条都会命中注释而不是实现（进反向测试时才发现，手写门禁不拿注释自证） */
const strip = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

/** 主包里那份共用实现 */
const SRC = 'src/common/utils/privacy.js';
/** 脱敏那一个函数的源码 */
const privacy = read(SRC);
const privacyJs = strip(privacy);
/** 星号那一档的字面量：转义后拼出来（供正则用），免得这份脚本自己的注释命中自己那条「不许有复制品」的断言 */
const STAR = "'" + '\\*'.repeat(3) + "'";
/** 那一句拼法本身（`slice(0, 1) + '***'`）只作注释，不再出现在可执行的字面量里 */
const SLICE_AHEAD = 'slice\\(0,\\s*1\\)\\s*\\+\\s*';

const results = [];
const ok = (name, cond, note) => results.push({ name, pass: !!cond, note: note || '' });

/* ---------- 1. 单一真源那一份实现 ---------- */
ok('共用实现在册（主包 utils，跨分包共用）', fs.existsSync(path.join(ROOT, SRC)));
ok('导出的是一个具名函数 maskNickname', /export function maskNickname\s*\(/.test(privacy));
ok('口径是保留首字符、其余三个星号', new RegExp(SLICE_AHEAD + STAR).test(privacyJs));
ok('取不到昵称写「-」，不留空档', /return\s*'-'\s*;/.test(privacyJs));
ok('入参容忍 null / undefined（调用点直接把 prop 丢进来）', /=== null \|\| .*=== undefined/.test(privacyJs));
ok('只留一档：函数只有一个入参（星号数量不给第二档）', (privacyJs.match(/export function maskNickname\s*\(([^)]*)\)/) || ['', ''])[1].split(',').filter(Boolean).length === 1);

/* ---------- 2. 全站没有第二份复制品 ---------- */
/** 学员端 src 全量，工具自己那份排除掉（就是它该有这一句） */
const srcFiles = [];
(function walk(dir) {
	fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).forEach((e) => {
		if (e.name === 'node_modules' || e.name === 'uview-ui') return;
		const rel = dir + '/' + e.name;
		if (e.isDirectory()) return walk(rel);
		if (/\.(vue|js)$/.test(e.name)) srcFiles.push(rel);
	});
})('src');

const copies = srcFiles.filter((rel) => rel !== SRC && new RegExp(SLICE_AHEAD + STAR).test(strip(read(rel))));
ok('学员端没有第二份自己拼星号的实现（口径改一处即全站生效）', copies.length === 0, copies.join(' '));

/** 模板段（模块级 import 在模板里看不见，那一半要靠 §4 的插值断言盯着） */
const tplOf = (src) => src.slice(0, src.indexOf('<script') < 0 ? src.length : src.indexOf('<script'));

/* ---------- 3. 三个既有落点都从真源取 ---------- */
const shareGift = read('src/common/utils/share-gift.js');
const redpacket = read('src/pages/course/live/redpacket/js.vue');
const boardList = read('src/pages/course/live/invite-rank/board-list.vue');
const myInvite = read('src/pages/course/live/invite-rank/my-invite.vue');
const giftDetail = read('src/pages/course/live/share-gift/activity-detail.vue');
const redpacketModal = read('src/pages/course/live/redpacket/redpacket-modal.vue');

ok('共用工具把这份实现原样转出（老调用点的 import 不用改）', /import\s*\{\s*maskNickname\s*\}\s*from\s*'\.\/privacy'/.test(shareGift) && /export\s*\{\s*maskNickname\s*\}/.test(shareGift));
ok('那只直播红包弹窗的页面方法改为转发（方法名留着，模板那一处不用动）', /import\s*\{\s*maskNickname\s*\}\s*from\s*'\@\/common\/utils\/privacy'/.test(redpacket) && /maskName\(name\)\s*\{\s*return maskNickname\(name\);/.test(redpacket));
ok('邀请达人榜的两只弹层组件引用真源', /import\s*\{\s*maskNickname\s*\}\s*from\s*'\@\/common\/utils\/privacy'/.test(boardList) && /import\s*\{\s*maskNickname\s*\}\s*from\s*'\@\/common\/utils\/privacy'/.test(myInvite));
ok('达人榜两只弹层组件的转发口在（模板看不见模块级 import，硬约束 25）', /maskName\(name\)\s*\{\s*return maskNickname\(name\);/.test(strip(boardList)) && /maskName\(name\)\s*\{\s*return maskNickname\(name\);/.test(strip(myInvite)));
ok('分享有礼那只的方法体也吃真源（同名转发，不自带实现）', /mask\(name\)\s*\{\s*return maskNickname\(name\);/.test(strip(giftDetail)));
ok('那只红包弹窗的模板插值过页面方法 maskName（方法体在 js.vue，已由上一条转发）', /\{\{\s*maskName\(item\.nickname\)\s*\}\}/.test(tplOf(redpacketModal)));

/* ---------- 4. 模板里凡是昵称插值，都过了脱敏 ---------- */
const rawHits = [];
[['src/pages/course/live/invite-rank/board-list.vue', boardList],
	['src/pages/course/live/invite-rank/my-invite.vue', myInvite],
	['src/pages/course/live/share-gift/activity-detail.vue', giftDetail],
	['src/pages/course/live/redpacket/redpacket-modal.vue', redpacketModal],
].forEach(([rel, src]) => {
	const t = tplOf(src);
	(t.match(/\{\{[^}]*nickname[^}]*\}\}/g) || []).forEach((frag) => {
		if (!/mask/i.test(frag)) rawHits.push(rel + ' → ' + frag.trim());
	});
});
ok('四处落点的模板里没有裸昵称插值', rawHits.length === 0, rawHits.join(' | '));

let fail = 0;
results.forEach((r) => {
	if (!r.pass) fail++;
	console.log(`${r.pass ? '[PASS]' : '[FAIL]'} ${r.name}${r.note ? ' — ' + r.note : ''}`);
});
console.log(`\n共 ${results.length} 条，失败 ${fail} 条`);
process.exit(fail ? 1 : 0);