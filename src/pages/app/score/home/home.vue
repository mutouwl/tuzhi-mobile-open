<template>
	<view class="score-home">
		<view v-if="loaded && scoreStatus !== 1" class="score-disabled">
			<u-empty icon="/static/image/empty.png" width="70" height="70" text="该功能暂不可用" />
		</view>
		<template v-else>
		<!-- 余额区：参照同类产品积分商城（橙黄渐变底 + 右上角竖排「明细 / 规则」贴边） -->
		<view class="score-head">
			<view class="head-coin"></view>
			<view class="head-entries">
				<view class="head-entry" hover-class="head-entry-hover" @tap="goDetail">明细</view>
				<view class="head-entry" hover-class="head-entry-hover" @tap="goRule">规则</view>
			</view>
			<view class="head-main">
				<template v-if="!loaded">
					<view class="score-value-skeleton">
						<view class="score-value-skeleton-bar"></view>
					</view>
					<!-- 这一行与实数据同高占位：不留空档，取数回来不跳（M18⑨d） -->
					<view class="score-meta-skeleton">
						<view class="score-meta-skeleton-bar"></view>
					</view>
				</template>
				<template v-else>
					<view class="score-balance">
						<text class="score-value">{{ balance }}</text>
						<text class="score-unit">积分</text>
					</view>
					<view class="score-meta">
						<text class="score-meta-item">总积分 {{ total }}</text>
						<text class="score-meta-sep">|</text>
						<text class="score-meta-item">冻结积分 {{ frozen }}</text>
					</view>
				</template>
			</view>
		</view>

		<!-- 积分任务 -->
		<view class="score-block">
			<view class="block-head">
				<text class="block-title">积分任务</text>
				<view class="block-more" @tap="goTasks">
					<text>全部任务</text>
					<tz-icon name="enter" :size="12" color="#86909C" />
				</view>
			</view>
			<view v-if="!loaded" class="task-skeleton">
				<view v-for="i in 3" :key="i" class="task-skeleton-row">
					<view class="task-skeleton-main">
						<u-skeleton :loading="true" :animate="true" :title="true" title-width="36%" title-height="15" :rows="1" :rows-width="['58%']" rows-height="12" />
					</view>
					<view class="task-skeleton-btn"></view>
				</view>
			</view>
			<view v-else-if="tasks.length === 0" class="block-empty">
				<u-empty icon="/static/image/empty.png" width="70" height="70" text="暂无积分任务" />
			</view>
			<task-list v-else :tasks="homeTasks" @claim="claimTask" @go="goTask" />
		</view>

		<!-- 积分兑换 -->
		<view class="score-block">
			<view class="block-head">
				<text class="block-title">积分兑换</text>
				<view class="block-more" @tap="goStore">
					<text>更多</text>
					<tz-icon name="enter" :size="12" color="#86909C" />
				</view>
			</view>
			<view class="goods-wrap">
				<!-- 首屏骨架屏（M16）：与真实卡同一只组件（`:skeleton`），封面/标题/价格/按钮逐块对齐，
					 从骨架到数据整版不跳 -->
				<view v-if="goodsLoading">
					<course-item v-for="i in 3" :key="'sk' + i" :skeleton="true" :border="false" :margin="12" />
				</view>
				<u-empty v-else-if="goods.length === 0" icon="/static/image/empty.png" width="70" height="70" text="暂无可兑换商品" />
				<template v-else>
					<course-item v-for="item in goods" :key="item.score_goods_id" :round="true" :border="false"
							:itemId="item.goods_id" :name="item.name" :type="item.type" :typeLabel="item.type_label"
							:cover="item.cover" :score="item.score" :priceMarking="item.price_marking"
							:redeemed="item.redeemed" :showRedeemed="showRedeemed"
							:goodsType="item.goods_type" :subType="item.goods_sub_type"
							:scoreGoodsId="item.score_goods_id" :margin="12" />
				</template>
			</view>
		</view>

		<tz-footer />
		</template>
	</view>
</template>

<script>
import courseItem from '@/components/tz/score-goods-card.vue';
import taskList from '@/pages/app/score/components/task-list.vue';
import taskActions from '@/pages/app/score/mixins/task-actions.js';

