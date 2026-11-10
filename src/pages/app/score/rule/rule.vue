<template>
	<view class="rule-page">
		<view v-if="!loaded" class="rule-skeleton">
			<view class="rule-skeleton-block">
				<u-skeleton :loading="true" :animate="true" :title="true" title-width="30%" title-height="16" :rows="3" :rows-width="['92%', '76%', '58%']" rows-height="13" />
			</view>
		</view>
		<template v-else>
			<view class="rule-block">
				<view class="rule-title">积分规则</view>
				<view class="rule-summary">
					<view class="summary-row">
						<text class="summary-label">有效期</text>
						<text class="summary-value">{{ info.validity_text }}</text>
					</view>
					<view class="summary-row">
						<text class="summary-label">冻结期</text>
						<text class="summary-value">{{ info.freeze_text }}</text>
					</view>
					<view class="summary-row">
						<text class="summary-label">发放规则</text>
						<text class="summary-value">{{ info.daily_issue_text }}</text>
					</view>
					<view class="summary-row">
						<text class="summary-label">任务领取</text>
						<text class="summary-value">{{ info.task_claim_text }}</text>
					</view>
					<view class="summary-row">
						<text class="summary-label">退款说明</text>
						<text class="summary-value">{{ info.refund_text }}</text>
					</view>
				</view>
				<view v-if="info.rule_text" class="rule-rich">
					<tz-parse :content="info.rule_text"></tz-parse>
				</view>
				<view v-else class="rule-empty">暂无积分规则说明</view>
			</view>

			<view class="rule-block" v-if="info.sign_rule_text">
				<view class="rule-title">签到规则</view>
				<view class="rule-rich">
					<tz-parse :content="info.sign_rule_text"></tz-parse>
				</view>
			</view>

			<!-- 常见问题（2026-11-08）：答案口径来自帮助中心，直接回答「抵现为什么用不了 / 学习积分怎么不见了」 -->
			<view class="rule-block" v-if="info.faq && info.faq.length">
				<view class="rule-title">常见问题</view>
				<view class="faq-item" v-for="(item, index) in info.faq" :key="'faq' + index">
					<view class="faq-q">Q：{{ item.q }}</view>
					<view class="faq-a">A：{{ item.a }}</view>
				</view>
			</view>
		</template>
		<tz-footer />
	</view>
</template>

<script>
export default {
	data() {
		return {
			loaded: false,
			info: {
				validity_text: '',
				freeze_text: '',
				daily_issue_text: '',
				task_claim_text: '',
				refund_text: '',
				rule_text: '',
				sign_rule_text: '',
				faq: [],
			},
		};
	},
	onShow() {
		this.getData(this.loaded);
	},
	onPullDownRefresh() {
		this.getData(true);
	},
	methods: {
		getData(silent) {
			this.$api('app.score.rule', {}).then((res) => {
				if (res.code === 1) {
					this.info = Object.assign({}, this.info, res.data || {});
				}
				this.loaded = true;
				uni.stopPullDownRefresh();
			}).catch(() => {
				this.loaded = true;
				uni.stopPullDownRefresh();
			});
		},
	},
};
</script>

<style scoped>
.rule-page {
	min-height: 100vh;
	background: #fafafa;
	padding: 0 0 16px;
}

.rule-block {
	background: #fff;
	padding: 15px;
	margin-bottom: 10px;
}

.rule-title {
	font-size: 15px;
	font-weight: 600;
	color: #1d2129;
	margin-bottom: 12px;
}

.rule-summary {
	padding: 10px 12px;
	background: #f7f8fa;
	border-radius: 4px;
	margin-bottom: 12px;
}

.summary-row {
	display: flex;
	align-items: flex-start;
	font-size: 13px;
	line-height: 22px;
}

.summary-label {
	flex-shrink: 0;
	width: 64px;
	color: #86909c;
}

.summary-value {
	flex: 1;
	color: #1d2129;
}

.rule-rich {
	font-size: 13px;
	color: #4e5969;
	line-height: 22px;
}

.rule-empty {
	font-size: 13px;
	color: #86909c;
}

.faq-item {
	margin-bottom: 12px;
}

.faq-item:last-child {
	margin-bottom: 0;
}

.faq-q {
	font-size: 13px;
	font-weight: 600;
	color: #1d2129;
	line-height: 22px;
}

.faq-a {
	font-size: 13px;
	color: #4e5969;
	line-height: 22px;
}

.rule-skeleton-block {
	background: #fff;
	padding: 15px;
}
</style>
