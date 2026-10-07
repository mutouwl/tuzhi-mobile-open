/**
 * 直播间「邀请人 id」的跨页接力（分享有礼与邀请达人榜共用同一份口径）
 *
 * 归因链的入口是分享链接上的 `?share=<邀请人 id>`。两条上报**现在都落在详情页**：
 *   达人榜 = `pages/course/detail/js.vue` 的 `reportInviteRank`（落 `app_invite_rank_visit`），
 *     **排在它的 `course.detail` 请求之前发**——后端 Course::detail 会建 tuzhi_live_user 行，
 *     而 Report 的「已经进过直播间」判据就是这张行在不在（2026-10-05 用户点名的排除规则）；
 *   分享有礼 = **同一页的 `reportShareGiftAssist`**（落 `app_share_gift_assist`，静默、无界面）。
 *
 * **2026-10-05 第三次修正：助力原本只在直播间页报（`share-gift-popup` 的 `tryAssist`），是错的。**
 * 落点页（详情页）与上报页（直播间页）不是同一页 ⇒ 受邀人只点开链接、不再点「进入直播间」时，
 * `app_invite_rank_visit` 有行而 `app_share_gift_assist` 整场 0 行，现场读出来就是
 * 「只有邀请达人榜正确的显示了邀请记录，但是分享有礼的邀请，并没有生效」。
 * PRD 自己认的「进入直播间」事实就是 `joinLive` 写的那张 `tuzhi_live_user` 行，而那行正是
 * 详情页的 `course.detail` 建的 ⇒ 以详情页为「进入」的那一拍，助力与达人榜才对得上。
 * **两发都保留**：本页这一发先记（幂等，`uk_activity_assist(activity_id, assist_user_id)`），
 * 直播间页那一发再记一次。**两发都不弹界面**：2026-10-06 用户点名「被邀请的用户进入直播间后，
 * 不要弹出来」，原先由直播间那一发驱动的 `assist-tip`「助力成功」弹窗整层已删。
 *
 * 而直播课的分享链接落点根本不在直播间：`common/library/share/Links.php` 的 `type='course'`
 * 出的是 `/pages/course/detail/detail?id=&share=`，详情页进直播间是一次 `redirectTo`——
 * 上一版那一条 URL 只搬了 `id` 与 `column_id`，`share` 在这一跳被丢掉，两张表一行都不落
 * （2026-10-04 现场：邀请人用详情页链接邀请受邀人进了直播间，达人榜与助力记录全空）。
 *
 * **为什么不直接回落到全站 storage 的 `share`**（PRD §12.3-12）：`router.js` 存的那一份是全站
 * 分销口径、跨课程长期留着，拿它当邀请人会把「上一场别人请进来的人」算到这一场头上。
 * 所以这里按**课程**隔离：记住的是「哪一直播间、由谁请进来」，`resolve` 只在课程 id 相等时给值。
 *
 * 付费课那一头原本要靠这一份接力：`detail → 下单 → 支付结果页 →「返回直播」` 中间隔了三跳
 * （`pages/public/result/result.vue:47` 同样只带 `live_id`），链接参数早没了。
 * 2026-10-05 达人榜归因挪到本页就地发之后，这条路不再依赖接力了，但本份仍要留着：
 * 分享有礼的助力还在直播间页，`startLearning` 拼的 `&share=` 也靠它续上这一跳。
 *
 * **2026-10-04 当晚复查：同一个症状第二次出现，根因是「验的不是这份源码」。**
 * 这一版修好之后只停在工作区（未提交、未编译）。而现场复现用的地址是
 * `http://tuzhi.mutouweb.com/index.php?i=1&route=#/pages/course/detail/detail?id=331&share=38`——
 * 那是 nginx 根指到后端 `public/` 的**入口**，`i=1&route=` 由 `index.php` 转交，
 * 页面由 `public/assets/h5/` 里那份**15:55 的产物**提供，**与 `:8080` 的 dev server 是两套东西**。
 * 逐项证据（`public/assets/h5/js/`）：
 *   - `pages-course-detail-detail.*.js`（15:55）的 `startLearning` 仍拼
 *     `"/pages/course/live/live?id="+id`，其后只有 `column_id`，**没有 `&share=`**；
 *   - 全包 `grep -l live_inviter js/*.js` **零命中**（dev 的 detail chunk 里这段注释与
 *     `&share=` 拼装都在）。
 * 也就是说：本地开发机 ≠ 本地 dev server。改 `src/` 后只有 `:8080` 会变，
 * `tuzhi.mutouweb.com` 那一格是**编译产物**，`build:h5` + `替换脚本.sh` 拷进去才变；
 * 而 sfc-check / ui-audit / 后端 curl 三件门禁**全都验不到这一格**（它们读 `src/` 与 PHP，不读产物）。
 * 排查这一族症状第一步就分这两格：先确认地址栏是 `:8080` 还是 `tuzhi.mutouweb.com`，
 * 再去比产物与源码。
 *
 * **2026-10-05 第三次复查：上一段那个"参数名对不上"的判是错的，错在工具自己。**
 * 2026-10-04 那两轮断定「后端发的是 `share_id`、端上只认 `share`」，依据有三：
 * ① `Links.php` 里 `$params['share_id'] = $userId;`；② `grep -rn "share_id" src/` 零命中；
 * ③ 自检工具 `InviteAttrTrace` 第 3 环打印出的地址写着 `share_id=38`。
 * **这三条里 ①③ 都是同一个假前提**：那是 `getShareParams()` 的**输入键**，
 * 它的返回值还要经 `parseParams()` 改名才落到 URL 上——
 *     $fields[$type]['share'] = 'share_id';             // Links.php:216  左＝输出键，右＝取值键
 *     foreach (...) { $data[$index] = $params[$item]; } // ⇒ $data['share'] = $params['share_id']
 * ⇒ 产品发出去的地址是 `…/pages/course/detail/detail?id=4544&**share**=38`，
 * **本文件第一档 `share` 正是它**；`share_id` 从不出现在 URL 上，所以 ② 的 grep 天然零命中——
 * 那条 grep 查的是一个产品从不产生的名字，零命中不构成证据。
 * ①与③之所以被当成证据：工具第 3 环当时是 `http_build_query($params)` 自己拼的，
 * 没走 `Links::getLink()` ⇒ 它打印的是**自己造的一个地址**，于是"后端发 share_id"被工具亲手坐实，
 * 再照着它加了别名、改了硬约束 33。**用假输入验真链路，在工具层又重演了一次。**
 * 已更正：`InviteAttrTrace` 第 3 环改为走 `Links::getLink()`（见 `InviteShareLinkProbe`），
 * `check-live-inviter-chain.js` ⓪ 组改为反推改名表**左值**（线上那一个），并已证明能红
 * （摘掉端上 `share` 一档即 11 项红）。
 *
 * **这一段的教训才是要留下来的东西**：验链路时喂进去的输入必须是产品实际会产生的那个。
 * `sfc-check` 读 `src/`、`ui-audit` 读版式、后端 curl 打 PHP，
 * **三件门禁没有一件会把「后端发到线上那一个名字」与「前端读的那个名字」摆到一起**——
 * 而且**它们自己写错输入时，也是绿的**。
 * ⇒ 参数名一律走 `inviterFromParams()` 这一份，两边新增别名只改它一处；
 *   对账交给 `node tuzi-mobile/scripts/check-live-inviter-chain.js` 的 ⓪ 组
 *   （从 `Links.php` 反推线上那一个 key，再断言本文件认它；后端改写法它自己跟着红）。
 *
 * **本文件能记的那一档 `inviter_id` 是自造别名**（早于后端口径统一时的写法），
 * `share_id` 则是一次误判留下的别名——**产品不发它，留着只是让读者以为它在线上出现过**。
 *
 * **再分第三格：`:8080` 那一格打的也不是本地 PHP。** `src/siteinfo.js` 的 `siteroot` 是
 * `https://tuzhi.mutouweb.com`，`src/static/config.js` 由它拼出 `apiUrl`，H5 的 uni.request
 * 直连这个域 —— 也就是 `:8080` 的页面试的是**线上后端**，与本地 `tuzhi.mutouweb.com` 那套 PHP 是两套。
 * 所以本机调试这一族要同时说清三件事：页面来自哪一份（dev server / nginx 产物）、请求打到哪个后端、
 * 两边各自的产物与源码差在哪。三格里任何一格没对上，现场就还是全空，而三件门禁一格都验不到
 * （sfc-check 读 `src/`、ui-audit 读版式、后端 curl 打 PHP，没有一格读产物或读 dev server 的地址）。
 */