export default {
	components: { courseItem, taskList },
	mixins: [taskActions],
	data() {
		return {
			loaded: false,
			balance: 0,
			total: 0,
			frozen: 0,
			scoreStatus: 1,
			tasks: [],
			goods: [],
			goodsLoading: true,
			// 积分商城配置（含「展示兑换量」开关），与积分中心首页同一份接口
			scoreConfig: {},
		};
	},
	computed: {
		// 「展示兑换量」开关（/marketing/score 设置）：缺省 1 = 显示；判据在后端，
		// 端上只读 `app.score.config` 下发的值（硬约束 11）
		showRedeemed() {
			const value = this.scoreConfig && this.scoreConfig.show_redeemed;
			return value === undefined ? true : Number(value) === 1;
		},
		/** 首页只展示前 4 条（待领优先），其余进「全部任务」 */
		homeTasks() {
			const list = this.tasks || [];
			const claimable = list.filter((task) => task.state === 'claimable');
			const rest = list.filter((task) => task.state !== 'claimable');
			return claimable.concat(rest).slice(0, 4);
		},
	},
	onShow() {
		// 首次进：骨架屏；返回本页：静默重取（M23，不闪骨架）
		this.getCenter(this.loaded);
		this.getGoods();
		this.getScoreConfig();
	},
	onPullDownRefresh() {
		this.getCenter(true);
		this.getGoods();
	},
	methods: {
		getCenter(silent) {
			this.$api('app.score.center', {}).then((res) => {
				if (res.code === 1) {
					const data = res.data || {};
					this.balance = Number(data.score) || 0;
					this.total = Number(data.total_score) || 0;
					this.frozen = Number(data.score_frozen) || 0;
					this.scoreStatus = data.score_status === undefined ? 1 : Number(data.score_status);
					this.tasks = data.tasks || [];
				}
				this.loaded = true;
				uni.stopPullDownRefresh();
			}).catch(() => {
				this.loaded = true;
				uni.stopPullDownRefresh();
			});
		},
		/** 首页只摆最新加入的 6 个（完整清单在「更多」→ 积分兑换页） */
		getGoods() {
			this.goodsLoading = this.goods.length === 0;
			this.$api('app.score.list', {
				page: 1, limit: 6, group: 0, search: '', sort: 'desc', order: '',
			}).then((res) => {
				if (res.code === 1) {
					this.goods = Array.isArray(res.data) ? res.data : [];
				}
				this.goodsLoading = false;
				uni.stopPullDownRefresh();
			}).catch(() => {
				this.goodsLoading = false;
				uni.stopPullDownRefresh();
			});
		},
		/** 「展示兑换量」开关：与积分中心首页、DIY 组件同一份配置（app.score.config） */
		getScoreConfig() {
			this.$api('app.score.config', {}).then((res) => {
				if (res.code === 1) {
					this.scoreConfig = res.data || {};
				}
			});
		},
		/** 领取/任务操作后的刷新入口（task-actions mixin 回调） */
		refreshAfterTask() {
			this.getCenter(true);
		},
		goTasks() {
			this.$nav.to('/pages/app/score/tasks/tasks', 'local');
		},
		goRule() {
			this.$nav.to('/pages/app/score/rule/rule', 'local');
		},
		goDetail() {
			this.$nav.to('/pages/user/assets/assets?type=score', 'local');
		},
		goStore() {
			this.$nav.to('/pages/app/score/center/center', 'local');
		},
	},
};
</script>

<style scoped>
.score-home {
	min-height: 100vh;
	background: #fafafa;
	padding-bottom: 16px;
}

/* 余额区：参照产品积分商城同款橙→黄横向渐变
   高度 160px = 余额 64px + 统计行 4 + 22 + 上下内边距各 35px（上下对称，不再预留金币空档） */
