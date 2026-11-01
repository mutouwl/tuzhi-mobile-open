/**
 * M-P9 送礼页（pages/app/send_friend/send）—— 不构建、不开浏览器
 *
 * 2026-10-28 用户五条点名的机器化版本：
 *  ① 三步条复用提交订单页那一根（`components/tz/sf-steps.vue`；本页 `active=2`，
 *     下单页 `active=1`）—— 同一枚 UI 只留一份实现，几何口径（M57 三角按整组居中）随组件走；
 *  ② **不做「写下专属寄语」**：参考页那块输入区整块不落（模板/脚本/样式三处零残留）；
 *  ③ 「礼物已备好」那一块在剩余空间里垂直居中（页面竖排 flex + 正文 `flex:1` + `justify-content:center`）；
 *  ④ 【自己使用】只看后端 `self_usable`（购买人 ∧ 待赠送 ∧ 未永久拥有），
 *     **点下去先弹一次确认**（2026-10-28 用户点名「避免误触」：自用不可逆，照 M63），
 *     确认后才调 `gift/selfUse`，成功 → toast + `redirectTo` 商品详情（关掉当前页）；
 *  ⑤ 页尾与同模块两页同一档；未装/未登录/非本人三档都不发那条必然失败的请求。
 *
 * 用法：node tuzi-mobile/scripts/check-send-friend-send.js            # 验真件
 *       node tuzi-mobile/scripts/check-send-friend-send.js --selftest # 验这道门禁「能红」
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const BACKEND = path.resolve(ROOT, '..', 'tuzhi-selfbuilt-backend');
const DIR = path.join(ROOT, 'src/pages/app/send_friend/send');
const VUE = path.join(DIR, 'send.vue');
const JS = path.join(DIR, 'js.vue');
const CSS = path.join(DIR, 'css.css');
// 送礼页与领取页共用的礼盒视觉（2026-10-28 抽出；`.sfs-main` 等在这里）
const SHARED_CSS = path.join(ROOT, 'src/common/styles/send-friend-gift.scss');
const STEPS = path.join(ROOT, 'src/components/tz/sf-steps.vue');
const SUBMIT = path.join(ROOT, 'src/components/order/submit-order.vue');
const PAGES_JSON = path.join(ROOT, 'src/pages.json');
const API_LIST = path.join(ROOT, 'src/common/request/api_list.js');
// 分享卡片文案（H5 链接卡片 + 小程序卡片一处真源）与 `$nav.share` 的落地链接通道
const SHARE_HELPER = path.join(ROOT, 'src/common/utils/send-friend-share.js');
const ROUTER = path.join(ROOT, 'src/common/utils/router.js');
const GIFT_API = path.join(BACKEND, 'application/api/controller/app/send_friend/Gift.php');
const GIFT_MODEL = path.join(BACKEND, 'application/common/model/app/send_friend/Gift.php');
const CLAIM_SERVICE = path.join(BACKEND, 'application/common/library/app/send_friend/ClaimService.php');

let pass = 0;
let fail = 0;
function assert(name, ok, got) {
	if (ok) { pass++; console.log('[PASS] ' + name + (got === undefined ? '' : ' -> ' + got)); }
	else { fail++; console.log('[FAIL] ' + name + (got === undefined ? '' : ' -> ' + got)); }
	return !!ok;
}
const read = (f) => fs.readFileSync(f, 'utf8');
const scriptOf = (f) => (read(f).match(/<script[^>]*>([\s\S]*?)<\/script>/) || [])[1] || '';
function templateText(src) {
	const m = src.match(/<template[^>]*>/);
	if (!m) return '';
	const at = src.indexOf(m[0]);
	const end = src.lastIndexOf('</template>');
	return end <= at ? '' : src.slice(at + m[0].length, end);
}
const templateOf = (f) => templateText(read(f));
const stripComments = (s) => s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/[^\n]*/gm, ' ');

