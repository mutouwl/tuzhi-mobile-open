<template>
	<u-popup :show="show" mode="bottom" :round="10" :closeable="true" :safeAreaInsetBottom="false" @close="close">
		<view class="renew-popup">
			<view class="renew-popup-title">选择续费套餐</view>
			<!-- 课程名副标题：多账户同页时让学员确认「给哪门课续费」（课程由课时账户卡带入） -->
			<view class="renew-popup-sub" v-if="courseName">{{ courseName }}</view>
			<tz-popup-list padding="12px 16px 8px" :refreshable="false" @lower="lower">
				<!-- 首屏加载态（尚无数据）：骨架屏占位，行结构与真实套餐行一致（封面 + 两行文字） -->
				<view class="renew-skeleton" v-if="skeletonShow">
					<view class="renew-skeleton-item" v-for="i in 3" :key="i">
						<view class="renew-sk-cover"></view>
						<view class="renew-sk-info">
							<u-skeleton
								:loading="true"
								:animate="true"
								:title="true"
								title-width="60%"
								title-height="14"
								:rows="2"
								:rows-width="['85%', '35%']"
								rows-height="12"
							/>
						</view>
					</view>
				</view>
				<view class="renew-item" v-for="p in list" :key="p.id" :class="{ 'renew-item-off': !p.buyable }" @tap="pick(p)">
					<image class="renew-cover" :src="coverSrc(p)" mode="aspectFill" @error="onCoverError(p)" />
					<view class="renew-info">
						<view class="renew-head">
							<text class="renew-name">{{ p.name }}</text>
							<!-- 状态标签：只在异常状态展示（已下架 / 已售罄），可购买的不打标（与课时账户卡状态标同一口径） -->
							<text v-if="p.status_text" class="renew-status" :class="p.sale_status == 0 ? 'gray' : 'orange'">{{ p.status_text }}</text>
						</view>
						<view class="renew-meta" v-if="metaText(p)">{{ metaText(p) }}</view>
						<view class="renew-price">
							<text class="rmb">¥</text><text class="num">{{ p.price }}</text><text class="from">起</text>
						</view>
					</view>
					<view class="renew-arrow"><tz-icon name="enter" color="#86909C" :size="13" /></view>
				</view>
				<!-- 分页加载行：套餐随机构增长，滚到底部续拉下一页（列表非空才展示；末页收起） -->
				<view class="renew-loadmore" v-if="list.length && loadStatus !== 'nomore'"><u-loadmore :status="loadStatus" /></view>
				<!-- 空状态：首屏返回后仍无套餐才展示，请求中由骨架屏占位（避免先闪「暂无套餐」） -->
				<u-empty v-if="emptyShow" icon="/static/image/empty.png" width="70" height="70" :text="emptyText" />
			</tz-popup-list>
		</view>
	</u-popup>
</template>

<script>
export default {
	name: 'RenewPackagePopup',
	props: {
		show: {
			type: Boolean,
			default: false
		},
		// 当前续费的课程名（副标题，空则不展示）
		courseName: {
			type: String,
			default: ''
		},
		// 套餐列表：[{ id, name, cover, price, lessons, campus_names, sale_status, sold_out, buyable, status_text }]
		list: {
			type: Array,
			default: () => []
		},
		// 请求进行中
		loading: {
			type: Boolean,
			default: false
		},
		// 首屏是否已返回过一次（成功或失败）：用于区分「加载中」与「确无套餐」
		loaded: {
			type: Boolean,
			default: false
		},
		// u-loadmore 状态（loadmore / loading / nomore）
		loadStatus: {
			type: String,
			default: 'loadmore'
		},
		// 空列表提示文案
		emptyText: {
			type: String,
			default: '该课程暂无可续费套餐'
		}
	},
	data() {
		return {
			// 封面加载失败记录（按套餐 id 记录，切换课程重新拉列表后重置）
			coverErrors: {},
			// 封面兜底图（与套餐卡、报名信息弹窗同一张默认商品图）
			defaultCover: '/static/image/default-goods.jpg'
		};
	},
	computed: {
		// 加载中且还没有可展示的数据：骨架屏；已有列表时翻页不覆盖内容
		skeletonShow() {
			return this.loading && !this.list.length;
		},
		// 空状态：首屏返回后仍无套餐才展示，加载中不显示
		emptyShow() {
			return this.loaded && !this.loading && !this.list.length;
		}
	},
	watch: {
		// 重新打开（换课程续费）时重置封面失败记录，重新尝试加载
		show(val) {
			if (val) this.coverErrors = {};
		}
	},
	methods: {
		coverSrc(p) {
			return (!this.coverErrors[p.id] && p.cover) || this.defaultCover;
		},
		onCoverError(p) {
			this.$set(this.coverErrors, p.id, true);
		},
		// 行内元信息：该课程课时 + 适用校区（都缺时不占行）
		metaText(p) {
			const parts = [];
			if (p.lessons > 0) parts.push('含 ' + p.lessons + ' 课时');
			if (p.campus_names && p.campus_names.length) parts.push('适用校区：' + p.campus_names.join('、'));
			return parts.join(' · ');
		},
		// 点击套餐：是否可购买由页面判定（不可购买的行由页面说明原因，本组件只负责呈现与上报）
		pick(p) {
			this.$emit('pick', p);
		},
		// 上拉到底：交给页面续拉下一页（列表数据由页面持有）
		lower() {
			this.$emit('lower');
		},
		close() {
			this.$emit('close');
		}
	}
};
</script>