const KEY = 'live_inviter';

/**
 * URL 上的「邀请人 id」只有这一份读法，**两个页面的读点都必须走它**（不许各写各的 OR 链）。
 *
 * 三个别名与来历（**谁在线上、谁不在**必须写清，这一栏写错过一次）：
 *   - `share`：**产品实际发出来的那个**。`Links::getShareParams()` 塞进去的是 `$params['share_id']`，
 *     但 `Links::getLink()` 出链前要过 `parseParams()` 的改名表
 *     `$fields[$type]['share'] = 'share_id';`（`Links.php:216`），落到 URL 上的是左值 `share`
 *     ⇒ 全站分享链接、海报二维码、微信/QQ 转发卡片带的都是 `…&share=38`；
 *   - `inviter_id`：自造别名，早于后端口径统一时的写法，从没在线上出现过，保留只为不打断旧链接；
 *   - `share_id`：**一次误判留下的别名**（2026-10-04 把后端的输入键当成了输出键）。
 *     它从不出现在 URL 上——留着它本身无害，但它一度让人以为"后端发的是 share_id"，
 *     那条错误结论已经害了三轮排查，故排在最后并在此注明来历。
 *
 * 三个都取 `String()` 之后按首个非空返回；**全都取不到才给空串**（空串 ⇒ 上游一律不发请求）。
 *
 * @param {Object} params 页面参数（`pageParams`）
 * @returns {String} 邀请人 user id，空串表示这一跳没有邀请人
 */
