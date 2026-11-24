<template>
	<div class="exam-list-box" :class="type">
		<div
			v-for="(item, index) in rows"
			:key="index"
			class="exam-card"
			:class="[type, {
				'exam-card-round': round,
				'exam-card-border': border,
			}]"
			:style="{ marginBottom: margin + 'px' }"
			hover-class="exam-card-hover"
			@tap="goDetail(item)"
		>
			<div class="exam-cover">
				<image v-if="item.cover" class="exam-img" :src="item.cover" mode="aspectFill" />
				<div v-else class="exam-cover-ph">
					<tz-icon name="picture" :size="24" color="#C9CDD4" />
				</div>
				<!-- 状态角标压在封面左下角：待开始橙 / 进行中蓝 / 已结束灰（版式取自定义页面装修参照图） -->
				<div v-if="item.status_text" class="exam-badge" :class="item.status">{{ item.status_text }}</div>
			</div>
			<div class="exam-info">
				<div class="exam-title">{{ item.name }}</div>
				<!-- 双列版式按参照图拆成「开始 / 结束」两行；其余两档一行给起止或「时间不限」 -->
				<template v-if="type == 'double'">
					<div class="exam-time" v-if="item.time_limit != 1">时间不限</div>
					<template v-else>
						<div class="exam-time">开始：{{ item.start_text }}</div>
						<div class="exam-time">结束：{{ item.end_text }}</div>
					</template>
				</template>
				<div class="exam-time" v-else>{{ item.time_text }}</div>
				<!-- 报名人数：0 人时整行不出（参照图第一张卡就没有这一行） -->
				<div class="exam-join" v-if="Number(item.join_count) > 0">
					<tz-icon name="group" :size="14" color="#86909C" />
					<text class="exam-join-text">{{ item.join_count }}人报名</text>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
/**
 * 考试列表卡（自定义页面「考试」组件专用）
 *
 * 三种版式（与装修设置一一对应）：
 *  - list   一行一个：封面在左（145 通高），信息列标题 / 时间 / 报名人数；
 *  - single 大图：封面通栏在上（150 高），信息列在下；
 *  - double 一行两个：两张并排（各 49%），封面 120 高，时间拆「开始 / 结束」两行。
 * 状态角标（待开始 / 进行中 / 已结束）贴在封面左下角，配色见本文件样式块。
 * 数据由装修接口（`practice\TestDecor`）下发，端上只按配置排版，不自己判状态。
 */
export default {
	props: {
		list: {
			type: [Object, Array],
			default: () => [],
		},
		// 版式：list / single / double
		type: {
			type: String,
			default: 'list',
		},
		round: {
			type: [Boolean, Number],
			default: true,
		},
		border: {
			type: [Boolean, Number],
			default: false,
		},
		margin: {
			type: Number,
			default: 10,
		},
	},
	computed: {
		rows() {
			return this.list || [];
		},
	},
	methods: {
		goDetail(item) {
			if (!item || !item.id) {
				return;
			}
			this.$nav.to(this.$nav.getPagePath(item.id, 'test'));
		},
	},
};
</script>

<style lang="scss" scoped>
.exam-list-box.double {
	display: flex;
	flex-wrap: wrap;
	justify-content: space-between;
}

.exam-card {
	background-color: #fff;
	overflow: hidden;
	box-sizing: border-box;
	position: relative;
}

.exam-card.list {
	display: flex;
	width: 100%;
	height: 110px;
}

.exam-card.single {
	width: 100%;
}

.exam-card.double {
	width: 49%;
}

.exam-card-round {
	border-radius: 10px;
}

.exam-card-border {
	border: 1px solid #f0f3f5;
}

.exam-card-hover {
	background-color: #fafafa;
}

.exam-cover {
	position: relative;
	overflow: hidden;
	flex-shrink: 0;
	background: #f2f3f5;
}

.exam-card.list .exam-cover {
	width: 145px;
	height: 100%;
}

.exam-card.single .exam-cover {
	width: 100%;
	height: 150px;
}

.exam-card.double .exam-cover {
	width: 100%;
	height: 120px;
}

.exam-img {
	width: 100%;
	height: 100%;
}

.exam-cover-ph {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.exam-badge {
	position: absolute;
	left: 0;
	bottom: 10px;
	padding: 2px 8px;
	font-size: 11px;
	line-height: 16px;
	color: #fff;
	border-radius: 0 4px 4px 0;
}

.exam-badge.not_started {
	background: linear-gradient(90deg, #ffb020 0%, #ff8a00 100%);
}

.exam-badge.ongoing {
	background: linear-gradient(90deg, #4d9bff 0%, #1a73e8 100%);
}

.exam-badge.ended {
	background: linear-gradient(90deg, #b4bac4 0%, #8a919e 100%);
}

.exam-info {
	flex: 1;
	min-width: 0;
	padding: 10px 12px;
}

.exam-card.list .exam-info {
	position: relative;
}

.exam-title {
	color: #1d2129;
	font-size: 15px;
	font-weight: 600;
	line-height: 21px;
	overflow: hidden;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
}

.exam-card.single .exam-title {
	font-size: 16px;
}

.exam-card.double .exam-title {
	font-size: 14px;
	line-height: 20px;
}

.exam-time {
	margin-top: 6px;
	font-size: 12px;
	line-height: 17px;
	color: #86909c;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.exam-card.double .exam-time {
	margin-top: 4px;
	font-size: 11px;
}

.exam-join {
	display: flex;
	align-items: center;
	margin-top: 6px;
}

.exam-join-text {
	margin-left: 4px;
	font-size: 12px;
	line-height: 16px;
	color: #86909c;
}
</style>
