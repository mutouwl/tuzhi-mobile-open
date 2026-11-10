<template>
	<!--
	  商详页「送好友」入口（M-P1）——最早按参照产品收进底部购买栏那一条
	  （用户 2026-10-16 原话「详情页的送礼物按钮 可以参考同类产品」；竞品 01_02 截图里它就在
	  「购买」按钮左侧那一条上）；2026-10-27 起未订阅态改由商详信息卡里的长条承担（见下）。

	  形态**按落点分两档**（`scene` prop）——「参考其他页面或组件样式」在每一处指的就是
	  它那几个兄弟：同栏兄弟带文字就带文字，同栏兄弟是纯图标就纯图标。
	   · `control`（已订阅）= `tz-bottom-btn` 的 `control-extra` 插槽，与「收藏 / 目录 / 评论 /
	     打卡 / 分享」同一形态（等分该栏、图标 + 12px 文字）——同栏兄弟都带文字，本枚跟着带。
	     等分的口径在 `src/App.vue` 的 `.sf-control-slot`（见下方样式块那段三次点名的注释）。
	     **买过课的人照样能把这门课买来送人**，入口不随订阅态消失
	     （2026-10-16 用户追问「课程购买之后就不能送好友了？」）。
	   · `inCard`（2026-10-27 用户点名，图2）= 商详标题/简介**下面那一长条**（不是底栏），
	     形态照同卡里的 `.vip-bar`：奶白底 + 左侧圆角深蓝图底（内嵌礼盒）+ 「送份礼物 表达心意」，
	     右侧「送好友」+ 细箭头。
	   · ~~`order`（未订阅的购买栏，纯图标）~~ **已撤**（2026-10-27 用户点名「送好友已经有
	     `sfa-entry sfa-entry--card` 了，就不用在底部操作栏再显示 iconfont icon-lipin」）：
	     未订阅态的那条长条已经摆在信息卡里，底栏再摆一枚纯图标就是同一个入口说两遍；
	     已订阅态没有那条长条，所以 `control` 那一档保留。
	两档共用同一份 `installed ∧ entry` 判据与同一个 `openSubmit()`，
	这里只多一种摆法，**不许另开第二条取数/跳转链**。

	  三条要点：
	   ① **未装插件 ⇒ 整段 `v-if` 不渲染，且一条请求都不发**（M14/`paid-plugins.md` §4.2）：
	      判据只吃 `$tools.systemConfig('app_isinstall_send_friend')`（`api/common/init` 下发）。
	   ② **入口显隐只吃后端那一枚 flag `send_friend_entry`，前端不重判**（M36②/硬约束 31）：
	      总开关 ∧ 类别勾选 ∧ 商品可送这三枚轴由后端 `Gate` 压成一枚（`Entry::payload`）；
	      **flag 还没到手那一拍（`loading`）不算 flag**：不许先摆一枚可点的入口再等它自己消失
	      （2026-10-20 用户实报：视频课程底栏先出礼盒图标，点进去提交才被「该内容暂不支持赠送」挡回）。
	      取数链四条退出分支都落定（成功且开 → 载荷；成功但关 / 失败 → null），不留「永远在取」的一档。
	   ③ 未登录先弹登录再走（口径同 `group-buy-area` 的 `goBuy()` 与课程页 `buyCheck`）：
	      把人送进一张必然 401 的下单页，读出来就是「点了没反应」（硬约束 27）。
	      对外事件名 `open`，不是 `tap`（M28/硬约束 27①）；宿主页接它去标 `stateDirty`（硬约束 16 例外二）。
	   ④ **点击时再向后端确认一次**：页面可能停留到商家改了「可赠送内容」之后，手里那一枚 flag
	      已经是旧值；直接导航就等于把用户送进一张必然被 `gift/create` 拦下的下单页。
	      复核不过就地把入口收掉并说一句原因，不发 `open`、不导航。
	   ⑤ **圈子 / 会员卡要带规格**：圈子是 `规格ID_规格价格`（`extend`），会员卡的 SKU 写在
	      `goodsId`（`卡ID_下标`）。前端只把后端回给的那两枚原样带进提交订单页，不自己算价；
	      2026-10-28 起的三个交付页（圈子预售/练习详情/会员中心）由商品页按自己选中的规格传进来，
	      没传时（如入圈后的圈子首页）后端回落第一档。
	-->
	<view :class="['sfa-entry', sceneClass]" :style="cardGapStyle" v-if="installed && entry" @tap="openSubmit">
		<!-- `inCard`：商详标题下方那一长条（图2）——奶白底、左侧深蓝圆角方块内嵌白礼盒、
		     中间一句「送份礼物 表达心意」、右侧「送好友」+ 细箭头 -->
		<template v-if="scene === 'inCard'">
			<view class="sfa-card-icon"><tz-icon name="lipin" :size="12" color="#FFFFFF" /></view>
			<text class="sfa-card-title">送份礼物 表达心意</text>
			<view class="sfa-card-action">
				<text class="sfa-card-action-text">送好友</text>
				<tz-icon name="enter" :size="12" color="#2F7DE1" />
			</view>
		</template>
		<!-- 底栏那一档（`control`，已订阅的控制栏）：与同栏兄弟同形 —— 图标 + 12px 文字。
		     未订阅的购买栏不再挂这一枚（2026-10-27 用户点名，见头注释）：入口已经在信息卡长条里。
		     图标取 `lipin`（礼品）——`liwu`/`liwu1` 在 iconfont.css 里有类但 TTF 缺字形，
		     用了渲染成空白（2026-10-16 用户点名「只有文字没有 icon」）；size 按墨迹归一：lipin 墨迹 0.938，
		     同栏兄弟（share 0.845 / collection 0.876 / tasklist 0.876）在默认 30px 下墨迹 25~26.3px，
		     lipin 取 28px（墨迹 ≈ 26.3px）与最饱满那枚对齐。 -->
		<template v-else>
			<view><tz-icon name="lipin" :size="28" color="#444" /></view>
			<view class="sfa-entry-text">送好友</view>
		</template>
	</view>