export function inviterFromParams(params) {
	const p = params || {};
	// 线上那一个（`share`）排第一；后两个都从不在 URL 上出现过，保留仅为不打断旧链接
	const raw = p.share || p.share_id || p.inviter_id || '';
	return raw === '' || raw === undefined || raw === null ? '' : String(raw);
}

/**
 * 记住「这一间直播间是被谁请进来的」：链接带 share 才记，同一直播间以最后一次点击为准
 * （先后两位邀请人抢同一个人由后端判「只认首次」，前端不许自己比时间）
 * @param {String|Number} courseId 直播课程 id（详情页的 `id`、直播间的 `pageParams.id`）
 * @param {String|Number} share 链接上的邀请人 id
 */
export function rememberInviter(courseId, share) {
	const cid = String(courseId || '');
	const inviter = String(share || '');
	if (!cid || !inviter) {
		return;
	}
	try {
		uni.setStorageSync(KEY, { course_id: cid, share: inviter });
	} catch (e) {
		// 写 storage 失败只让这一次归因退化成「链接直达才认」，不许把进页那一条链打断
		console.warn('[live_inviter] 记住邀请人失败：', e);
	}
}

/**
 * 取这一间直播间记住的邀请人 id；课程不匹配一律给空串（跨课程污染就断在这一句）
 * @param {String|Number} courseId
 * @returns {String}
 */
export function resolveInviter(courseId) {
	const cid = String(courseId || '');
	if (!cid) {
		return '';
	}
	let saved = null;
	try {
		saved = uni.getStorageSync(KEY);
	} catch (e) {
		return '';
	}
	if (!saved || String(saved.course_id) !== cid) {
		return '';
	}
	return String(saved.share || '');
}

export default { rememberInviter, resolveInviter, inviterFromParams };