<style scoped>
.renew-popup {
	background: #fff;
	border-radius: 12px 12px 0 0;
	overflow: hidden;
	/* 底部安全区改由弹层自身承担（模板已关 u-popup 的 safeAreaInsetBottom），微信端按教务口径减半 */
	padding-bottom: constant(safe-area-inset-bottom);
	padding-bottom: env(safe-area-inset-bottom);
	/*  #ifdef  MP-WEIXIN  */
	padding-bottom: calc(constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(env(safe-area-inset-bottom) / 2);
	/*  #endif  */
}

.renew-popup-title {
	padding: 15px 16px 0;
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
	text-align: left;
}

.renew-popup-sub {
	padding: 4px 16px 0;
	font-size: 12px;
	color: #86909c;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

/* 加载态骨架屏：行高与真实套餐行对齐（封面 60px），列表高度不跳动 */
.renew-skeleton-item {
	display: flex;
	align-items: center;
	padding: 12px 0;
}

.renew-sk-cover {
	width: 60px;
	height: 60px;
	flex-shrink: 0;
	border-radius: 6px;
	background: #e5e6eb;
}

.renew-sk-info {
	flex: 1;
	min-width: 0;
	margin-left: 10px;
}

.renew-item {
	display: flex;
	align-items: center;
	padding: 12px 0;
}

/* 分隔线用相邻兄弟上边框实现：最后一个成员不显示边框 */
.renew-item + .renew-item {
	border-top: 1px solid #f2f3f5;
}

/* 不可购买（已下架 / 已售罄）：整行降透明度 + 名称转浅灰，与套餐规格弹窗禁用规格同款 */
.renew-item-off {
	opacity: 0.6;
}

.renew-cover {
	width: 60px;
	height: 60px;
	flex-shrink: 0;
	border-radius: 6px;
	background: #f7f8fa;
}

.renew-info {
	flex: 1;
	min-width: 0;
	margin-left: 10px;
}

.renew-head {
	display: flex;
	align-items: center;
}

.renew-name {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	font-weight: 600;
	color: #1d2129;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.renew-item-off .renew-name {
	color: #86909c;
}

/* 套餐状态标（右上角）：配色对齐课时账户卡状态标（灰=已下架 / 橙=已售罄） */
.renew-status {
	flex-shrink: 0;
	margin-left: 8px;
	font-size: 12px;
	padding: 2px 8px;
	border-radius: 4px;
}

.renew-status.gray {
	color: #86909c;
	background: #f2f3f5;
}

.renew-status.orange {
	color: #ff7d00;
	background: #fff3e8;
}

.renew-meta {
	margin-top: 4px;
	font-size: 12px;
	color: #86909c;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.renew-price {
	margin-top: 6px;
	display: flex;
	align-items: baseline;
	color: #f53f3f;
}

.renew-price .rmb {
	font-size: 12px;
	font-weight: 700;
	margin-right: 1px;
}

.renew-price .num {
	font-size: 16px;
	font-weight: 700;
}

.renew-price .from {
	margin-left: 2px;
	font-size: 12px;
	font-weight: 400;
}

.renew-arrow {
	flex-shrink: 0;
	margin-left: 8px;
}

.renew-loadmore {
	padding: 8px 0 4px;
}
</style>