</template>

<script>
import { FEATURE_SEND_FRIEND } from '@/common/utils/feature-flags.js';
// 付费插件安装态闸门（三态）：本会话 init 还没回包时不拿上一轮 flag 判（见 plugin-guard.js 头注释）
import { pluginState, pluginMissing, onSystemConfigReady } from '@/common/utils/plugin-guard.js';
/**
 * 商详页「送好友」入口（M-P1）
 *
 * props: goodsType（course/circle/exercises/vipcard）、goodsId、extend、scene（`control` / `inCard`）、
 *        manual（true = 只上抛 `open`，导航由宿主决定；圈子预售页要在选完有效期之后再走）
 * emits: open（**非原生名**，M28）—— 导航由本组件发出，留这一枚给宿主页标 `stateDirty`；
 *        payload 带 `max_per_order` / `extend` / `submit_url`，供 manual 宿主原样使用
 * 公开方法：`reload()`（宿主页首屏之后、下拉刷新、支付成功广播这三条到达路径都调它，
 *           与 `group-buy-area` 同一口径：**不许把它挂到页面 onShow 上整页重取**，硬约束 16 例外二）、
 *           `submitUrlFor(extend, max)`（manual 宿主选完规格后取同一条落页，不许各拼一份 URL）
 *
 * 取数：`this.$api('send_friend.gift.entry', {goods_type, goods_id, extend})`（免登录那一口）。
 * `send_friend_entry` 为 1 才算「能送」，其余几枚（`tip`/`max_per_order`/`button_text`）
 * 由下单页与面板消费，本入口不摆它们（栏里只有图标那一枚那么宽）。
 *
 * ⚠ 载荷形状两态都要吃下：闸门不过时后端只回 `{send_friend_entry: 0}` 这一个事实（`Entry::payload`），
 *    过了才带全字段。**字段缺失 / 0 / '0' / 整份为 null 一律「不显示」**（硬约束 31④ / §12.1-⑨）。
 * ⚠ 回调写 `data` 前过「已销毁」闸门（硬约束 23）：本页往回退时这一条请求可能还在飞。
 */