.score-head {
	position: relative;
	box-sizing: border-box;
	min-height: 160px;
	padding: 35px 16px;
	overflow: hidden;
	background-color: #f2a03a;
	background-image: linear-gradient(96deg, #ef8531 0%, #f2a03a 56%, #f8ca47 100%);
}

/* 右下角半枚金币（纯 CSS，无图片资源）：外圈 + 内圈，右侧与底部出血裁切 */
.head-coin {
	position: absolute;
	right: -10px;
	bottom: -20px;
	width: 140px;
	height: 140px;
	box-sizing: border-box;
	border: 6px solid rgba(255, 228, 140, 0.16);
	border-radius: 50%;
	background: radial-gradient(circle at 36% 30%, rgba(255, 238, 176, 0.22) 0%, rgba(255, 220, 120, 0.12) 48%, rgba(255, 210, 100, 0.04) 66%, rgba(255, 205, 90, 0) 68%);
}

.head-coin::after {
	content: '';
	position: absolute;
	top: 8px;
	right: 8px;
	bottom: 8px;
	left: 8px;
	border: 2px solid rgba(255, 234, 160, 0.18);
	border-radius: 50%;
}

/* 「明细 / 规则」贴在右上角、上下排列：左侧半圆、右缘顶到屏幕边（与参照页一致）
   两枚共 74px，与「12345 积分」那一行垂直居中（余额行 35~99，top = 35 + (64 - 74) / 2 = 30），
   底边停在 104px，不会压到新加的统计行 */
.head-entries {
	position: absolute;
	top: 30px;
	right: 0;
	z-index: 2;
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10px;
}

.head-entry {
	min-width: 64px;
	height: 32px;
	padding: 0 16px;
	box-sizing: border-box;
	border-radius: 16px 0 0 16px;
	background: #ef8934;
	color: #fff;
	font-size: 13px;
	line-height: 32px;
	text-align: center;
}

.head-entry-hover {
	background: #dd7327;
}

/* 右侧留出「明细 / 规则」那一列，积分位数很多时也不会被按钮压住 */
.head-main {
	position: relative;
	z-index: 1;
	padding-right: 92px;
}

.score-balance {
	display: flex;
	align-items: baseline;
}

.score-value {
	font-size: 38px;
	font-weight: 700;
	color: #fff;
	line-height: 64px;
}

.score-unit {
	margin-left: 6px;
	font-size: 16px;
	color: rgba(255, 255, 255, 0.92);
}

.score-value-skeleton {
	display: flex;
	align-items: center;
	height: 64px;
}

/* 压在橙黄渐变底上的骨架块必须同族更深一档（灰块会与底色撞成两块色系），
   不穿透改 uview 组件内部（M12：小程序里静默失效），所以这一格用本页灰块 */
.score-value-skeleton-bar {
	width: 46%;
	height: 40px;
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.12);
	animation: score-value-pulse 1.6s ease-in-out infinite;
}

@keyframes score-value-pulse {
	0%, 100% { opacity: 0.7; }
	50% { opacity: 1; }
}

.score-meta {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-top: 4px;
	font-size: 13px;
	line-height: 22px;
	color: rgba(255, 255, 255, 0.92);
}

/* 分隔线比文字再轻一档，只分栏不抢读数 */
.score-meta-sep {
	color: rgba(255, 255, 255, 0.6);
}

/* 统计行的加载占位：与实数据同高（22px + 4px 上距），取数回来整块高度不变 */
.score-meta-skeleton {
	display: flex;
	align-items: center;
	height: 22px;
	margin-top: 4px;
}

.score-meta-skeleton-bar {
	width: 56%;
	height: 14px;
	border-radius: 4px;
	background: rgba(0, 0, 0, 0.12);
	animation: score-value-pulse 1.6s ease-in-out infinite;
}

.score-block {
	margin-top: 10px;
	background: #fff;
}

.block-head {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 15px 10px;
}

.block-title {
	font-size: 15px;
	font-weight: 600;
	color: #1d2129;
}

.block-more {
	display: flex;
	align-items: center;
	gap: 2px;
	font-size: 12px;
	color: #86909c;
}

.block-empty {
	padding: 10px 0 20px;
}

.task-skeleton-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 14px 15px;
	border-bottom: 1px solid #f2f3f5;
}

.task-skeleton-main {
	flex: 1;
	padding-right: 20px;
}

.task-skeleton-btn {
	flex-shrink: 0;
	width: 64px;
	height: 28px;
	border-radius: 4px;
	background: #e5e6eb;
}

/* 商品列表区：卡片本体（圆角、内衬、封面/文字版式）在 `components/tz/score-goods-card.vue` 里，
   这里只给「列表摆在哪块底上」——卡片与区块同是白底，`:border="false"` 去掉发丝线，
   与积分兑换页（`score/center`）的卡片同形，列表不出现描边框 */
.goods-wrap {
	padding: 10px 15px;
}
</style>
