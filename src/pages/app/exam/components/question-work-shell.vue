<template>
	<div class="container qw-work">
		<!-- 内容按数据先挂载、骨架浮在它上面：数据到达后先让题面在骨架下面完成首帧绘制
		     （富文本 u-parse 在子组件 mounted 里还要再渲染一帧），再撤骨架；否则会先看到
		     左侧选项牌、右侧正文随后才补上（2026-11-23 用户点名「加载顺序不太优雅」） -->
		<u-empty v-if="!loading && !questions.length" icon="/static/image/empty.png" width="70" height="70"
			:text="emptyText" margin-top="60" />

		<template v-if="questions.length">
			<!-- 吸顶栏：题号 + 页内插槽（练习/考试的倒计时、刷题本的收藏 / 标记）+ 交卷 -->
			<u-sticky bgColor="#fff" :offsetTop="0">
				<view class="qw-work-bar">
					<view class="qw-work-step">
						<text class="qw-work-step-now">{{ currentIndex + 1 }}</text>
						<text class="qw-work-step-all">/{{ questions.length }}</text>
					</view>
					<view class="qw-work-tools">
						<slot name="header-extra"></slot>
						<slot name="header-tools"></slot>
						<view class="qw-work-submit" v-if="canSubmit">
							<u-button type="primary" size="small" text="交卷" @click="$emit('submit')" />
						</view>
					</view>
				</view>
			</u-sticky>

			<!-- 题面：共用 question-box 的 report 版式（作答态 / 解析态由 edit 切换）。
			     逐题字段由页面算进 `questions` 里（外壳只读这些键，见文件头注释） -->
			<swiper class="qw-work-swiper" @change="onSwiperChange" :current="currentIndex"
				:style="{ height: swiperHeight + 'px' }">
				<swiper-item v-for="(item, index) in questions" :key="item.id || index">
					<view class="qw-work-swiper-item">
						<question-box variant="report" :edit="item.edit" :option="item.option" :type="item.type"
							:question="item.question" :user_answer="item.user_answer" :analysis="item.analysis"
							:answer="item.answer" :is_correct="item.is_correct" :score="item.score"
							:result="item.result" :personal_accuracy="item.personal_accuracy"
							:global_accuracy="item.global_accuracy" @changeoption="onChangeOption" />
					</view>
				</swiper-item>
			</swiper>

			<!-- 吸底控制条：页内插槽（错题本的「移除」）+ 答题卡 + 上一题 / 下一题 / 交卷 -->
			<view class="qw-work-bottom-bar school-footer h5-bottom-bar"
				:class="{ 'qw-work-bottom-bar--paper': paper }">
				<slot name="bottom-extra"></slot>
				<view class="qw-work-tool-btn" @click="sheetVisible = true">
					<tz-icon name="createtask" color="#444" :size="26" />
					<text class="qw-work-tool-text">答题卡</text>
				</view>
				<view class="qw-work-nav">
					<view class="qw-work-nav-btn">
						<u-button :customStyle="{ width: '100%' }" plain :disabled="currentIndex === 0"
							@click="changeQuestion('prev')">
							<tz-icon name="return" :size="16" />&nbsp;上一题
						</u-button>
					</view>
					<view class="qw-work-nav-btn" v-if="currentIndex < questions.length - 1">
						<u-button :customStyle="{ width: '100%' }" type="primary" @click="changeQuestion('next')">
							下一题&nbsp;<tz-icon name="enter" :size="16" />
						</u-button>
					</view>
					<view class="qw-work-nav-btn" v-else-if="canSubmit">
						<u-button :customStyle="{ width: '100%' }" type="primary" @click="$emit('submit')">
							交卷&nbsp;<tz-icon name="checkmark" :size="16" />
						</u-button>
					</view>
					<view class="qw-work-nav-btn" v-else-if="backText">
						<u-button :customStyle="{ width: '100%' }" type="primary" @click="$emit('back')">
							{{ backText }}&nbsp;<tz-icon name="enter" :size="16" />
						</u-button>
					</view>
				</view>
			</view>

			<answer-sheet-modal :question-list="questions" :answer-list="answerList"
				:visible="sheetVisible" @jump="jumpQuestion" @close="sheetVisible = false" />
		</template>

		<!-- 首屏骨架（M16）：同几何浮在内容之上。底栏不走 `.school-footer`（那条是 fixed 定位，
		     会被遮罩压在下面），在本层按同一几何自己摆一条 -->
		<view class="qw-work-sk-mask" v-if="loading">
			<view class="qw-work-bar">
				<view class="qw-bs-step"></view>
				<view class="qw-work-tools">
					<view class="qw-bs-btn"></view>
					<view class="qw-bs-btn"></view>
				</view>
			</view>
			<view class="qw-work-skeleton-body">
				<view class="qw-bs-line" style="width:70px;height:14px;margin-bottom:14px"></view>
				<view class="qw-bs-line" style="width:100%;height:16px;margin-bottom:10px"></view>
				<view class="qw-bs-line" style="width:85%;height:16px;margin-bottom:10px"></view>
				<view class="qw-bs-line" style="width:70%;height:16px;margin-bottom:22px"></view>
				<view class="qw-bs-option" v-for="i in 4" :key="i"></view>
			</view>
			<view class="qw-work-sk-bottom">
				<view class="qw-bs-tool"></view>
				<view class="qw-work-nav">
					<view class="qw-work-nav-btn"><view class="qw-bs-submit"></view></view>
					<view class="qw-work-nav-btn"><view class="qw-bs-submit"></view></view>
				</view>
			</view>
		</view>

		<!-- 页尾两枚常驻组件（M51）：与练习/考试/刷题三个做题页同一条页尾 -->
		<tz-tab-bar />
		<tz-footer />
	</div>