import tzIcon from './icon.vue';

export default {
	name: 'SendFriendArea',
	components: { tzIcon },
	props: {
		/** 商品定位：course / circle / exercises / vipcard（与商详页那一行同形） */
		goodsType: { type: String, default: 'course' },
		goodsId: { type: [Number, String], default: 0 },
		/** 规格位：圈子 `规格ID_规格价格`（会员卡的 SKU 已在 goodsId 里，这里留空） */
		extend: { type: String, default: '' },
		/** 摆在哪一档：`control` = 已订阅的控制栏 / `inCard` = 商详标题下那一长条（未订阅的入口） */
		scene: { type: String, default: 'control' },
		/** true = 只上抛 `open` 不导航（圈子预售页要先选有效期；会员卡/练习/课程沿用组件内导航） */
		manual: { type: Boolean, default: false },
		/** 上边距（px，仅 `inCard` 长条生效，默认 0）：块与块之间的间距归宿主按页给，样式表里不写死
		    （M45）。课程商详 2026-10-28 第二次点名要留 8px ⇒ 该页传 8；圈子售前 2026-10-29 同一档也传 8
		    （上方是「人加入 · 动态」那一行）；练习详情 2026-10-30 同一档也传 8（上方是优惠券条 / 属性卡）；
		    会员中心不传，仍是 0 */
		marginTop: { type: [Number, String], default: 0 },
	},
	emits: ['open', 'visible'],
	data() {
		return {
			installed: false,
			// 「首屏那一发取数」是否已经发过（init 回包与 created 两条到达路径只放一次，见 checkInstall）
			installLoaded: false,
			loading: false,
			/** 点击复核在途：连点只发一条 entry，不许一次点击叠出两跳 */
			checking: false,
			/** 后端那份入口载荷；null = 闸门不过 / 还没到手 / 取失败（三态都归为「整段不渲染」） */
			entry: null,
		};
	},
	computed: {
		/** 两档摆法的类名只在这一处落（模板里不再写二元三元） */
		sceneClass() {
			return this.scene === 'inCard' ? 'sfa-entry--card' : 'sfa-entry--control';
		},
		/** 上边距只把宿主传进来的那一枚数落到根节点上，不在样式表里写死（M45：换一页不必改组件）。
		    底栏那一档（`control`）不吃这一档 */
		cardGapStyle() {
			const top = Number(this.marginTop) || 0;
			if (this.scene !== 'inCard' || top <= 0) { return ''; }
			return 'margin-top:' + top + 'px';
		},
		/** 单笔可买份数上限：只吃后端下发的那一个数，随 URL 带进下单页（取不到就不带，下单页自己兜 1） */
		maxPerOrder() {
			const n = Number((this.entry || {}).max_per_order) || 0;
			return n > 0 ? n : 0;
		},
		/** 下单落页：**与全站购买流同一条**（`pages/order/submit/submit?goodsList=…`），只多三样：
		 *  `sf=1`（建单口切到插件礼物口，见 `components/order/submit-order.vue` 的 isSendFriend 分支）、
		 *  `sf_max`（份数上限，后端下发）、`type`（仅非课程三类：提交页试算按 order_type 分档）。
		 *  2026-10-16 用户点名「完全可以在提交订单页完成」⇒ 插件自己的送礼下单页整页撤掉 */
		submitUrl() {
			return this.submitUrlFor(this.extend);
		},
	},
	watch: {
		// 同一实例换了商品（专栏里点进另一门课那一跳）：上一门课的 flag 不能留给这一门课用 ⇒ 清空重取
		goodsId() {
			this.entry = null;
			this.reload();
		},
		// 圈子预售页换了有效期 / 会员中心换了 SKU：价格与规格位都变了，flag 必须按新规格重取
		extend() {
			this.entry = null;
			this.reload();
		},
	},
	created() {
		this.checkInstall();
		// 商详页与 `common.init` 并行：init 回包后重判一次（已装补发取数、未装整段不出）
		this._offInstallReady = onSystemConfigReady(() => this.checkInstall());
	},
	beforeDestroy() {
		if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
	},
	beforeUnmount() {
		if (this._offInstallReady) { this._offInstallReady(); this._offInstallReady = null; }
	},
	methods: {
		/**
		 * 安装态三态判据（`pluginState`：true 已装 / false 未装 / null 本会话 init 还没回包）。
		 * **null 不当未装**（等 init 回包再判，否则入口永远补不回来）、
		 * **也不当已装**（flag 没到手之前一条请求都不发 —— 未装时发出去只会在后端报「功能未安装」）。
		 * `installLoaded` 让首屏那一发只走一次。
		 */
		checkInstall() {
			const state = pluginState('send_friend');
			this.installed = FEATURE_SEND_FRIEND && state === true;
			if (this.installed && !this.installLoaded) {
				this.installLoaded = true;
				this.reload();
			} else if (state !== null && !this.installed) {
				// init 已经回包、判定为「没装 / 功能位关」：**这一档出口也要落定**
				// （否则宿主那一格按 `visible` 的乐观初值一直占着宽度，见 notifyVisible）
				this.notifyVisible();
			}
		},
		/**
		 * 入口「此刻真的摆得出来吗」——只在**判定落定**的那几拍上抛给你宿主（`visible`）。
		 *
		 * 为什么需要这一枚事件：底栏是 flex 均分，插件入口**是动态的**（未装 / 总开关关 /
		 * 品类不可送 / 积分商品 … 都要收掉）。小程序端这一行的 flex 项是**宿主节点**，它不像
		 * H5 那样随组件根 `v-if` 一起消失 —— 根不渲染时宿主仍在，`flex:1 1 0` 会让它白占一格，
		 * 剩下几枚各占 1/4 而不是 1/3（硬约束 46）。宿主拿到 `false` 就给宿主节点挂
		 * `.sf-control-slot--off{display:none}`，`display:none` 连 gap 一起收掉；**不能用 `v-if` 卸载**
		 * ——本组件要一直挂着，页面下拉刷新 / 支付成功回来还要 `$refs.sfArea.reload()` 把它重新点亮。
		 *
		 * 只在这三处调用：① `checkInstall` 判出未装；② `reload` 的成功/失败落定；③ 点击复核不过。
		 * **取数在途时不许抛 false**（否则每次刷新都先缩一下再弹回来）。
		 */
		notifyVisible() {
			if (this.gone()) { return; }
			this.$emit('visible', !!(this.installed && this.entry));
		},
		/** 实例已出栈/正在销毁 ⇒ 这一次回调什么都不写（硬约束 23 的兜底那一层） */
		gone() {
			return this._isDestroyed === true || this._isBeingDestroyed === true;
		},
		/**
		 * 载荷 → 入口那一份（只认后端 flag 为 1；缺失 / 0 / '0' / false / null 一律不显示）
		 * 两处共用同一份判读（首屏重取与点击复核），不许各写一份 `=== 1`。
		 * @param {*} data
		 * @return {Object|null}
		 */
		parseEntry(data) {
			if (!data) { return null; }
			return (Number(data.send_friend_entry) === 1 || data.send_friend_entry === true) ? data : null;
		},
		/**
		 * 重取入口 flag（首屏 / 下拉刷新 / 支付成功广播到达时由调用点调）
		 *
		 * 三条退出分支都要落定（硬约束 22）：成功且开 → 载荷；成功但关 → null；失败 → null。
		 * 任何一条都不许把 `loading` 留在 true。
		 * **开取前先收掉上一拍那份载荷**：商家改完设置、换商品、支付回来重取的那一段里，
		 * 旧 flag 还摆在底栏上就是一枚「点进去必然被拦」的入口（2026-10-20 用户实报）。
		 */
		reload() {
			// 会员卡的 goodsId 是 `卡ID_下标`、圈子的规格在 extend 里：判空要看「下划线前那一段」，
			// 不能 Number() 整串（`12_0` 会得 NaN，入口永远不出）
			const goodsId = String(this.goodsId === null || this.goodsId === undefined ? '' : this.goodsId);
			if (!this.installed || Number(goodsId.split('_')[0]) <= 0) { return; }
			const key = goodsId + '|' + String(this.extend || '');
			this.entry = null;
			this.loading = true;
			this.$api('send_friend.gift.entry', {
				goods_type: this.goodsType, goods_id: goodsId, extend: this.extend || '',
			}).then((ret) => {
				// 商品/规格换了这一拍就作废（专栏里点进另一门课、圈子换有效期时不许把上一拍写回来）
				if (this.gone() || this.goodsKey() !== key) { return; }
				this.loading = false;
				this.entry = this.parseEntry(ret && ret.data);
				this.notifyVisible();
			}).catch((err) => {
				if (this.gone() || this.goodsKey() !== key) { return; }
				this.loading = false;
				this.entry = null;
				// 请求层拦下的「插件未装 / init 未就绪」：整枚收掉，不再重试（flag 已就地翻成 false）
				if (err && err.plugin) { this.installed = false; }
				this.notifyVisible();
			});
		},
		/** 当前商品 + 规格的比对键（换商品/换规格两轴，两处共用一份） */
		goodsKey() {
			const id = String(this.goodsId === null || this.goodsId === undefined ? '' : this.goodsId);
			return id + '|' + String(this.extend || '');
		},
		/**
		 * 提交订单页落页（唯一拼法）
		 * @param {String} extend 规格位（圈子 `规格ID_价格`）；不传就用后端/宿主给的那一枚
		 * @param {Number} max 份数上限；不传就吃本组件手里那份载荷（manual 宿主换了规格后 entry 可能正在重取）
		 * @return {String}
		 */
		submitUrlFor(extend, max) {
			const entry = this.entry || {};
			// 下单链要的 goodsId：会员卡是 `卡ID_下标`，圈子是数字 ID；后端已经把解析后的那枚下发
			const goodsId = entry.order_goods_id || this.goodsId;
			const item = {
				goodsId: String(goodsId),
				goodsType: this.goodsType || 'course',
				count: 1,
			};
			const ext = String(extend || entry.extend || this.extend || '');
			if (ext) { item.extend = ext; }
			// `goodsList` **编码后进地址**（2026-10-29：买课后点「送好友」跳提交订单页白屏）。
			// 全站其余购买流是把明文 JSON 直接拼进 query（`[{"goodsId":...}]`），开发者工具与 H5
			// 都吃得下，但地址里的裸引号 `"` 在真机/转发链路上不是合法 query 字符，被截断后
			// 页面壳那一行 `JSON.parse` 就抛、整页停在白屏。
			// 下单页壳本身已经支持这一档（`pages/order/submit/js.vue`：以 `%5B%7B` 开头先
			// `decodeURIComponent` 再 parse），所以两端读到的仍是同一份数组，字段一个不变。
			let url = '/pages/order/submit/submit?sf=1&goodsList=' + encodeURIComponent(JSON.stringify([item]));
			// `type` 只在非课程那三类补：提交页试算与选券按 `order_type` 分档（`order.calculate` 的
			// switch 吃这一枚），缺了它圈子/会员/练习会按 `goods` 算出一份错价再被回体覆盖。
			// 课程沿用旧形态（不传），逐字不变。
			const type = this.goodsType && this.goodsType !== 'course' ? this.goodsType : '';
			if (type) { url += '&type=' + type; }
			const limit = Number(max) > 0 ? Number(max) : this.maxPerOrder;
			if (limit) { url += '&sf_max=' + limit; }
			return url;
		},
		/**
		 * 进下单页（标准提交订单页，`sf=1` 那一档，M-P2）。
		 *
		 * 顺序两条都不能反：**先标脏、后导航** —— 导航之后本页就进 onHide 了，
		 * 反了的话 `stateDirty` 写在一次已经结束的 onShow 之后，回来时判据②看不到账脏。
		 *
		 * **点击这一拍再问一次后端**（2026-10-20 用户实报的那条链）：本页可能停留到商家改了
		 * 「可赠送内容」之后，手里那一枚 flag 成了旧值；不复核就会把人送进一张必然被
		 * `gift/create` 拦下的下单页。复核不过 = 就地入口收掉 + 一句原因，`open` 不发、导航不发。
		 * 复核请求失败也不导航：建单口同样要走网络，此刻放进去只是把失败推迟到「提交订单」。
		 */
		openSubmit() {
			if (this.checking) { return; }
			if (!uni.getStorageSync('user_token')) {
				// 未登录：让请求层那一句「请登录后继续操作」把人说清楚（口径同课程页 buyCheck）
				this.$api('user.info.index', {}).catch(() => {});
				return;
			}
			const that = this;
			const key = that.goodsKey();
			that.checking = true;
			that.$api('send_friend.gift.entry', {
				goods_type: that.goodsType, goods_id: that.goodsId, extend: that.extend || '',
			}).then((ret) => {
				that.checking = false;
				// 复核期间商品/规格换了：这一拍作废，交给新商品那一次重取
				if (that.gone() || that.goodsKey() !== key) { return; }
				const data = that.parseEntry(ret && ret.data);
				if (!data) {
					// 只认 flag 为 1：复核不过就把入口收掉（与首屏那一份同一判据）
					that.entry = null;
					// 入口收掉了 ⇒ 宿主那一格也不许继续占宽度（同 `notifyVisible` 的注释）
					that.notifyVisible();
					// 后端刚说了「未安装」的那一档：说「功能未开放」，不要说成「这件商品不能送」
					uni.showToast({
						title: pluginMissing('send_friend') ? '送好友功能暂未开放' : '该内容暂不支持赠送',
						icon: 'none'
					});
					return;
				}
				that.entry = data;
				that.notifyVisible();
				that.$emit('open', {
					goods_type: that.goodsType,
					goods_id: String(that.goodsId),
					extend: String(data.extend || that.extend || ''),
					max_per_order: Number(data.max_per_order) || 0,
					submit_url: that.submitUrlFor(String(data.extend || that.extend || '')),
				});
				// manual：宿主自己挑规格/做主流程，导航由宿主用 `submitUrlFor()` 发
				if (!that.manual) { that.$nav.to(that.submitUrl, 'local'); }
			}).catch((err) => {
				that.checking = false;
				if (that.gone()) { return; }
				// 插件未装/未就绪被请求层拦下：收掉入口，不弹「网络异常」（那不是网络问题）
				if (err && err.plugin) { that.installed = false; that.entry = null; that.notifyVisible(); return; }
				uni.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
			});
		},
	},
};
</script>

