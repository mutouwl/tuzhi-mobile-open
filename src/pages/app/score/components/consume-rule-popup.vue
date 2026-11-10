<template>
	<!--
	  自定义积分规则（消费活动）弹窗（2026-11-10 用户点名）
	  用户原话：「积分任务，如果是自定义积分规则，点击右侧按钮应该弹窗显示积分规则，然后弹窗中
	  底部显示去逛逛按钮，点击再跳转。注意弹窗样式」

	  样式与参照页同档：`pages/app/physical/components/params-modal.vue` /
	  `components/tz/spec-popup-shell.vue` —— u-popup 底部弹出 + 12px 上圆角 + 白底；
	  头区居中标题 + 右上 ×；正文逐行「标签 80px #666 / 值 #333」；底部一条 46px 主按钮。
	  按钮走 `tz-button` 的积分模块色（theme="score"，与任务行那枚同档），不自造按钮（M12）。
	-->
	<u-popup :show="show" mode="bottom" :round="12" :safe-area-inset-bottom="true" :closeable="false" @close="onClose">
		<view class="crp">
			<view class="crp-head">
				<view class="crp-title">积分规则</view>
				<text class="crp-close" @tap="onClose">×</text>
			</view>
			<scroll-view class="crp-body" scroll-y>
				<view class="crp-row" v-for="(row, index) in rows" :key="index">
					<view class="crp-label">{{ row.label }}</view>
					<view class="crp-value">{{ row.value }}</view>
				</view>
			</scroll-view>
			<view class="crp-foot">
				<tz-button theme="score" type="primary" long text="去逛逛" :custom-style="confirmStyle" @click="onConfirm" />
			</view>
		</view>
	</u-popup>
</template>

<script>
// 消费活动规则 → 弹窗行（文案口径与后台活动表单、任务行说明同一份字段）
export default {
	name: 'ConsumeRulePopup',
	props: {
		show: { type: Boolean, default: false },
		task: { type: Object, default() { return {}; } },
	},
	emits: ['close', 'confirm'],
	data() {
		return {
			// 46px 主按钮：与 params-modal / spec-popup-shell 底部那枚同高（M21 小元素档 4px 圆角由组件自带）
			confirmStyle: 'height:46px;line-height:46px;font-size:16px;font-weight:500;padding:0',
		};
	},
	computed: {
		detail() {
			return (this.task && this.task.consume) || {};
		},
		rows() {
			const d = this.detail;
			const out = [];
			if (this.task && this.task.name) {
				out.push({ label: '活动名称', value: this.task.name });
			}
			out.push({ label: '有效期', value: this.validityText(d) });
			out.push({ label: '商品范围', value: this.scopeText(d) });
			out.push({ label: '达标条件', value: this.condText(d) });
			out.push({ label: '奖励积分', value: Number(d.score || this.task.score || 0) + ' 积分' });
			out.push({ label: '参与方式', value: String(d.grant_mode) === 'repeat' ? '每达成一次发放一次' : '每人限参与一次' });
			if (this.task.progress && this.task.progress.text) {
				out.push({ label: '当前进度', value: this.task.progress.text });
			}
			return out;
		},
	},
	methods: {
		pad(n) {
			return n < 10 ? '0' + n : '' + n;
		},
		/** 时间戳（秒）→ YYYY-MM-DD HH:mm；0 表示永久 */
		formatTime(ts) {
			const value = Number(ts) || 0;
			if (!value) {
				return '';
			}
			const d = new Date(value * 1000);
			return d.getFullYear() + '-' + this.pad(d.getMonth() + 1) + '-' + this.pad(d.getDate())
				+ ' ' + this.pad(d.getHours()) + ':' + this.pad(d.getMinutes());
		},
		validityText(d) {
			const start = this.formatTime(d.start_time);
			const end = this.formatTime(d.end_time);
			if (!start && !end) {
				return '长期有效';
			}
			return (start || '即日起') + ' 至 ' + (end || '长期');
		},
		numberText(value) {
			const num = Number(value) || 0;
			return String(parseFloat(num.toFixed(2)));
		},
		scopeText(d) {
			const count = Number(d.goods_count || 0);
			if (String(d.scope) === 'assign') {
				return '指定商品可用' + (count > 0 ? '（' + count + ' 件）' : '');
			}
			if (String(d.scope) === 'exclude') {
				return '指定商品不可用' + (count > 0 ? '（排除 ' + count + ' 件）' : '');
			}
			return '全部商品可用';
		},
		condText(d) {
			if (String(d.cond_type) === 'count') {
				return '成功交易满 ' + Number(d.cond_value || 0) + ' 笔';
			}
			return '累计消费满 ' + this.numberText(d.cond_value) + ' 元';
		},
		onConfirm() {
			this.$emit('confirm');
		},
		onClose() {
			this.$emit('close');
		},
	},
};
</script>

<style scoped>
.crp {
	background: #fff;
	border-radius: 12px 12px 0 0;
}

/* 标题走全局弹窗口径（16px/600/#1d2129 靠左，M18），右上角 × 绝对定位不占位 */
.crp-head {
	position: relative;
	display: flex;
	align-items: center;
	justify-content: flex-start;
	height: 52px;
	padding: 0 16px;
	border-bottom: 1px solid #F7F8FA;
}

.crp-title {
	font-size: 16px;
	font-weight: 600;
	color: #1d2129;
}

.crp-close {
	position: absolute;
	right: 16px;
	top: 50%;
	transform: translateY(-50%);
	width: 32px;
	height: 32px;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24px;
	color: #999;
}

.crp-body {
	max-height: 45vh;
	padding: 0 16px;
	box-sizing: border-box;
}

.crp-row {
	display: flex;
	align-items: flex-start;
	padding: 14px 0;
	border-bottom: 1px solid #F7F8FA;
}

.crp-row:last-child {
	border-bottom: none;
}

.crp-label {
	width: 80px;
	flex-shrink: 0;
	font-size: 14px;
	line-height: 22px;
	color: #666;
}

.crp-value {
	flex: 1;
	min-width: 0;
	font-size: 14px;
	line-height: 22px;
	color: #333;
	word-break: break-all;
}

/* 按钮与上方列表之间不画分隔线（2026-11-10 用户点名） */
.crp-foot {
	padding: 16px;
}
</style>
