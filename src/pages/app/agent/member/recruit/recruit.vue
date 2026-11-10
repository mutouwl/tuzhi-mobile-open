<template>
	<div class="container">
		<!-- #ifdef MP-TOUTIAO -->
		<u-empty icon="/static/image/empty.png" width="70" height="70" text="分销功能禁止抖音小程序端使用" />
		<!-- #endif -->
		<!-- #ifndef MP-TOUTIAO -->
		<!-- 首屏骨架屏：本页首屏要等「配置 + 申请状态 + 达成条件」三个接口，在到手之前 config.status 是空，
		     下方各分支都不渲染，故按真实那一屏的版式给占位（申请条件卡：标题两行 + 两条条件行 → 分隔条 → 说明正文一块），
		     撤骨架屏后换成对应状态的内容，位置不跳（M16） -->
		<div class="rct-sk" v-if="loading">
			<tz-box>
				<div class="condition-box">
					<div class="condition-header">
						<div class="rct-sk-line rct-sk-block sk-h-14 sk-w-30"></div>
						<div class="rct-sk-line rct-sk-block sk-h-12 sk-w-50"></div>
					</div>
					<div class="rct-sk-cell">
						<div class="rct-sk-icon rct-sk-block"></div>
						<div class="rct-sk-col">
							<div class="rct-sk-line rct-sk-block sk-h-14 sk-w-45"></div>
							<div class="rct-sk-line rct-sk-block sk-h-12 sk-w-60"></div>
						</div>
						<div class="rct-sk-line rct-sk-block sk-h-12 sk-w-15"></div>
					</div>
					<div class="rct-sk-cell">
						<div class="rct-sk-icon rct-sk-block"></div>
						<div class="rct-sk-col">
							<div class="rct-sk-line rct-sk-block sk-h-14 sk-w-45"></div>
							<div class="rct-sk-line rct-sk-block sk-h-12 sk-w-60"></div>
						</div>
						<div class="rct-sk-line rct-sk-block sk-h-12 sk-w-15"></div>
					</div>
				</div>
			</tz-box>
			<tz-divider bgColor="#fafafa" />
			<tz-box>
				<div class="rct-sk-poster rct-sk-block"></div>
			</tz-box>
		</div>

		<u-empty v-if="config.status == 0" icon="/static/image/empty.png" width="70" height="70" text="分销功能已关闭" />
		<template v-if="config.status == 1">
			<template v-if="status == 3">
				<u-empty mode="list" text="申请未通过,请重新提交" textSize="12">
					<div class="empty-btn">
						<u-button type="primary" text="重新申请" @click="apply"></u-button>
					</div>
				</u-empty>
			</template>
			<template v-if="status == 2">
				<u-empty mode="history" text="申请已提交,请等待审核" textSize="12">
					<div class="empty-btn">
						<u-button type="primary" text="返回" @click="$nav.back()"></u-button>
					</div>
				</u-empty>

			</template>


			<template v-if="status == 1 || status == 4">

				<template
					v-if="config.member_recruit_condition == 1 && (config.member_recruit_condition_paycount_status == 1 || config.member_recruit_condition_payprice_status == 1)">
					<tz-box>
						<div class="condition-box">
							<div class="condition-header">
								<div class="condition-header-title">如何达到申请条件</div>
								<div class="condition-header-subtitle">若你完成条件却显示未达成，请下拉刷新</div>
							</div>

							<u-cell-group :border="false">
								<u-cell :title="'消费笔数满' + config.member_recruit_condition_paycount_value + '笔'"
									:label="'当前消费笔数为：' + userCondition.pay_count + ' 笔'"
									:value="payCountAchieved ? '已达成' : '未达成'"
									:border="false" :titleStyle="{ fontSize: '14px' }"
									v-if="config.member_recruit_condition_paycount_status == 1">
									<img src="@/static/image/app/price.png" class="condition-icon" slot="icon" width="30"
										height="30" style="margin-right: 6px;">
								</u-cell>
								<u-cell :title="'自购金额满' + config.member_recruit_condition_payprice_value + '元'"
									:label="'当前自购金额为：' + userCondition.pay_price + ' 元'" :border="false"
									:value="payPriceAchieved ? '已达成' : '未达成'"
									:titleStyle="{ fontSize: '14px' }"
									v-if="config.member_recruit_condition_payprice_status == 1">
									<img src="@/static/image/app/count.png" slot="icon" class="condition-icon" width="30"
										height="30" style="margin-right: 6px;">
								</u-cell>
							</u-cell-group>
						</div>
					</tz-box>
					<tz-divider bgColor="#fafafa" />
				</template>

				<tz-box>
					<tz-parse v-if="config.member_recruit_poster && config.member_recruit_poster != '<p><br></p>'"
						:content="config.member_recruit_poster"></tz-parse>
					<u-empty v-else mode="history" text="欢迎加入分销员计划" icon="/pages/app/static/image/app/agent_cover.png" textSize="12">

					</u-empty>
				</tz-box>
				<view class="box h5-bottom-bar">
					<template>
						<u-button v-if="status == 4" :customStyle="{ width: '100%', display: 'block' }" class="custom-style"
							type="primary" text="申请加入" @click="apply"
							:disabled="config.member_recruit_status != 1"></u-button>
						<u-button v-if="status == 1" :customStyle="{ width: '100%', display: 'block' }" class="custom-style"
							type="primary" text="进入分销员中心"
							@click="$nav.to('/pages/app/agent/center/center', 'local', 'redirectTo')"></u-button>
					</template>
				</view>
			</template>
		</template>

		<!-- #endif -->

		<tz-footer />
	</div>
</template>

<script src="./js.vue">

</script>

<style lang="scss">@import "./css.css";</style>