<style scoped>
/* 栏内那枚入口，形态按落点分两档（见模板头注释：照同栏兄弟的样子）：
   `--control`：控制栏里那一枚 = 图标 + 文字两格，口径与 `.control-btn` 同款
              （同栏各枚等分、文字 12px #888，两层之间的行距由行盒自然给、不另写 gap）；
   未订阅的购买栏不再挂本组件（2026-10-27 用户点名），原先那一档 `.sfa-entry--order`
   （纯图标、`flex: none`）连同模板里的 `order` 分支一起撤掉，不留死类。 */
.sfa-entry {
	text-align: center;
}

/* ⚠ 这一格被同一条款点名过三次（2026-10-29）：先「送好友三个字变成分三行」、再「宽度占了一半」、
   再「收藏、评论、分享、送好友 四个按钮不等宽」。前两轮都在跟「宽度写在哪一层」较劲，第三轮才落到根因：
   **宽度根本不在本文件、也不在底栏组件的样式表**（那两处都够不着这一枚，见 `src/App.vue` 里
   `.sf-control-slot / .tbb-slot` 那一段）。本文件只负责两件端相关的事：
     · H5：组件根**就是**底栏那一行的 flex 项 ⇒ 根上给 `flex: 1 1 0; min-width: 0`，与同栏
       `.control-btn` 逐值相同，四枚（或五、六枚）恒等分；
     · MP：flex 项是**宿主节点**，根只是宿主里的唯一子节点 ⇒ 根铺满宿主（`width: 100%`），
       宿主的等分由全局表那条 `.sf-control-slot` 给。
   `width` 只许出现在 MP 条件块里：H5 无条件写 `width:100%` 就是把 basis 撑成整条栏宽，
   再按 shrink 分剩余 ⇒ 又回到「送好友占一半」那一版。 */