</template>

<script>
import questionBox from "@/pages/app/exam/components/question-box.vue";
import answerSheetModal from "@/pages/app/exam/components/answer-sheet-modal.vue";

/**
 * 做题页通用外壳（练习 / 考试 / 刷题本三处共用）
 *
 * 版式唯一真源＝刷题本做题页（2026-11-22 用户点名「以当前刷题本的做题页面样式为准」）。
 * 数据与业务留在各页：题目从哪来、逐题怎么判、交卷往哪走都由页面自己决定，
 * 这里只负责「骨架 / 吸顶栏 / 题面轮播 / 吸底控制条 / 答题卡 / 页尾」这套几何。
 *
 * - `questions`：页面算好的逐题数组（`id` / `marked` 供答题卡，其余键原样绑给 question-box：
 *   edit / option / type / question / user_answer / analysis / answer / is_correct /
 *   score / result / personal_accuracy / global_accuracy）。
 *   不在外壳里接函数或动态属性表：小程序端 props 必须可序列化，且大题库跨组件只传一份，
 *   重复一份逐题绑定会把 setData 体积顶到上限。
 * - `canSubmit`：同时控制吸顶栏「交卷」与最后一题的「交卷」；两枚必须同源，
 *   否则会出现「顶上有交卷、最后一题没有」或反之。
 * - `backText`：最后一题且不可交卷时的出口（解析态「返回结果」、已交卷「返回」）；
 *   空串表示不摆。
 */
export default {
	components: { questionBox, answerSheetModal },
	props: {
		loading: {
			type: Boolean,
			default: false,
		},
		questions: {
			type: Array,
			default: () => [],
		},
		answerList: {
			type: [Object, Array],
			default: () => ({}),
		},
		currentIndex: {
			type: Number,
			default: 0,
		},
		emptyText: {
			type: String,
			default: '暂无题目',
		},
		canSubmit: {
			type: Boolean,
			default: false,
		},
		backText: {
			type: String,
			default: '',
		},
		// 试卷（模拟测试）照考试做题页的底栏几何；普通刷题 / 练习走默认档
		paper: {
			type: Boolean,
			default: false,
		},
	},
	data() {
		// 题面轮播高度在 `data` 阶段就取到（同步接口）：原写法放在 mounted 的异步回调里，
		// 首帧 swiper 高 0、随后再撑开，表现为「先出一部分、内容随后才补上」
		let windowHeight = 0;
		try {
			windowHeight = Number(uni.getSystemInfoSync().windowHeight || 0);
		} catch (e) {
			windowHeight = 0;
		}
		return {
			sheetVisible: false,
			// swiper 高度（照练习/考试做题页：窗口高 − 吸顶栏与吸底栏的占位）
			swiperHeight: windowHeight > 110 ? windowHeight - 110 : 0,
		};
	},
	mounted() {
		// data 阶段没拿到窗口高（个别端 getSystemInfoSync 不可用）时再补一次
		if (!this.swiperHeight) this.setSwiperHeight();
	},
	methods: {
		setSwiperHeight() {
			const vm = this;
			uni.getSystemInfo({
				success: function (res) {
					vm.swiperHeight = res.windowHeight - 110;
				},
			});
		},
		onSwiperChange(e) {
			this.$emit('change-index', e.detail.current);
		},
		onChangeOption(option) {
			this.$emit('change-option', option);
		},
		changeQuestion(type) {
			const next = type === 'next' ? this.currentIndex + 1 : this.currentIndex - 1;
			if (next < 0 || next >= this.questions.length) return;
			this.$emit('change-index', next);
		},
		jumpQuestion(index) {
			this.sheetVisible = false;
			this.$emit('change-index', index);
		},
	},
};
</script>

<style scoped>
.qw-work {
	min-height: 100vh;
	background: #fff;
}

/* 吸顶栏：题号 / 页内工具 / 交卷 */
.qw-work-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 10px 15px;
	background: #fff;
}
.qw-work-step {
	display: flex;
	align-items: baseline;
	flex: 1;
	min-width: 0;
}
.qw-work-step-now {
	font-size: 20px;
	line-height: 1;
	color: #1d2129;
}
.qw-work-step-all {
	font-size: 12px;
	color: #86909c;
}
.qw-work-tools {
	display: flex;
	align-items: center;
	gap: 14px;
}
.qw-work-submit {
	margin-left: 2px;
}

