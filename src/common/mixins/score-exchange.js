/**
 * 积分兑换模式（九类商详共用）
 *
 * 积分商城卡片跳任意一类商详时带 `score_goods_id`；页面在 `onLoad` 调
 * `initScoreExchange(options)` 取到积分商品行，价格区/按钮改成积分口径，
 * 下单行带上 `score_goods_id`。不在每个页面各抄一份取数。
 *
 * 2026-11-08 加「规格」这一轴（用户点名：多规格商品要能逐档勾选可兑换的规格，
 * 学员进商详只看得到勾过的那几档）：
 *  · `scoreExchange.spec_ids` 由后端 `GoodsSpecReader::effectiveIds()` 算好下发，
 *    前端**不重判**（下架/售罄/没勾过全在后端一处判）；
 *  · 页面用 `scoreSpecAllows(id)` 过滤自己那一排规格，用 `scoreSpecOptions(list, keyFn)`
 *    一步拿到「过滤后仍带原下标」的清单（会员卡/教务套餐的规格下标就是订单里的那个值，
 *    过滤后不能重新编号，否则下单会指到别的一档）。
 */
export default {
	data() {
		return {
			scoreExchangeId: 0,
			scoreExchange: {},
			// 积分商品详情取不到 / 已不可兑（后端 detail 会直接拒）：页面按「不可兑」收口，
			// 不许退回「这件商品全部规格随便买」——那正是这次要堵的那条路
			scoreExchangeError: '',
			// 积分商品这一腿是否已收尾（成功 / 失败都算）：价格区读 `scoreExchangeScore`，
			// 没落地前那一格是 0 —— 先画「0 积分」再跳成真值，读起来就是「这个商品不要钱」
			scoreLoaded: false,
		};
	},
	computed: {
		isScoreExchange() {
			return this.scoreExchangeId > 0;
		},
		/**
		 * 积分商品这一腿已收尾（非兑换模式恒 true）
		 *
		 * 页面把它并进自己的骨架撤出判据（硬约束 22：一个加载态盖住多条腿时，
		 * 收口必须是「整条链都收尾」）——积分商品详情与商品详情是两条并行请求，
		 * 只按先回来的那一条撤骨架，价格区会先闪一遍 0 积分。
		 */
		scoreReady() {
			return !this.isScoreExchange || this.scoreLoaded;
		},
		scoreExchangeScore() {
			return Number(this.scoreExchange.score || 0);
		},
		scoreExchangeStock() {
			return Number(this.scoreExchange.stock || 0);
		},
		/** 这一行积分商品吃不吃规格（后端下发；吃规格才过滤规格排） */
		scoreHasSpec() {
			return !!(this.scoreExchange && this.scoreExchange.has_spec);
		},
		/** 允许兑换的规格 id 清单（空数组 + scoreHasSpec=true ⇒ 勾过的档全没了） */
		scoreSpecIds() {
			const list = this.scoreExchange && this.scoreExchange.spec_ids;
			return Array.isArray(list) ? list.map((id) => Number(id)) : [];
		},
	},
	methods: {
		initScoreExchange(options) {
			const id = Number((options && options.score_goods_id) || 0);
			this.scoreExchangeId = id;
			if (id > 0) {
				this.loadScoreExchange();
			}
		},
		loadScoreExchange() {
			this.$api('app.score.detail', { score_goods_id: this.scoreExchangeId }).then((res) => {
				// 已出栈的页面不再写 data（M26②）
				if (this._isDestroyed || this._isBeingDestroyed) { return; }
				// 收尾标记写在三条退出分支之前：成功 / 被拒 / 回调抛错都必须让骨架能撤
				this.scoreLoaded = true;
				if (res.code === 1) {
					this.scoreExchange = res.data || {};
					this.scoreExchangeError = '';
					// 允许的规格清单到手后，各页按自己的口径落一次首帧（规格排/默认选中）
					if (typeof this.onScoreExchangeReady === 'function') {
						this.onScoreExchangeReady(this.scoreExchange);
					}
				} else {
					// 详情被拒（下架 / 勾过的规格全失效）：记下原因，页面据此收口
					this.scoreExchangeError = res.msg || '该积分商品暂不可兑';
					if (res.msg) {
						this.$u && this.$u.toast ? this.$u.toast(res.msg) : uni.showToast({ title: res.msg, icon: 'none' });
					}
					if (typeof this.onScoreExchangeReady === 'function') {
						this.onScoreExchangeReady(null);
					}
				}
			}).catch(() => {
				// 网络异常同样要收口：否则页面停在骨架上、价格区永远出不来（硬约束 22 的退出分支一次写全）
				if (this._isDestroyed || this._isBeingDestroyed) { return; }
				this.scoreLoaded = true;
				this.scoreExchangeError = this.scoreExchangeError || '积分商品加载失败';
				if (typeof this.onScoreExchangeReady === 'function') {
					this.onScoreExchangeReady(null);
				}
			});
		},
		/**
		 * 这一档规格能不能在积分兑换里用
		 *
		 * 不在兑换模式 ⇒ 恒 true（普通购买链逐字不变）；兑换模式但不吃规格 ⇒ 也 true；
		 * 吃规格 ⇒ 只认后端下发的那份清单。
		 */
		scoreSpecAllows(specId) {
			if (!this.isScoreExchange || !this.scoreHasSpec) {
				return true;
			}
			return this.scoreSpecIds.indexOf(Number(specId)) >= 0;
		},
		/**
		 * 过滤一列规格，并保留**原下标**（`index`）
		 *
		 * 返回 `[{ item, index }]`：`index` 是该元素在自己原数组里的位置。
		 * 会员卡（`cardId_下标`）与教务套餐（确认页按 `skus` 下标取档）都必须用它下单，
		 * 过滤后重新编号会把「第 2 档」指到别的价上。
		 *
		 * @param array list 原始规格数组
		 * @param function keyOf 取规格 id（默认取 `item.id`；签名 (item, index)，会员卡要的是下标）
		 * @return array
		 */
		scoreSpecOptions(list, keyOf) {
			const rows = Array.isArray(list) ? list : [];
			const getter = typeof keyOf === 'function'
				? keyOf
				: (item) => Number(item && item.id);
			const out = [];
			rows.forEach((item, index) => {
				if (this.scoreSpecAllows(getter(item, index))) {
					out.push({ item, index });
				}
			});
			return out;
		},
		/** 下单行补积分商品 id（调用点在拼 goodsList 时统一走这里） */
		withScoreGoods(goods) {
			if (this.scoreExchangeId > 0) {
				goods.score_goods_id = this.scoreExchangeId;
			}
			return goods;
		},
	},
};