.sfa-entry--control {
	flex: 1 1 0;
	min-width: 0;
}
/* #ifdef MP */
.sfa-entry--control {
	width: 100%;
}
/* #endif */

.sfa-entry--control .sfa-entry-text {
	font-size: 12px;
	line-height: 16px;
	color: #888;
	/* 同栏兄弟（收藏/评论/分享）都是两个字，这一枚是三字：不许再折行
	   （宿主窄到极限时宁可整枚收窄，也不把一句话拆成三行） */
	white-space: nowrap;
}

/* 商详标题下方那一长条（图2）：奶白底 + 圆角，左侧深蓝方块内嵌白礼盒，右侧「送好友」+ 细箭头。
   尺寸按图2 实测（375 宽截图 ÷ 2.33）：条高 36、圆角 8、左右内衬 10、图标方块 20、
   两句文字 12px（与上方日期同字号）。
   上边距不写在样式表里（2026-10-28 先点名「sfa-entry sfa-entry--card 去掉上边距」⇒ 删掉那条
   `margin-top: 8px`；同日又点名「要留出上边距，注意，仅在这个页面调整」）：本条 `margin-top` 恒为 0，
   块与块之间的间距由宿主按页传 `marginTop`（当前只有课程商详传 8，圈子两页 / 练习 / 会员中心不传），
   改这类间距时不要再在样式表里补回来——写死一枚就是四个宿主全吃，正是第一次被点名的那一条。 */