/* 题面轮播：高度由 js 按窗口算，每屏自己滚 */
.qw-work-swiper {
	width: 100%;
}
.qw-work-swiper-item {
	height: 100%;
	width: 100%;
	overflow-y: auto;
}

/* 吸底控制条：左「答题卡」竖排入口 + 右侧上一题/下一题。
   外壳（吸底 + 白底 + 阴影 + 安全区）一律走全局 `.school-footer`，这里只补本栏布局
   （硬约束 20：间距只由容器 gap 给，按钮格子自己不带外边距） */
.qw-work-bottom-bar {
	gap: 8px;
	/* 只给上 / 左 / 右：底部安全区内衬必须留给全局 `.school-footer`（它按端分档：
	   H5 全量 env，微信端减半，与 tz-tab-bar 同口径）。早前用 `padding: 5px 10px`
	   简写把 padding-bottom 一起复位成 5px，iPhone X 上底栏直接贴住 Home 指示条
	   （2026-11-23 用户点名「底部按钮没有留出安全区域」） */
	padding-top: 5px;
	padding-left: 10px;
	padding-right: 10px;
}
.qw-work-bottom-bar .u-button {
	margin: 0;
}
.qw-work-tool-btn {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex: 0 0 auto;
	width: 40px;
}
.qw-work-tool-text {
	font-size: 12px;
	line-height: 16px;
	color: #888;
}
/* 两枚主按钮并排：宽度已扣掉 gap；`space-between` 与 `gap` 同值互为兜底 */
.qw-work-nav {
	display: flex;
	justify-content: space-between;
	gap: 10px;
	flex: 1 1 0;
	min-width: 0;
}
.qw-work-nav-btn {
	flex: 1 1 0;
	min-width: 0;
}

/* 试卷（模拟测试）底栏几何：左侧答题卡一枚、右侧按钮行占 70%，单枚按钮仍占半格 */
.qw-work-bottom-bar--paper {
	justify-content: space-between;
}
.qw-work-bottom-bar--paper .qw-work-nav {
	flex: 0 0 70%;
	width: 70%;
}
.qw-work-bottom-bar--paper .qw-work-nav-btn {
	flex: 0 0 calc(50% - 5px);
}

/* ---------- 骨架屏 ---------- */
.qw-work-skeleton-body {
	padding: 15px;
}
.qw-bs-line {
	height: 12px;
	border-radius: 4px;
	background: #e5e6eb;
}
.qw-bs-step {
	width: 40px;
	height: 20px;
	border-radius: 4px;
	background: #e5e6eb;
}
/* 顶栏右侧工具的位置占位（真实是图标，不是圆形按钮，骨架也不做圆底） */
.qw-bs-btn {
	width: 24px;
	height: 24px;
	border-radius: 4px;
	background: #e5e6eb;
}
.qw-bs-option {
	height: 44px;
	border-radius: 5px;
	background: #e5e6eb;
	margin-bottom: 10px;
}
/* 骨架底栏：与真实底栏同几何（答题卡竖排 40 + 两枚 40 高按钮） */
.qw-bs-tool {
	width: 40px;
	height: 40px;
	border-radius: 4px;
	background: #e5e6eb;
	flex: 0 0 auto;
}
.qw-bs-submit {
	height: 40px;
	border-radius: 4px;
	background: #e5e6eb;
}

/* ---------- 首屏骨架遮罩（浮在已挂载的内容之上，等首帧绘制完再撤） ---------- */
.qw-work-sk-mask {
	position: fixed;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	z-index: 10070;
	background: #fff;
	overflow: hidden;
}
/* H5：顶部导航与底部 window-bottom 之外才是页面视口，同时与页面 480 限宽对齐 */
/*  #ifdef  H5  */
.qw-work-sk-mask {
	top: var(--window-top, 0px);
	bottom: var(--window-bottom, 0px);
	max-width: 480px;
	margin-left: auto;
	margin-right: auto;
}
/*  #endif  */

/* 骨架底栏：几何与真实底栏一致（答题卡竖排 40 + 两枚 40 高按钮 + 安全区） */
.qw-work-sk-bottom {
	position: absolute;
	left: 0;
	right: 0;
	bottom: 0;
	display: flex;
	align-items: center;
	gap: 8px;
	padding-top: 5px;
	padding-left: 10px;
	padding-right: 10px;
	padding-bottom: calc(5px + constant(safe-area-inset-bottom));
	padding-bottom: calc(5px + env(safe-area-inset-bottom));
	background: #fff;
	box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
}
/* 微信端安全区减半，与真实底栏 / tz-tab-bar 同口径 */
/*  #ifdef  MP-WEIXIN  */
.qw-work-sk-bottom {
	padding-bottom: calc(5px + constant(safe-area-inset-bottom) / 2);
	padding-bottom: calc(5px + env(safe-area-inset-bottom) / 2);
}
/*  #endif  */

/* 吸底控制条必须压在答题卡遮罩之下：全局 .school-footer 是 10063，答题卡面板钉在 10100/10110；
   这里不再抬层级，只把语义写清，防止以后有人为「底栏被遮」把它加上去（2026-11-19 用户点名） */
</style>