/** ① 路由 + 三步条复用（两处只差 active） */
function checkStepsReuse(tpl, json, submit, steps) {
	const flatTpl = stripComments(tpl);
	const flatSteps = stripComments(steps);
	const flatSubmit = stripComments(submit);
	const route = /"path"\s*:\s*"send_friend\/send\/send"/.test(json);
	const here = /<tz-sf-steps[^>]*:active="2"[^>]*\/>/.test(flatTpl);
	const submitUses = /<tz-sf-steps\s+v-if="isSendFriend"\s+:active="1"\s*\/>/.test(flatSubmit);
	const component = /1\. 购买礼物/.test(flatSteps) && /2\. 赠送好友/.test(flatSteps) && /3\. 好友收礼/.test(flatSteps);
	// M57：容器 center + 三角自身不写 height（两条缺一不可）
	const stepsCss = (flatSteps.match(/\.sf-steps \{[\s\S]*?\}/) || [''])[0];
	const sepCss = (flatSteps.match(/\.sf-step-sep \{[\s\S]*?\}/) || [''])[0];
	const geometry = /align-items:\s*center/.test(stepsCss) && sepCss.length > 0 && !/(^|[\s;{])height\s*:/.test(sepCss);
	// 同一条 UI 不许在页面里再抄一份
	const noCopy = !/class="sf-steps"/.test(flatTpl) && !/class="sf-steps"/.test(flatSubmit);
	// 2026-10-28 用户点名「去掉上面 step 的白色背景」：本页传 transparent（页面底色透上来），
	// 下单页不传、走组件默认 #fff —— 两处只差这一枚 prop，不许在页面里另写一份覆盖
	const bg = /<tz-sf-steps[^>]*bg-color="transparent"/.test(flatTpl)
		&& /bgColor:\s*\{[\s\S]{0,120}?default:\s*'#fff'/.test(flatSteps)
		&& /:style="\{ background: bgColor \}"/.test(flatSteps);
	const ok = route && here && submitUses && component && geometry && noCopy && bg;
	return {
		ok,
		got: '路由=' + route + ' 本页 active=2=' + here + ' 下单页 active=1=' + submitUses
			+ ' 组件三段文案=' + component + ' M57 几何=' + geometry + ' 页面无第二份=' + noCopy
			+ ' 送礼页透明底=' + bg,
	};
}

/** ② 不做「写下专属寄语」：那块输入区在三处都零残留 */
function checkNoMessage(tpl, js, css) {
	const flat = stripComments(tpl) + stripComments(js) + stripComments(css);
	const hits = ['写下专属寄语', '专属寄语', 'textarea', 'maxlength'].filter((k) => flat.indexOf(k) >= 0);
	return { ok: hits.length === 0, got: hits.length ? '仍有：' + hits.join('、') : '模板/脚本/样式三处零残留' };
}

/** ③ 垂直居中：页面竖排 + 正文 flex:1 + justify-content:center */
function checkCenter(css, shared) {
	const flat = stripComments(css) + stripComments(shared === undefined ? read(SHARED_CSS) : shared);
	const page = (flat.match(/\.school-page\.sfs-page \{[\s\S]*?\}/) || [''])[0];
	const main = (flat.match(/\.sfs-main \{[\s\S]*?\}/) || [''])[0];
	const ok = /display:\s*flex/.test(page) && /flex-direction:\s*column/.test(page)
		&& /flex:\s*1/.test(main) && /justify-content:\s*center/.test(main);
	return { ok, got: '页面竖排=' + (/flex-direction:\s*column/.test(page)) + ' 正文 flex:1=' + (/flex:\s*1/.test(main)) + ' 居中=' + (/justify-content:\s*center/.test(main)) };
}

/** ④ 自己使用：判据只吃 self_usable、调 selfUse、成功关页跳详情 */
function checkSelfUse(tpl, js, api) {
	const flatTpl = stripComments(tpl);
	const flatJs = stripComments(js);
	const apiBlock = /selfUse:\s*\{[\s\S]{0,160}?url:\s*['"]app\/send_friend\/gift\/selfUse['"][\s\S]{0,40}?auth:\s*true/.test(api);
	const computed = /selfUsable\(\)\s*\{[\s\S]*?self_usable/.test(flatJs);
	const btn = /v-if="selfUsable"[^>]*>[\s\S]{0,80}?自己使用/.test(flatTpl) || /v-if="selfUsable"[\s\S]{0,120}?自己使用/.test(flatTpl);
	const calls = /\$api\(\s*['"]send_friend\.gift\.selfUse['"]/.test(flatJs);
	const redirect = /goDetail\([^)]*d\.detail_id[^)]*d\.detail_type/.test(flatJs)
		&& /\$nav\.getPagePath\(id, type\)/.test(flatJs)
		&& /'redirectTo'/.test(flatJs);
	// 一页只一处主操作：【自己使用】是文字入口，不能再挂一枚 primary
	// 主操作只一处（M17）：「登录后赠送」是未登录那一支的互斥档，不算第二枚；正文那一支只能有一枚 primary
	const primary = (flatTpl.match(/type="primary"/g) || []).length;
	const loginCta = (flatTpl.match(/type="primary"[\s\S]{0,60}?登录后赠送/g) || []).length;
	const bodyPrimary = primary - loginCta;
	const ok = apiBlock && computed && btn && calls && redirect && bodyPrimary === 1 && loginCta === 1;
	return {
		ok,
		got: 'API 登记=' + apiBlock + ' 判据=self_usable=' + computed + ' 按钮 v-if=selfUsable=' + btn
			+ ' 调 selfUse=' + calls + ' 成功 redirectTo 详情=' + redirect + ' 正文 primary=' + bodyPrimary + ' 登录档=' + loginCta,
	};
}

/** ④b 【自己使用】不可逆 ⇒ 点下去先确认（2026-10-28 用户点名「最好有个确认框，避免误触」）：
 *  · 模板挂的是 `useSelf`，不是 `doSelfUse`（绕过确认＝误触照样把礼单用掉）；
 *  · `useSelf` 用原生 `uni.showModal`（M18 的「确认一律原生弹窗」口径），带 `content` 说清后果
 *    + `confirmText` / `cancelText`（小程序端上限 4 个汉字）；
 *  · `success` 里判 `res.confirm`，取消支就地 return（不置 `using`、不发请求）；
 *  · 真正的请求与 `using` 置位只在 `doSelfUse` 里，且只由确认支调一次。 */
function checkSelfUseConfirm(tpl, js) {
	const flatTpl = stripComments(tpl);
	const flatJs = stripComments(js);
	const bound = /@click="useSelf"/.test(flatTpl);
	const bypass = /@click="doSelfUse"/.test(flatTpl);
	// 方法体按「下一个方法名」切，避免在大文件里数括号（两个方法紧邻，顺序固定）
	const useAt = flatJs.indexOf('useSelf() {');
	const doAt = flatJs.indexOf('doSelfUse() {');
	const useBody = useAt >= 0 && doAt > useAt ? flatJs.slice(useAt, doAt) : '';
	const modal = /uni\.showModal\(\{/.test(useBody)
		&& /content:\s*'[^']*确认[^']*'/.test(useBody)
		&& /confirmText:\s*'[^']{1,4}'/.test(useBody)
		&& /cancelText:\s*'[^']{1,4}'/.test(useBody);
	const guarded = /if\s*\(!res\.confirm\)\s*\{\s*return;\s*\}/.test(useBody)
		&& /this\.doSelfUse\(\)/.test(useBody);
	// 确认前不许发请求（发出去的这一支就绕过了确认框）
	const noEarlyCall = !/\$api\(\s*['"]send_friend\.gift\.selfUse['"]/.test(useBody);
	const doBody = doAt >= 0 ? flatJs.slice(doAt) : '';
	const real = /this\.using = true/.test(doBody)
		&& /\$api\(\s*['"]send_friend\.gift\.selfUse['"]/.test(doBody);
	const ok = bound && !bypass && modal && guarded && noEarlyCall && real;
	return {
		ok,
		got: '模板挂 useSelf=' + bound + ' 无绕过=' + !bypass + ' 原生确认框三件=' + modal
			+ ' 只认 confirm=' + guarded + ' 确认前不发请求=' + noEarlyCall + ' 请求在 doSelfUse=' + real,
	};
}

/** ⑤ 三档闸门 + 页尾 + 骨架 */
function checkShell(tpl, js) {
	const flatTpl = stripComments(tpl);
	const flatJs = stripComments(js);
	const guard = /pluginState\('send_friend'\)/.test(flatJs) && /onSystemConfigReady\(/.test(flatJs);
	const login = /登录后可赠送礼物/.test(flatJs) && /needLogin/.test(flatJs);
	const notGiver = /不能在这里赠送/.test(flatJs);
	const tail = /<tz-tab-bar\b/.test(flatTpl) && /<tz-footer\b/.test(flatTpl);
	const sk = /<tz-course-mini[^>]*:skeleton="true"/.test(flatTpl) && /sfs-hero/.test(flatTpl);
	const noSpinner = !/<u-loading-page|<tz-loading-page|<u-loading-icon/.test(flatTpl);
	const ok = guard && login && notGiver && tail && sk && noSpinner;
	return {
		ok,
		got: '三态闸门=' + guard + ' 未登录=' + login + ' 非本人=' + notGiver + ' 页尾两枚=' + tail
			+ ' 骨架=' + sk + ' 无转圈=' + noSpinner,
	};
}

/** ⑥ 礼单卡片走 tz-course-mini + qty（×1），不摆购买价；**卡片可点、带 id/type 跳商品详情**
 *  （2026-10-28 用户点名「在送好友详情点击商品再跳商品详情」；赠送记录里那张卡反过来是 clickable=false） */
function checkCard(js) {
	const flat = stripComments(js);
	const mini = /qty:\s*1/.test(flat);
	const noPrice = !/pay_type:\s*'pay'/.test(flat) && !/price:\s*[a-z]/i.test(flat);
	const tpl = stripComments(templateOf(VUE));
	const clickable = !/:clickable="false"/.test(tpl);
	const hasIdType = /id:\s*Number\(d\.goods_id\)/.test(flat) && /type:\s*courseType \|\| giftType/.test(flat);
	const ok = mini && noPrice && clickable && hasIdType;
	return { ok, got: 'qty=1=' + mini + ' 不摆购买价=' + noPrice + ' 卡片可点=' + clickable + ' id/type 在位=' + hasIdType };
}

/** ⑦ 后端：selfUse 端点 + 判据跳自领 + 回体带详情两枚（2026-10-28 起判据/回体收在 ClaimService） */
function checkBackend(api, model, service) {
	const flatApi = stripComments(api);
	const flatModel = stripComments(model);
	const flatSvc = stripComments(service);
	const method = /public function selfUse\(/.test(flatApi) && /ClaimService::selfUse\(/.test(flatApi);
	const allow = /claimBlockReason\(\$gift, \$userId, true\)/.test(flatSvc)
		&& /function claimBlockReason\(array \$gift, \$userId = 0, \$allowSelf = false\)/.test(flatModel);
	const payload = /function payload\(/.test(flatSvc)
		&& /'detail_type'\s*=>/.test(flatSvc) && /'detail_id'\s*=>/.test(flatSvc);
	const both = /public static function receive\(/.test(flatSvc) && /public static function selfUse\(/.test(flatSvc)
		&& (flatSvc.match(/self::payload\(\$gift, \$ret,/g) || []).length >= 2;
	const ok = method && allow && payload && both;
	return { ok, got: 'selfUse=' + method + ' 判据放行自领=' + allow + ' 回体详情=' + payload + ' receive/selfUse 同源=' + both };
}

/** ⑧ 已领取 / 已失效那一档（2026-10-28 用户给的参考图）：
 *  · 三步条只在待赠送出（终局用「礼物已领取」大标题接替）；
 *  · 大标题 = 「礼物」+ 后端 status_label（不写第二份枚举）；
 *  · 白卡「已领取」+ 一行「头像 / 昵称 / 领取了你的赠送 / 领取日期」，昵称与日期都吃后端；
 *  · 已失效同构白卡只给一句原因。 */
function checkClaimedState(tpl, js, api) {
	const flatTpl = stripComments(tpl);
	const flatJs = stripComments(js);
	const stepsPending = /<tz-sf-steps\s+v-if="[^"]*status === 0"/.test(flatTpl);
	const title = /class="sfs-result-title"[^>]*v-if="status !== 0"/.test(flatTpl)
		&& /resultTitle\(\)[\s\S]*?'礼物' \+ label/.test(flatJs);
	const card = /class="sfs-claim-card"/.test(flatTpl)
		&& /领取了你的赠送/.test(flatTpl)
		&& /receiver_name/.test(flatJs) && /receiver_avatar/.test(flatJs)
		&& /claimed_at_date/.test(flatJs) && /void_reason/.test(flatJs);
	const backend = /'receiver_name'\s*=>/.test(api) && /'receiver_avatar'\s*=>/.test(api)
		&& /'claimed_at_date'\s*=>/.test(api) && /'void_reason'\s*=>/.test(api);
	const ok = stepsPending && title && card && backend;
	return {
		ok,
		got: '三步条只在待赠送=' + stepsPending + ' 大标题=礼物+status_label=' + title
			+ ' 已领取白卡/字段=' + card + ' 后端四枚=' + backend,
	};
}

/** ⑨ 页面底色回全站默认（2026-10-28 用户先点名领取页、再点名这一页「背景色恢复为默认」）：
 *  `.school-page.sfs-page` 只留排版（竖轴 + 去底部留白），**不写 background** —— 底色吃
 *  `App.vue` 的 `.school-page` = #f7f8fa；暖米底 #FDF5E4 整族下线（领取页同轮同改，
 *  见 `check-send-friend-receive.js` ⑲）。 */
function checkPageBg(css) {
	const flat = stripComments(css);
	const page = (flat.match(/\.school-page\.sfs-page\s*\{([^}]*)\}/) || ['', null])[1];
	const noBg = page !== null && !/background(-color)?\s*:/i.test(page);
	const layout = page !== null && /display:\s*flex/.test(page) && /flex-direction:\s*column/.test(page)
		&& /padding-bottom:\s*0/.test(page);
	const noWarm = !/#fdf5e4/i.test(flat);
	return {
		ok: noBg && layout && noWarm,
		got: '根双类在=' + (page !== null) + ' 未写背景=' + noBg + ' 排版齐=' + layout
			+ ' 文件内无暖米底=' + noWarm,
	};
}

/** ⑩ 蓝面板上的商品卡补一圈半透明白边（2026-10-28 用户点名「商品卡片右侧文字信息区域是白色的，
 *  在蓝色心意卡片背景下很不协调，最好给商品卡片增加半透的边框过渡一下」）：
 *  `.sfs-gift` 是两页共用的卡槽 —— 内衬 2px + 1px 半透明白描边 + 外圆角 13（卡 10 + 内衬 2 + 描边 1），
 *  卡片本体（`tz-course-mini`）的白底一个值都不动。 */
function checkGiftCardFrame(shared) {
	const flat = stripComments(shared);
	const box = (flat.match(/\.sfs-gift\s*\{([^}]*)\}/) || ['', null])[1];
	const ring = box !== null && /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0?\.\d+\s*\)/i.test(box);
	const inset = box !== null && /padding:\s*2px/.test(box);
	const border = box !== null && /border:\s*1px solid rgba\(/i.test(box);
	const radius = box !== null && /border-radius:\s*13px/.test(box);
	return {
		ok: ring && inset && border && radius,
		got: '卡槽在=' + (box !== null) + ' 半透明白=' + ring + ' 内衬 2px=' + inset
			+ ' 1px 半透明描边=' + border + ' 外圆角 13=' + radius,
	};
}

/** ⑫ H5「···」分享卡片适配送好友（2026-10-28 用户点名「在微信 H5 中发起分享，那么分享的卡片应该
 *  适配送好友相关的文案呀」）：
 *  · 改前这一页只有小程序 `onShareAppMessage`，H5 走全站兜底 ⇒ 卡片是站点名 + 站点 logo，
 *    且落地链接会拼成**送礼页本身**（只有购买人能看，好友点开被「不是你购买的」挡住）；
 *  · 现在：标题「送你一份礼物：商品名」、描述吃后端 `expire_text`、封面吃礼单封面、
 *    落地链接吃后端 `receive_url`（端口不许自己拼地址，硬约束 33）；
 *  · 文案一处真源 `common/utils/send-friend-share.js`，小程序端读同一句（两端不一致最难查）；
 *  · 只在「本人 ∧ 待赠送」那一档配（终局态没有领取链接）。 */
function checkShareCard(js, helper, router, api) {
	const flatJs = stripComments(js);
	const flatHelper = stripComments(helper);
	const flatRouter = stripComments(router);
	const flatApi = stripComments(api);
	// 文案真源：标题 = 前缀 + 商品名（没有商品名只留前缀）；描述吃后端有效期句
	const helperTitle = /FALLBACK_TITLE = '送你一份礼物'/.test(flatHelper)
		&& /goods_name/.test(flatHelper)
		&& /\? FALLBACK_TITLE \+ '：' \+ name : FALLBACK_TITLE/.test(flatHelper);
	const helperDesc = /expire_text/.test(flatHelper) && /FALLBACK_DESC/.test(flatHelper);
	// 页面三枚 computed 都读真源（标题/描述/领取链接），不自己拼句子、不自己拼地址
	const wired = /import sfShare from '@\/common\/utils\/send-friend-share\.js'/.test(flatJs)
		&& /shareTitle\(\)\s*\{\s*return sfShare\.title\(this\.info\);/.test(flatJs)
		&& /shareDesc\(\)\s*\{\s*return sfShare\.desc\(this\.info\);/.test(flatJs)
		&& /receiveUrl\(\)\s*\{\s*return sfShare\.receiveUrl\(this\.info\);/.test(flatJs);
	// H5 那一发：只在 H5 编译；判据「本人 ∧ 待赠送」；第五参传后端链接
	const rawAt = js.indexOf('applyShare() {');
	const applyRaw = rawAt >= 0 ? js.slice(rawAt, rawAt + 800) : '';
	const applyFlat = stripComments(applyRaw);
	const h5Only = /#ifdef H5/.test(applyRaw);
	const guard = /!this\.receiveUrl \|\| !this\.canShare/.test(applyFlat);
	const call = /\$nav\.share\(this\.shareTitle, this\.shareDesc, this\.cover, 'app_message', this\.receiveUrl\)/.test(applyFlat);
	// 数据到手才配（取数成功那一支调一次）
	const applied = /this\.info = d;[\s\S]{0,240}?this\.applyShare\(\);/.test(flatJs);
	// 小程序端与 H5 同一句标题（旧的写死「送你的礼物」零残留）
	const mpSame = /title:\s*this\.shareTitle/.test(flatJs) && flatJs.indexOf("title: '送你的礼物'") < 0;
	// 后端：`receive_url` 只在「本人 ∧ 待赠送」下发（与 `share()` 同一判据）
	const backend = /'receive_url'\s*=>\s*\(\$isGiver && intval\(\$gift\['status'\]\) === Status::PENDING\) \? Link::receiveUrl\(\$gift\['gift_no'\]\) : ''/.test(flatApi);
	// `$nav.share` 开出第五参（H5 落地链接），缺省仍拼当前页
	const routerLink = /share\(title = '',desc='',logo='', type = 'app_message', landingLink = ''\)/.test(flatRouter)
		&& /var link = landingLink \|\| \(baseUrl \+ "#" \+ shareParams\.path\);/.test(flatRouter);
	const ok = helperTitle && helperDesc && wired && h5Only && guard && call && applied && mpSame && backend && routerLink;
	return {
		ok,
		got: '文案真源(标题/描述)=' + helperTitle + '/' + helperDesc + ' 页面读真源=' + wired
			+ ' H5 专属=' + h5Only + ' 判据=本人∧待赠送=' + guard + ' 落地链接吃后端=' + call
			+ ' 取数后配置=' + applied + ' 小程序同句=' + mpSame + ' 后端 receive_url=' + backend
			+ ' $nav.share 落地通道=' + routerLink,
	};
}

/**
 * ⑬ 「去分享送礼」要**整宽**（2026-10-29 用户点名「去分享送礼按钮没有 100%」）。
 *
 * 判据不在按钮身上：`tz-button long` 的根类本来就是 `width:100%`，坏在**容器**——
 * 小程序端自定义组件的**宿主节点**才是 `tz-button` 那一行的 flex 项，容器写 `align-items:center`
 * 时宿主按内容收缩，里面的 `100%` 只等于文字宽（H5 没有宿主节点，浏览器里一直是整宽）。
 * 所以两件事必须同时成立：
 *   ① `.sfs-actions` 是 `align-items: stretch`（宿主撑满整行）；
 *   ② 第二入口「自己使用」自带宽度的例外：自己 `align-self: center` 保持居中，不跟着被拉成一条。
 */
function checkShareButtonWidth(cssSrc) {
	const actions = (cssSrc.match(/\.sfs-actions \{([^}]*)\}/) || [])[1] || '';
	const self = (cssSrc.match(/\.sfs-self \{([^}]*)\}/) || [])[1] || '';
	const stretch = /align-items:\s*stretch/.test(actions);
	const noCenter = !/align-items:\s*center/.test(actions);
	const selfCentered = /align-self:\s*center/.test(self);
	return {
		ok: stretch && noCenter && selfCentered,
		got: 'align-items:stretch=' + stretch + ' 没有 center=' + noCenter + ' 第二入口 align-self:center=' + selfCentered,
	};
}

const tpl = templateOf(VUE);
const js = scriptOf(JS);
const css = read(CSS);
const api = read(API_LIST);

console.log('=== check-send-friend-send（M-P9 送礼页：三步条 / 居中 / 自己使用 / 关页跳详情）===');
let r = checkStepsReuse(tpl, read(PAGES_JSON), read(SUBMIT), read(STEPS));
assert('① 路由已登记；三步条复用 `tz-sf-steps`（本页 2、下单页 1），M57 几何随组件走', r.ok, r.got);
r = checkNoMessage(tpl, js, css);
assert('② 参考页的「写下专属寄语」整块不做（模板/脚本/样式零残留）', r.ok, r.got);
r = checkCenter(css);
assert('③ 「礼物已备好」那块在剩余空间垂直居中（页竖排 + 正文 flex:1 + center）', r.ok, r.got);
r = checkSelfUse(tpl, js, api);
assert('④ 【自己使用】只吃后端 self_usable；调 selfUse；成功 redirectTo 详情；一页一枚主操作', r.ok, r.got);
r = checkShell(tpl, js);
assert('⑤ 未装/未登录/非本人三档闸门 + 页尾两枚 + 骨架待在真实外壳里', r.ok, r.got);
r = checkCard(js);
assert('⑥ 礼单卡片走 tz-course-mini 且 `qty: 1`（×1），不摆购买价；卡片可点并带 id/type 跳商品详情', r.ok, r.got);
r = checkBackend(read(GIFT_API), read(GIFT_MODEL), read(CLAIM_SERVICE));
assert('⑦ 后端 selfUse 与 receive 同一份回体（detail_type / detail_id 一处算）', r.ok, r.got);
r = checkClaimedState(tpl, js, read(GIFT_API));
assert('⑧ 已领取 / 已失效那一档：三步条收起、大标题「礼物+status_label」、白卡「已领取 + 领取人 + 日期」', r.ok, r.got);
r = checkPageBg(css);
assert('⑨ 页面底色回全站默认（`.school-page.sfs-page` 只留排版、不写 background，暖米底整族下线）', r.ok, r.got);
r = checkGiftCardFrame(read(SHARED_CSS));
assert('⑩ 蓝面板上的商品卡补半透明白边过渡（2px 内衬 + 1px rgba 描边 + 外圆角 13），卡片白底不动', r.ok, r.got);

r = checkSelfUseConfirm(tpl, js);
assert('⑪ 【自己使用】点下去先弹原生确认（说清后果 + 确认/取消），取消支就地返回、不置位不发请求', r.ok, r.got);

r = checkShareCard(js, read(SHARE_HELPER), read(ROUTER), read(GIFT_API));
assert('⑫ H5「···」分享卡片适配送好友（标题说礼物+商品名、落地落领取页、两端同一句文案）', r.ok, r.got);

r = checkShareButtonWidth(css);
assert('⑬ 「去分享送礼」整宽：动作区容器 stretch（宿主撑满），「自己使用」自己 align-self:center 保持居中', r.ok, r.got);

const bad = {
	steps: checkStepsReuse('<view></view>', read(PAGES_JSON), read(SUBMIT).replace('<tz-sf-steps v-if="isSendFriend" :active="1" />', '<view class="sf-steps"></view>'), read(STEPS)),
	msg: checkNoMessage('<textarea placeholder="写下专属寄语"></textarea>', '', ''),
	center: checkCenter('.sfs-main { display:block; }', ''),
	self: checkSelfUse(tpl, js.replace(/self_usable/g, 'is_owner'), api),
	shell: checkShell(tpl.replace('<tz-footer />', ''), js.replace(/pluginState\('send_friend'\)/, 'true')),
	card: checkCard(js.replace(/qty:\s*1/, 'pay_type: \'pay\', price: 1')),
	backend: checkBackend(read(GIFT_API).replace(/public function selfUse\(/, 'public function selfUseX('), read(GIFT_MODEL), read(CLAIM_SERVICE)),
	claimed: checkClaimedState(tpl, js, read(GIFT_API).replace(/ 'receiver_name'\s*=>[^\n]*\n/, '')),
	bg: checkPageBg(css.replace('.school-page.sfs-page {', '.school-page.sfs-page {\n  background: #FDF5E4;')),
	frame: checkGiftCardFrame(read(SHARED_CSS).replace(/border: 1px solid rgba\([^)]*\);/, 'border: 0;')),
	// ⑪ 两档坏样件：① 确认框换成 toast（等于没有确认）；② 取消支不判 res.confirm（点取消也照用）
	selfConfirmMissing: checkSelfUseConfirm(tpl, js.replace('uni.showModal({', 'uni.showToast({')),
	selfConfirmIgnored: checkSelfUseConfirm(tpl, js.replace('if (!res.confirm) { return; }', '')),
	// ⑫ 三档坏样件：① 回到「H5 不配卡片」（只有小程序那一条）② 落地链接拼回本页（不收后端 receive_url）
	//     ③ 文案回站点名/旧写死标题（两端不一致）
	shareNoH5: checkShareCard(js.replace(/applyShare\(\) \{[\s\S]{0,600}?\n\t\t\},/, 'applyShare() { return; },'),
		read(SHARE_HELPER), read(ROUTER), read(GIFT_API)),
	shareSelfLink: checkShareCard(js.replace(/, 'app_message', this\.receiveUrl\)/, ", 'app_message')"),
		read(SHARE_HELPER), read(ROUTER), read(GIFT_API)),
	shareCopyFork: checkShareCard(js.replace(/title: this\.shareTitle/, "title: '送你的礼物'"),
		read(SHARE_HELPER), read(ROUTER), read(GIFT_API)),
	shareBtnWidth: checkShareButtonWidth(css.replace('align-items: stretch;', 'align-items: center;')),
	shareBackendGone: checkShareCard(js, read(SHARE_HELPER), read(ROUTER),
		read(GIFT_API).replace(/\(\$isGiver && intval\(\$gift\['status'\]\) === Status::PENDING\) \? Link::receiveUrl\(\$gift\['gift_no'\]\) : ''/,
			"''")),
};
const fired = Object.keys(bad).filter((k) => !bad[k].ok);
if (process.argv.indexOf('--selftest') >= 0) {
	fired.forEach((k) => { pass++; console.log('[SELFTEST-FIRE] 坏样件 ' + k + ' 已报红 -> ' + bad[k].got); });
	// 合格样件不许误报
	const good = [checkStepsReuse(tpl, read(PAGES_JSON), read(SUBMIT), read(STEPS)),
		checkNoMessage(tpl, js, css), checkCenter(css), checkSelfUse(tpl, js, api),
		checkShell(tpl, js), checkCard(js), checkBackend(read(GIFT_API), read(GIFT_MODEL), read(CLAIM_SERVICE)),
		checkClaimedState(tpl, js, read(GIFT_API)), checkPageBg(css), checkGiftCardFrame(read(SHARED_CSS)),
		checkSelfUseConfirm(tpl, js), checkShareCard(js, read(SHARE_HELPER), read(ROUTER), read(GIFT_API)),
		checkShareButtonWidth(css)];
	const falseRed = good.filter((g) => !g.ok);
	if (falseRed.length) { fail++; console.log('[SELFTEST-FAIL] 真件被判红 -> ' + falseRed.map((g) => g.got).join('；')); }
	else { pass++; console.log('[SELFTEST-OK] 真件 12 组全绿，坏样件 ' + fired.length + ' 条均被抓红'); }
	console.log('\n[SELFTEST] 坏样件 ' + fired.length + ' 条被抓红（要求 ≥12）；总通过 ' + pass + ' / 失败 ' + fail);
	process.exitCode = fail === 0 && fired.length >= 12 ? 0 : 1;
} else {
	console.log(fail === 0 ? '\n结果：全部符合预期（通过 ' + pass + ' 项 / 违反 ' + fail + ' 项）'
		: '\n结果：有 ' + fail + ' 项不符合预期（通过 ' + pass + ' 项）');
	process.exitCode = fail === 0 ? 0 : 1;
}
