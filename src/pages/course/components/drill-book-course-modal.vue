<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="db-course-popup">
			<view class="db-course-popup-title">刷题本</view>
			<!-- 列表区高度走 tz-popup-list 的确定高度档（默认 60vh，M6：写 min/max 在小程序端会「下方空白滑不动」） -->
			<tz-popup-list padding="0 16px 12px" :refreshable="false" @lower="lower">
				<!-- 首屏加载态（尚无数据）：骨架卡与真实卡同一只外壳（tz-course-mini 自己那档，
				     卡高 80 / 封面 140 / 内衬 6·8），列表高度不随加载完成跳版（M16） -->
				<view class="db-course-skeleton" v-if="skeletonShow">
					<tz-course-mini :list="[]" type="single" :round="true" :border="false" :skeleton="true"
						:skeleton-count="4" />
				</view>
				<block v-else-if="rows.length">
					<!-- 卡片复用全站紧凑商品卡：封面兜底、型别标签、价格位、骨架档都在组件里。
					     点击落点由组件内部按 type='drill_book' 走 $nav.getPagePath（router.js 的 drill_book 档
					     ＝刷题本首页），本弹窗只负责关掉自己 -->
					<tz-course-mini :list="rows" type="single" :round="true" :border="false" />
					<view class="db-course-loadmore" v-if="loadStatus !== 'nomore'">
						<u-loadmore :status="loadStatus" />
					</view>
				</block>
				<!-- 空态/失败态：取失败说的是失败原因，不把故障说成「没有关联刷题本」（M13/M24） -->
				<u-empty v-else icon="/static/image/empty.png" width="70" height="70" :text="loadMsg || '暂无关联刷题本'" />
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
/**
 * 课程详情页底栏「刷题本」弹窗：列出这门课关联的刷题本
 *
 * 组件不自己发请求——底栏那枚按钮要不要出，取决于「有没有关联刷题本」，这个事实由课程详情页
 * 取一次后同时喂给按钮和本弹窗（两处各取就会出现「按钮出了、列表是空的」）。
 * 版式与 `checkin-course-modal.vue` 同档（底部弹层 + 左对齐标题 + tz-popup-list 确定高度 +
 * 空态 u-empty + 上拉 u-loadmore），本屏不另造一套。
 *
 * ⚠ 刷题本是付费插件：未安装时后端目录根本不在盘上，本组件只在 `app_isinstall_drill_book`
 * 为真时被调用页挂载/取数（见 `pages/course/detail/js.vue` 的 loadDrillBooks）。
 */
export default {
	name: 'DrillBookCourseModal',
	props: {
		show: { type: Boolean, default: false },
		// 接口下发的刷题本行（已由调用页映射成 tz-course-mini 的卡片契约）
		rows: { type: Array, default: function () { return []; } },
		// 首屏取数在途且尚无数据：出骨架卡，不出空态（避免先闪「暂无」）
		loading: { type: Boolean, default: false },
		// 空态文案：首屏失败时由调用页给后端那句原因
		loadMsg: { type: String, default: '' },
		// u-loadmore 状态（nomore 时不再出提示）
		loadStatus: { type: String, default: 'loadmore' },
	},
	emits: ['close', 'lower'],
	computed: {
		// 加载中且还没有可展示的数据：骨架；已有列表时翻页不覆盖内容
		skeletonShow() {
			return this.loading && !this.rows.length;
		},
	},
	methods: {
		close() {
			this.$emit('close');
		},
		lower() {
			this.$emit('lower');
		},
	},
};
</script>

<style scoped>
.db-course-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区由弹层自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.db-course-popup-title {
	padding: 15px 16px 12px;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}

/* 骨架铺满列表区宽度（tz-course-mini 的骨架卡自带卡高与内衬） */
.db-course-skeleton {
	width: 100%;
}

.db-course-loadmore {
	padding: 8px 0 4px;
}
</style>
