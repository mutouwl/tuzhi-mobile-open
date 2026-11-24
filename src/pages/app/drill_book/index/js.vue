<script>

// 拼团「加入别人的团」上下文（团详情「立即加入」带 gb_team 一组参数进本页）
import { readGroupBuyJoin } from '@/common/utils/group-buy-join.js';
// 目录树可见行 + 导引线（与错题本、收藏共用同一份）
import { buildCatalogRows } from '@/common/utils/drill-book-catalog.js';
// 目录层级树版式（缩进 / 导引线 / 折叠圆钮），三页同一只组件
import DrillCatalog from '../components/drill-catalog.vue';
// 积分兑换模式（九类商详共用：读 score_goods_id、价格/按钮换积分口径、下单行带 score_goods_id）
import scoreExchange from '@/common/mixins/score-exchange.js';
// 样式对象 → 串（小程序端 `:style` 只吃字符串，见 components computed 里的注释）
import { styleText } from '@/common/utils/poster-theme.js';

export default {
	components: { DrillCatalog },
	mixins: [scoreExchange],
	data() {
		return {
			// 首屏加载态：初值 true，三条退出分支都收（成功 / 业务失败 / 网络异常），
			// 承载它的壳是通用加载页 `tz-loading-page`（正文可装修，加载前无法预知版式）
			pageLoading: true,
			// 登录态放 data 而不是 computed：本工程没有 Vuex（全站零 `$store`），
			// 读 `$store.state.user.token` 会抛错被兜底吞掉，判据恒为 false ⇒
			// 已登录用户也一直显示「登录后使用」。且 `uni.getStorageSync` 不是响应式依赖，
			// 写成 computed 会在登录返回后仍吃缓存，故由 onLoad/onShow 各刷一次。
			isLogin: false,
			bookId: 0,
			// 后端把目录树放在 `data.catalogs`（与 drill_book 同级），**不在** drill_book 里面：
			// 写进 book.catalogs 才对得上「目录行 / 做题 / 继续」这一整条链
			// （2026-11-18 实测：目录恒为空 → 底栏整枚按钮消失、只剩一条白底框）
			book: { catalogs: [] },
			// 关联课程（关联课程档的商品介绍形态用；后端 `data.course` = 第一门，兼容位）
			course: null,
			// 关联课程整组（多选；后端 `data.courses`）。购买态那张卡按它逐门摆，
			// 只有一门时版式与改多选之前完全一致。
			courses: [],
			// 关联课程多于一门时，底栏那一枚先弹操作菜单让用户挑一门（M18 选项类菜单）
			modal: { course: false },
			courseActions: [],
			navs: [],
			stat: { total_count: 0, answered_count: 0, error_count: 0, progress: 0, accuracy: 0 },
			isAuth: false,
			authMsg: '',
			pageParams: {},
			// 装修配置（后端 decorOf 下发；未装修时给默认四件套的顺序）
			decor: { page: {}, components: [] },
			// 目录预览的折叠态（按目录 id 记；只在本次会话内保留）
			catalogCollapsed: {},
			// 目录行「继续」请求中：连点只发一发，避免开两条练习记录
			resuming: false,
			// 拼团区经 @ready 上抛的活动摘要（{ text, inTeam, activity, price_text } / null）：
			// `text`/`price_text` 喂底栏那枚拼团按钮，`activity.buyers` 喂封面左上角弹幕，
			// `activity` 非空时信息卡的价格行收起（一屏只留拼团那一个价）。
			// 两条都只在拼团区组件里取一次，本页只做一枚转发（不给这一页另开第二条拼团取数链）
			gbEntry: null,
			// 「我在这一场拼团里已有进行中的团」：底栏那枚「立即购买」收不收吃它（PRD 2026-10-27）
			gbInTeam: false,
			// 受邀参团的上下文（团详情「立即加入」带 gb_team 一组参数进本页时才有）。
			// 只活在本页实例上，不写 storage —— 退出后从别处重进就是正常的自己开团链。
			gbJoinCtx: null,
			gbJoinMode: false,
			// 购买弹幕素材：来自拼团区 @ready 上抛的活动本体，只喂封面左上角那一枚
			gbBuyers: [],
			// 「别处改过用户态」的账（口径同课程商详 `stateDirty`）：送好友、拼团这两条下单链
			// 都由插件组件自己导航，本页只标这一枚，回来收一次就清（只用于决定拼团区要不要重取）
			stateDirty: false,
		};
	},
	computed: {
		/** 页面名称：装修页设置的名称优先，其次刷题本名 */
		pageName() {
			const d = this.decor || {};
			return (d.page && d.page.name) || (this.book && this.book.name) || '刷题本';
		},
		/**
		 * 装修组件列表；后端没给时按默认顺序兜底（不装修也能出内容）
		 *
		 * `swiper` / `banner` 是上一版的封面组件：封面现在是固定样式（.db-cover-box 单图 + 名称），
		 * 不再参与装修排序 —— 老装修数据里残留的这两档在这里滤掉，否则会在封面下面再出一张重复大图。
		 */
		components() {
			const list = ((this.decor && this.decor.components) || [])
				.filter(c => c && c.type !== 'swiper' && c.type !== 'banner');
			const base = list.length ? list : [
				{ type: 'nav', config: {} },
				{ type: 'overview', config: {} },
				{ type: 'catalog', config: {} },
			];
			// 小程序端 `:style` 只吃字符串，两档写法都不行：
			// ① 模板里直接写方法调用（`:style="boxStyleOf(comp)"`）连 mp 编译都过不去——
			//    uni-template-compiler 的 style 白名单没有 CallExpression，报「:style 不支持 ... 语法」；
			// ② 先算成对象、再绑变量（`:style="comp.cssBox"` 拿到对象）会被 wxml toString 成
			//    `[object Object]`，样式整批静默丢掉（ui-baseline-mobile.md §4）。
			// 故在取数这一处一次算成串，模板只绑成员；H5 与小程序同一份结果。
			return base.map((c) => Object.assign({}, c, {
				cssBox: styleText(this.boxStyleOf(c)),
				cssBand: styleText(this.overviewBandStyle(c)),
				cssAdBox: styleText(this.adBoxStyle(c)),
				cssAdCell: styleText(this.adCellStyle(c)),
				cssAdCorner: styleText(this.adCornerStyle(c)),
				cssAdScrollCell: styleText(this.adScrollCellStyle(c)),
			}));
		},
		/** 导航模板三档（一行三个 / 一行四个 / 一行多个）：落在 .db-nav-* 上换列宽 */
		navStyle() {
			const navComp = this.components.find(c => c.type === 'nav');
			const cfg = (navComp && navComp.config) || {};
			return { template: cfg.template || 'four' };
		},
		/** 导航文本样式（字号 / 颜色 / 粗细）：返回串，小程序端绑对象会变 `[object Object]` */
		navNameStyle() {
			const navComp = this.components.find(c => c.type === 'nav');
			const cfg = (navComp && navComp.config) || {};
			const style = {};
			if (cfg.font_size) style.fontSize = Number(cfg.font_size) + 'px';
			if (cfg.text_color) style.color = cfg.text_color;
			if (cfg.text_style === 'bold') style.fontWeight = 600;
			return styleText(style);
		},
		/** 页面背景（颜色 / 图片 + 文字色）：落到根容器；返回串（同 navNameStyle 的理由） */
		pageStyle() {
			const p = (this.decor && this.decor.page) || {};
			const style = {};
			if (p.bg_image) {
				style.backgroundImage = 'url(' + p.bg_image + ')';
				style.backgroundSize = '100% auto';
				style.backgroundRepeat = 'no-repeat';
				style.backgroundPosition = 'center top';
				style.backgroundColor = '#f7f8fa';
			} else if (p.bg_color) {
				style.backgroundColor = p.bg_color;
			}
			style.color = p.text_color === 'white' ? '#ffffff' : '#1d2129';
			return styleText(style);
		},
		/**
		 * 「刷题本介绍」（基本信息「详情」整篇富文本）的显隐
		 *
		 * 由装修页「页面设置 → 刷题本介绍」控制；老装修数据没有这一键，按显示处理。
		 * 已授权态与未授权（购买）态两处都吃这一档：商家关掉就是整篇不露。
		 */
		showDetail() {
			const p = (this.decor && this.decor.page) || {};
			return p.show_detail !== false;
		},
			unansweredCount() {
				const total = Number(this.stat.total_count || 0);
				const answered = Number(this.stat.answered_count || 0);
				return Math.max(0, total - answered);
			},
			/** 商品介绍形态的价格（后端 pay_price 是数字；只保留两位，避免 1.0000000001 这种） */
			priceText() {
				const p = Number(this.book && this.book.pay_price);
				if (!isFinite(p) || p <= 0) return '0';
				return String(Math.round(p * 100) / 100);
			},
			/**
			 * 微信小程序虚拟支付（2026-11-23）：后端已只在「配置勾了 drill_book ∧ 小程序端」时下发 1；
			 * 这里再锁一次平台，防止 H5 读到缓存里的旧接口体把代币价当人民币展示
			 */
			isVirtualPay() {
				return Number(this.book && this.book.is_virtual_pay) === 1
					&& uni.getStorageSync('platform') === 'wxMiniProgram';
			},
			/** 代币名称（与课程商详同一枚系统配置；缺省「金币」） */
			coinName() {
				return this.$tools.systemConfig('coin_name') || '金币';
			},
			/** 关联课程档（与后端 `is_bind_course` 同源，不另起一套判据） */
			isBindCourse() {
				return Number(this.book && this.book.is_bind_course) === 1;
			},
			/**
			 * 购买态信息卡里要摆的关联课程（多选后逐门摆）
			 *
			 * 两档都收：后端新下发的 `courses` 整组；老接口只有 `course` 单门时回落成一组。
			 * 判据仍与改多选之前一致（`!book.is_free` 才摆，免费档挂课等于没门槛）。
			 */
			bindCourses() {
				if (Number(this.book && this.book.is_free)) return [];
				const list = Array.isArray(this.courses) ? this.courses : [];
				return list.filter(c => c && c.id);
			},
			/**
			 * 有效期文案：三档与后端 `DrillBook::endTimeOf()` 同一份口径（长期 / N 天月年 / 固定到期）
			 * 端上只读后端给的类型与参数拼文案，不自己算到期时刻。
			 */
			validityText() {
				const type = String((this.book && this.book.validity_type) || 'long');
				if (type === 'long') return '长期有效';
				if (type === 'fix') {
					const fix = String((this.book && this.book.validity_fix_time) || '');
					return fix ? fix.slice(0, 10) + ' 到期' : '固定时间到期';
				}
				const diy = this.book && this.book.validity_diy_time;
				let parsed = diy;
				if (typeof diy === 'string') {
					try {
						parsed = JSON.parse(diy);
					} catch (e) {
						parsed = null;
					}
				}
				const unitMap = { day: '天', month: '个月', year: '年' };
				const value = Number(parsed && parsed.value);
				const unit = unitMap[parsed && parsed.type] || '天';
				return value > 0 ? ('购买后 ' + value + unit) : '自定义时长';
			},
			/**
			 * 吸底操作栏挂不挂：就是改版前那四档（登录 / 购买 / 关联课程 / 显一句原因），
			 * 判据仍只认 `!pageLoading ∧ book.id ∧ !isAuth` —— 改版只换了承载它的壳
			 * （`tz-bottom-btn`，与课程商详同一条底栏），四档文案与去处逐条照旧。
			 */
			showBottomBar() {
				return !this.pageLoading && !!this.book.id && !this.isAuth;
			},
			/** 不可点那一档：只有「暂无使用权限」要置灰（其余三档都是可点的动作） */
			buyDisabled() {
				// 积分兑换模式：积分商品被拒（下架 / 不可兑）时整枚按钮按不可点收口
				if (this.isScoreExchange && this.scoreExchangeError) return true;
				return this.isLogin && !this.book.is_pay && !this.isBindCourse;
			},
			/**
			 * 底栏主按钮文字：改版前那四档一一对应（未登录 → 登录后使用 / 付费 → 立即购买 /
			 * 关联课程 → 购买关联课程后使用 / 其余 → 后端那句原因）。
			 * **不把价格写进按钮**：价已在信息卡与拼团横幅两处给，按钮复述一遍读出来就是第二个价
			 * （课程商详的「立即订阅」也是不带价的）。
			 */
			buyBtnText() {
				if (!this.isLogin) return '登录后使用';
				if (this.isScoreExchange && this.scoreExchangeError) return '暂不可兑换';
				if (this.book.is_pay) return this.isScoreExchange ? '立即兑换' : '立即购买';
				if (this.isBindCourse) return '购买关联课程后使用';
				return this.authMsg || '暂无使用权限';
			},
			/**
			 * 底栏主按钮的去处：同样四档，判据与 `buyBtnText` 逐条对齐
			 * （改版前那四枚 `u-button` 各自的 `@click`，现在收在这一处，不在模板里再判一遍）
			 */
			buyAction() {
				if (!this.isLogin) return 'login';
				if (this.book.is_pay) return 'buy';
				if (this.isBindCourse) return 'course';
				return '';
			},
			/**
			 * 底栏主按钮收不收：正在这一场拼团中 / 受邀参团两档都收起
			 * （与课程商详 `hide-main` 同一判据：不给一枚点了会被后端拒的「立即购买」）
			 */
			gbHideMain() {
				return this.gbInTeam || this.gbJoinMode;
			},
			/**
			 * 信息卡价格行显不显示：拼团进行中收起（2026-10-30 课程商详第五轮同一口径
			 * 「拼团价要复制覆盖原来的价格」）—— 一屏只有一个价，
			 * 判据吃拼团区 `@ready` 上抛的 `activity`，与底栏拼团按钮、封面弹幕同一份来源。
			 */
			priceShown() {
				// 积分兑换模式不摆拼团（见模板 v-if），价格行恒显示积分面值
				if (this.isScoreExchange) return true;
				return !(this.gbEntry && this.gbEntry.activity);
			},
		/**
		 * 目录树的可见行（任一目录折叠时收起它下面整棵子树）
		 *
		 * 行数据与导引线算法只有一份：`common/utils/drill-book-catalog.js`（错题本、收藏同用）。
		 * 全层级展开：早前 `if (level > 1) return` 只放两层，第 3～5 层在端上永远看不见；
		 * 上限 5 级由后台编辑器与 `CatalogSave::MAX_LEVEL` 管，端上不再截断。
		 */
		catalogRows() {
			return buildCatalogRows((this.book && this.book.catalogs) || [], this.catalogCollapsed);
		},
	},
		methods: {
			/** 登录态：唯一真源是 `user_token` 缓存（全站 29 处同此，见 common/utils/router.js 的 checkLogin） */
			syncLogin() {
				this.isLogin = !!uni.getStorageSync('user_token');
			},

		/**
		 * 「组件样式」三段落在端上的壳：左右内边距 / 上下内边距 / 组件背景。
		 *
		 * 后台装修页每一枚组件都有这三格（参照产品同此）。端上不消费 = 商家在面板里
		 * 调了内边距与背景色、手机上一点变化都没有（W107「装修改了端上必须跟着变」）。
		 * 没配 `box` 的老数据一律回空对象，版式与原先完全一致（不改变既有装修观感）。
		 */
		boxStyleOf(comp) {
			const b = (comp && comp.config && comp.config.box) || {};
			const style = {};
			if (b.transverse) {
				style.paddingLeft = b.transverse + 'px';
				style.paddingRight = b.transverse + 'px';
			}
			if (b.vertical) {
				style.paddingTop = b.vertical + 'px';
				style.paddingBottom = b.vertical + 'px';
			}
			if (b.bg_style === 1 && b.bg_value) {
				style.background = b.bg_value;
			} else if (b.bg_style === 2 && b.bg_image) {
				style.backgroundImage = 'url(' + b.bg_image + ')';
				style.backgroundSize = '100% auto';
				style.backgroundRepeat = 'no-repeat';
			}
			return style;
		},
		/**
		 * 总览卡顶部那条浅蓝进度带的内衬：带子要「贴满卡片上沿与左右边」，
		 * 而卡片自己带着 boxStyleOf 给的 padding，所以负 margin 必须等于那份内边距。
		 * 商家在「组件样式」里把内边距调大/调小，带子的出血量与内衬跟着变，
		 * 不然带子会缩在卡片中间、两侧露出白边。
		 *
		 * 两档默认值取自 `.db-card` 的固定内衬（14px 12px）：boxStyleOf 只在配了值时才覆盖，
		 * 所以没配时卡片仍是 14 / 12，带子的负 margin 也照这两个值走。
		 */
		overviewBandStyle(comp) {
			const b = (comp && comp.config && comp.config.box) || {};
			const x = b.transverse || 12;
			const y = b.vertical || 14;
			return {
				marginLeft: -x + 'px',
				marginRight: -x + 'px',
				marginTop: -y + 'px',
				paddingLeft: x + 'px',
				paddingRight: x + 'px',
			};
		},
		/**
		 * 装修组件里的图广跳转：兼容三档数据
		 * ① 老数据纯地址串（http 走 webview，站内路径直接跳）；
		 * ② 后台 change-link 写的 `{type,src,name}` 对象；
		 * ③ 字面量 `{}` / 空串（= 未配置，静默不跳）
		 */
		goLink(link) {
			if (!link) return;
			const raw = typeof link === 'object' ? link : this.parseLink(link);
			if (!raw || !raw.src || raw.type === 'unlink') return;
			if (/^https?:/.test(raw.src)) {
				uni.navigateTo({ url: '/pages/public/webview/webview?url=' + encodeURIComponent(raw.src) });
				return;
			}
			// parseLink 对老数据的站内路径回的是 type='page'（router 没有这一档，按 local 直跳）
			const type = !raw.type || raw.type === 'page' ? 'local' : raw.type;
			this.$nav.to(raw.src, type);
		},
		/**
		 * 组件 link 归一（公告 / 音频共用；与自定义页面同源）
		 *
		 * 后台用全站 change-link 写的是 `{type,src,name}`；上一版刷题本装修只有纯 URL
		 * 输入框，老装修数据里 `link` 就是字符串 —— 这里折成 `{type:'url'}`，两种数据都能跳。
		 * 「不跳转」档（unlink）回落空 type：箭头与点击一并关掉。
		 * @param {Object} comp 装修组件
		 * @returns {Object} {type, src}
		 */
		compLinkOf(comp) {
			const raw = comp && comp.config && comp.config.link;
			if (raw && typeof raw === 'object') {
				if (!raw.type || raw.type === 'unlink') return { type: '', src: '' };
				return { type: raw.type, src: raw.src || '' };
			}
			const url = String(raw || '').trim();
			return url ? { type: 'url', src: url } : { type: '', src: '' };
		},
		/** 组件取文件地址：装修数据里是全站附件行的 `file.fullurl`，老数据是裸地址串（url 列） */
		mediaUrlOf(comp) {
			const cfg = (comp && comp.config) || {};
			const file = cfg.file;
			if (file && typeof file === 'object' && file.fullurl) return String(file.fullurl);
			return String(cfg.url || '').trim();
		},
		/** 图片广告排列档位：1–6（老数据缺 template 时按一行一张） */
		adTemplateOf(comp) {
			const t = Number((comp.config && comp.config.template) || 1);
			return t >= 1 && t <= 6 ? t : 1;
		},
		/** 图片广告外层的间距与左右内衬（与后台「组件样式」同一份取值） */
		adBoxStyle(comp) {
			return {
				gap: (comp.config.gap || 12) + 'px',
				paddingLeft: this.boxStyleOf(comp).paddingLeft,
				paddingRight: this.boxStyleOf(comp).paddingRight,
			};
		},
		/** 圆角（直角 / 圆角半径）——网格、轮播、横滑三档共用 */
		adCornerStyle(comp) {
			return {
				borderRadius: comp.config.corner === 'round' ? ((comp.config.corner_radius || 8) + 'px') : '0',
			};
		},
		/**
		 * 图片广告单格样式：1/2/3 = 等分列宽（扣掉 (N-1) 个 gap）；
		 * 5 = 大图 78%；6 = 小图 32%（露出下一张，提示可横滑）
		 */
		adCellStyle(comp) {
			const t = this.adTemplateOf(comp);
			const gap = Number(comp.config.gap) || 12;
			let width;
			if (t === 5) {
				width = '78%';
			} else if (t === 6) {
				width = '32%';
			} else {
				const n = t <= 3 ? t : 1;
				width = 'calc((100% - ' + (gap * (n - 1)) + 'px) / ' + n + ')';
			}
			// 正方高度与宽度同一算式：百分比 padding 相对容器宽，写死 100% 会让
			// 1/3 宽的格子长成容器那么高（三张变三根竖条）
			return Object.assign({ width, paddingBottom: width }, this.adCornerStyle(comp));
		},
		/** 横滑档的单格：scroll-view 走 inline-block，项间距只能由 margin-right 承担 */
		adScrollCellStyle(comp) {
			const gap = Number(comp.config.gap) || 12;
			return Object.assign({}, this.adCellStyle(comp), { marginRight: gap + 'px' });
		},
		hasComponent(type) {
			return ((this.decor && this.decor.components) || []).some(c => c.type === type);
		},
		/**
		 * 导航图标：icon 列（varchar）→ {type,src}
		 *
		 * 后台用全站导航栏那套 icon-select 写的是 JSON（`{"type":"icon"|"image","src":"..."}`）；
		 * 老数据存的是纯图片地址。端上两种都要认，否则改过一次图标的老数据会渲染成空图。
		 */
		navIconOf(nav) {
			const raw = nav && nav.icon;
			const s = raw && typeof raw === 'object' ? '' : String(raw || '');
			if (raw && typeof raw === 'object') return { type: raw.type || 'image', src: raw.src || '' };
			if (!s) return { type: '', src: '' };
			if (s.charAt(0) === '{') {
				try {
					const o = JSON.parse(s);
					return { type: o.type || 'image', src: o.src || '' };
				} catch (e) {
					return { type: 'image', src: s };
				}
			}
			return { type: 'image', src: s };
		},
		/** 入口显示名：自定义入口的 nav_key 是 custom_<时间戳>，不能当标题用 */
		navKeyName(key) {
			const map = { test: '模拟测试', wrong: '错题本', collect: '我的收藏', history: '练习历史' };
			if (map[key]) return map[key];
			return String(key || '').indexOf('custom_') === 0 ? '自定义入口' : String(key || '');
		},
		/**
		 * 默认渐变方块上叠的那枚白色图标（全站 iconfont 里同义的几档）
		 *
		 * 后端不再下发 `/static/image/drill-book/*.png`（盘上从来没有这套资源），
		 * 四枚固定入口改用「彩色块 + 白色图标」，与参照产品的导航观感同形。
		 */
		defaultNavIcon(key) {
			const map = {
				test: 'flag_fill',
				wrong: 'warning_fill',
				collect: 'collection_fill',
				history: 'createtask_fill',
			};
			if (map[key]) return map[key];
			return 'label_fill';
		},
		finish() {
			this.pageLoading = false;
			uni.stopPullDownRefresh();
		},
		getData(silent) {
			// 首屏才挂加载页；onShow 静默重取保留已渲染内容（回到本页整屏收掉再挂一次 = 闪一次）
			if (!silent) this.pageLoading = true;
			this.$api('app.drill_book.index.detail', { id: this.bookId }).then(res => {
				if (res.code !== 1) {
					this.finish();
					this.$u.toast(res.msg || '获取失败');
					return;
				}
				const d = res.data || {};
				// 目录树在 `data.catalogs`，必须挂回 book.catalogs：模板与 catalogRows
				// 都读 book.catalogs（2026-11-18 之前漏了这一句，目录恒空）
				this.book = Object.assign({}, d.drill_book || {}, {
					catalogs: Array.isArray(d.catalogs) ? d.catalogs : [],
				});
				this.course = d.course || null;
				// 关联课程可多选（2026-11-21 用户点名）：后端 `data.courses` 是整组，
				// `data.course` 保留为第一门（老读方的兼容位）。端上只认 `courses`，
				// 没有就回落成单门那一组，老接口数据不会少摆卡片。
				this.courses = Array.isArray(d.courses) && d.courses.length
					? d.courses
					: (d.course && d.course.id ? [d.course] : []);
				this.navs = d.navs || [];
				this.stat = d.stat || this.stat;
				this.decor = d.decor || { page: {}, components: [] };
				this.isAuth = Number(d.is_auth) === 1;
				this.authMsg = d.auth_msg || '';
				this.finish();
			}).catch(err => {
				this.finish();
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		/**
		 * 点目录行：有子级的行折叠/展开（任意层级），叶子行直接进答题
		 *
		 * 早前只让 `level === 0` 折叠，第 2 层以下有子级的目录（3～5 层都在这一档）
		 * 点了会直接跳答题、收不起子树。
		 */
		onCatalogRow(row) {
			if (row.hasChildren) {
				this.catalogCollapsed = Object.assign({}, this.catalogCollapsed, {
					[row.id]: !this.catalogCollapsed[row.id],
				});
				return;
			}
			// 叶子但没题目：没有可练的内容，不再进设置页（那一趟会报「暂无可练习的题目」）。
			// 这里保持安静：行内右侧那一格已经写着「暂无题目」，不再弹 toast——
			// 早前这一支弹「该目录暂无题目」，进入页面点第一行就先吃一枚提示
			// （2026-11-23 用户点名）
			if (!row.canPractice) {
				return;
			}
			this.goPractice(row);
		},
		/**
		 * 叶子行右侧那枚动作钮：做过这个目录的题 = 「继续」，否则 = 「做题」
		 *
		 * 两档必须 `@click.stop`（模板里已挂）：否则冒泡到整行 = 折叠目录，
		 * 这正是 2026-11-22 用户点名的现象。
		 */
		onCatalogAction(node) {
			if (Number(node.answered_count || 0) > 0) {
				this.resumePractice(node);
				return;
			}
			this.goPractice(node);
		},
		/**
		 * 点「继续」：续这个目录的练习（不再续全本「上一次」）
		 *
		 * 落点由后端 `ResumeTarget::resolve($bookId, $userId, $catalogId)` 定：
		 * 这个目录有没交卷的记录就原样续；没有就按这个目录新开一次、跳过做过的题。
		 * `catalog_id` 必须带上 —— 不带就退化成「全本上一次」，点哪一行都跳到同一支。
		 */
		resumePractice(node) {
			if (this.resuming) return;
			if (!this.isLogin) {
				this.goLogin();
				return;
			}
			if (!this.isAuth) {
				this.$u.toast(this.authMsg || '暂无使用权限');
				return;
			}
			this.resuming = true;
			this.$api('app.drill_book.practice.resume', {
				id: this.bookId,
				catalog_id: Number(node.id || 0),
			}).then(res => {
				this.resuming = false;
				// code !== 1 的那一句（「暂无可以继续的练习」等）由请求拦截器统一 toast
				if (res.code !== 1) return;
				const logId = Number((res.data && res.data.log_id) || 0);
				if (!logId) {
					this.$u.toast('暂无可以继续的练习');
					return;
				}
				this.$nav.to('/pages/app/drill_book/work/work?log_id=' + logId, 'local');
			}).catch(err => {
				this.resuming = false;
				if (err && err.plugin) return;
				this.$u.toast((err && err.msg) || '网络异常');
			});
		},
		goPractice(node) {
			if (!this.isLogin) {
				this.goLogin();
				return;
			}
			if (!this.isAuth) {
				this.$u.toast(this.authMsg || '暂无使用权限');
				return;
			}
			this.$nav.to('/pages/app/drill_book/setting/setting?id=' + this.bookId + '&catalog_id=' + node.id +
				'&name=' + encodeURIComponent(node.name || ''), 'local');
		},
		goNav(nav) {
			if (!this.isLogin) {
				this.goLogin();
				return;
			}
			const id = this.bookId;
			const map = {
				test: '/pages/app/drill_book/paper/paper?id=' + id,
				wrong: '/pages/app/drill_book/wrong/wrong?id=' + id,
				// 我的收藏：参照产品落「公共题目收藏」页（收藏是跨业态的，不归刷题本私有）
				collect: '/pages/app/drill_book/collect/collect?id=' + id,
				history: '/pages/app/drill_book/history/history?id=' + id,
			};
			if (map[nav.nav_key]) {
				this.$nav.to(map[nav.nav_key], 'local');
				return;
			}
			// 自定义入口：link 有三档来源，都要认
			//  ① 空串 / 字面量 `{}`（change-link 没配时的历史脏数据）→ 未配置
			//  ② 后台 change-link 存的 `{"type":"url"|"page"|...,"src":"..."}` JSON
			//  ③ 老数据直接存的整条链接
			// 直接判 `if (nav.link)` 会把 ① 当已配置，拼出 `navigateTo({url:'{}'})` 静默失败
			// ——这正是用户说的「自定义入口点了没反应」（2026-11-18）。
			const raw = nav.link && typeof nav.link === 'object' ? nav.link : this.parseLink(nav.link);
			if (!raw || !raw.src || raw.type === 'unlink') {
				this.$u.toast('该入口暂未配置跳转链接');
				return;
			}
			if (/^https?:/.test(raw.src)) {
				uni.navigateTo({ url: '/pages/public/webview/webview?url=' + encodeURIComponent(raw.src) });
			} else if (raw.type === 'page' || raw.type === 'url_pages') {
				// 自定义页/站内页：src 本身就是页面路径
				uni.navigateTo({ url: raw.src });
			} else {
				// 业务对象（课程/专栏/直播…）：交给全站路由表按 type 拼路径
				this.$nav.to(raw.src, raw.type || 'local');
			}
		},
		/**
		 * 导航 link 归一：字符串（可能是 JSON）→ `{type,src}`
		 *
		 * 空串 / `"{}"` / 解析失败一律回 `{type:'',src:''}`（= 未配置），
		 * 不把脏数据当链接丢给 navigateTo。
		 */
		parseLink(raw) {
			if (!raw) return { type: '', src: '' };
			if (typeof raw === 'object') {
				return { type: raw.type || '', src: raw.src || '' };
			}
			const s = String(raw).trim();
			if (s === '' || s === '{}' || s === '[]') return { type: '', src: '' };
			if (s.charAt(0) === '{') {
				try {
					const o = JSON.parse(s);
					return { type: (o && o.type) || '', src: (o && o.src) || '' };
				} catch (e) {
					return { type: '', src: '' };
				}
			}
			// 老数据：整条链接 / 站内路径
			return { type: /^https?:/.test(s) ? 'url' : 'page', src: s };
		},
		goLogin() {
			// 积分兑换模式要把 score_goods_id 一起带回来：登录后继续按积分口径兑换，
			// 不能退回普通购买（少这一参 = 登录完价格变回现金）
			var back = '/pages/app/drill_book/index/index?id=' + this.bookId;
			if (this.isScoreExchange) {
				back += '&score_goods_id=' + this.scoreExchangeId;
			}
			this.$nav.to('/pages/public/login/login?redirect=' + encodeURIComponent(back));
		},
		/**
		 * 底栏主按钮：四档去处按 `buyAction` 分派（判据与按钮文案同一份，模板里不再判一遍）。
		 * 未登录那一档不去请求 `user.info` —— 那一发失败时没有失败分支，真机表现为「点了没反应」
		 * （课程商详 `buyCheck` 那条注释里的同一个坑）。
		 */
		buyCheck() {
			const action = this.buyAction;
			if (action === 'login') {
				this.goLogin();
				return;
			}
			if (action === 'buy') {
				this.goBuy();
				return;
			}
			if (action === 'course') {
				this.goCourse();
				return;
			}
			// 无权限那一档：按钮已置灰，这里再兜一句后端给的原因（点不到也不静默）
			this.$u.toast(this.authMsg || '暂无使用权限');
		},
		goBuy() {
			const goods = [this.withScoreGoods({
				goodsId: this.bookId,
				goodsType: 'drill_book',
				count: 1,
			})];
			// 与全站购买链同一条：走 $nav.to，goodsList 不再自己 encode
			// （$nav 内部按平台处理；多一层 encodeURIComponent 会让结算页 JSON.parse 失败）
			this.$nav.to('/pages/order/submit/submit?type=drill_book&goodsList=' + JSON.stringify(goods));
		},
		/**
		 * 拼团区 @ready：活动摘要收在本地（有活动给 {text,inTeam,activity}，没有给 null）。
		 * 三处消费同一份：底栏拼团按钮显隐、底栏主按钮收起、信息卡价格行收起、封面弹幕素材。
		 * `join` 是拼团区对「这一页读到的活动是不是团上那一场」的校准结果 ⇒ 用它盖掉 URL 上的乐观初值。
		 */
		gbReady(entry) {
			this.gbEntry = entry;
			this.gbInTeam = !!(entry && entry.inTeam);
			this.gbJoinMode = !!(entry && entry.join);
			this.gbBuyers = (entry && entry.activity && entry.activity.buyers) || [];
		},
		/** 拼团区要把人带去下单：导航由组件自己发，本页只标「用户态可能要变」这一枚账 */
		gbGoPay() {
			this.stateDirty = true;
		},
		/** 送好友同样是一次「用户态可能要变」的外出：与 gbGoPay 同一枚账 */
		sfGoPay() {
			this.stateDirty = true;
		},
		/** 底栏「¥xx 拼团」按钮：就地开拼团区的凑团弹层（壳挂在组件里，不走页面导航） */
		openGb() {
			if (this.$refs.gbArea) { this.$refs.gbArea.openPopup(); }
		},
		/**
		 * 底栏「购买关联课程后使用」的去处
		 *
		 * 只关联了一门：直接进那一门（与改多选之前逐字相同）。
		 * 关联了多门：订阅任意一门都能用，不能替用户挑一门 —— 弹操作菜单让他自己选
		 * （M18：选项类菜单一律 `u-action-sheet`，不自造弹层）。
		 */
		goCourse() {
			const list = this.courses && this.courses.length ? this.courses : [];
			if (!list.length) {
				this.$u.toast('该刷题本未关联课程');
				return;
			}
			if (list.length === 1) {
				this.$nav.to(list[0].id, 'course');
				return;
			}
			this.courseActions = list.map(c => ({
				name: c.name || ('课程 #' + c.id),
				id: c.id,
				subname: c.is_subscription ? '已订阅' : '',
			}));
			this.modal.course = true;
		},
		/** 信息卡里点了某一门关联课程：直接进那一门（与底栏单门那一档同一条链） */
		goCourseItem(c) {
			if (c && c.id) this.$nav.to(c.id, 'course');
		},

		/** 操作菜单里点了某一门关联课程：关菜单并进那一门 */
		pickBindCourse(action) {
			this.modal.course = false;
			if (action && action.id) this.$nav.to(action.id, 'course');
		},
	},
	onLoad(options) {
		this.pageParams = options || {};
		this.bookId = Number(options.id || 0);
		// 积分兑换模式：积分商城卡片会带 `score_goods_id` 进来（九类商详共用这一只 mixin）
		this.initScoreExchange(this.pageParams);
		// 受邀参团：URL 上那一组 gb_* 只活在本页实例上；初值先置真（底栏的单独购买立刻收起，
		// 不给一个早期可点的窗口），拼团区取到活动后由 `@ready.join` 校准
		this.gbJoinCtx = readGroupBuyJoin(this.pageParams);
		this.gbJoinMode = !!this.gbJoinCtx;
		this.syncLogin();
		// 深链接进来也要判安装态（插件未装时页面不该发请求）
		if (this.$tools.systemConfig('app_isinstall_drill_book') === false) {
			this.pageLoading = false;
			this.$u.toast('刷题本功能未安装');
			setTimeout(() => uni.navigateBack(), 1200);
			return;
		}
		if (!this.bookId) {
			this.pageLoading = false;
			return;
		}
		this.getData();
	},
	onShow() {
		// 登录态要在 onShow 再取一次：从登录页/购买回来 token 才落盘
		this.syncLogin();
		// 「别处改了用户态」的账：送好友 / 拼团两条下单链都由插件组件自己导航，回来收一次就清。
		// 这一枚只决定拼团区要不要重取它自己那两条（活动 / 凑团）；本页本体在 onShow 恒静默重取
		const dirty = this.stateDirty;
		this.stateDirty = false;
		// 从答题页/购买回来重取（硬约束 16：退回哪一页，就由那一页自己在 onShow 重取）
		// 静默重取：保留已渲染内容，不把整屏换回加载页
		if (this.bookId && !this.pageLoading) {
			this.getData(true);
		}
		// 拼团区那一份快照只在下单链回来时才会变（付完款要看见自己那一行、活动结束要把整段收掉），
		// 从答题页回来不重取 —— 那一趟与活动无关，多发两条只是白跑
		if (dirty && this.$refs.gbArea) { this.$refs.gbArea.reload(); }
	},
	onPullDownRefresh() {
		if (this.bookId) this.getData(true);
		else uni.stopPullDownRefresh();
	},
	onShareAppMessage() {
		// 全站口径：分享参数统一走 $nav.share（H5 端在这一层设置 JSSDK 卡片，
		// MP 端返回 {title,path,imageUrl}）。标题/封面取刷题本自己的分享字段，缺省回落名称/封面
		const title = (this.book && this.book.share_title) || (this.book && this.book.name) || '刷题本';
		const cover = (this.book && (this.book.share_cover || this.book.cover)) || '';
		return this.$nav.share(title, '', cover);
	},
	onShareTimeline() {
		const title = (this.book && this.book.share_title) || (this.book && this.book.name) || '刷题本';
		const cover = (this.book && (this.book.share_cover || this.book.cover)) || '';
		return this.$nav.share(title, '', cover);
	},
};
</script>