.sfa-entry--card {
	display: flex;
	align-items: center;
	width: 100%;
	height: 36px;
	padding: 0 10px;
	box-sizing: border-box;
	border-radius: 8px;
	background: #FFF4E8;
	text-align: left;
}

.sfa-entry--card .sfa-card-icon {
	flex: none;
	width: 20px;
	height: 20px;
	border-radius: 5px;
	background: #004C8B;
	display: flex;
	align-items: center;
	justify-content: center;
}

.sfa-entry--card .sfa-card-title {
	flex: 1;
	min-width: 0;
	margin-left: 10px;
	font-size: 12px;
	line-height: 16px;
	color: #1B3D68;
}

.sfa-entry--card .sfa-card-action {
	flex: none;
	display: flex;
	align-items: center;
}

.sfa-entry--card .sfa-card-action-text {
	margin-right: 2px;
	font-size: 12px;
	line-height: 16px;
	color: #1B3D68;
}
/* 原先还有一档 `.sfa-entry--inset`（页面第一层直接摆放、自带给左右/上外边距），
   只有 2026-10-28 补的圈子首页那一枚用它；2026-10-29 用户点名「圈子首页不要显示送好友卡片」
   之后那一枚整枚撤掉，这一档连同 `inset` prop 一起删净（零调用点的档位不留）。 */

</style>
