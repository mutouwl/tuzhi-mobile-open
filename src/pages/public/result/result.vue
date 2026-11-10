<template>
	<div class="container">
		<div class="icon">
			<img src="/static/image/success.png" alt="" />
		</div>

		<div class="tip">
			<div class="title">
				{{ title }}
			</div>

			<!-- 消费发放积分（2026-11-08 用户点名）：本单到账的积分，整行点进积分中心。
			     判据只认后端 consume_score（ConsumeGrant::earnedOfOrder 求和 pay 流水），
			     端上不按「开启了消费发放」自己算：兑换单 / 完成时机未到账 / 零流水都是 0 -->
			<div class="score-tip" v-if="earnedScore > 0" @tap="goScoreCenter">
				<text class="score-tip-text">恭喜您获得{{ earnedScore }}积分</text>
				<tz-icon name="right" :size="12" color="#ff7d00" class="score-tip-arrow" />
			</div>

			<div class="subtitle">
				{{ subtitle }}
			</div>
		</div>

		<tz-divider height="20" bgColor="none" />

	<tz-box bgColor="none" v-if="!isInIframe">
			<div class="btn-group">
				<div>
					<tz-button text="返回首页" style="width: 100%" long
						@click="$nav.to('/pages/index/index', 'local', 'redirectTo')"></tz-button>
				</div>
				<div>
					<tz-button :text="btnText" style="width: 100%" long @click="
              $nav.to(
                '/pages/order/detail/detail?order_no=' + order_no,
                'local',
                'redirectTo'
              )
            "></tz-button>
				</div>
			</div>

			<template v-if="orderDetail.order_type == 'activity'">
				<div style="margin-top: 20px; width: 100%">
					<tz-button text="查看我的票券" style="margin-top: 20px" long
						@click="$nav.to('/pages/app/activity/user/user', 'local', 'redirectTo')"></tz-button>
				</div>
			</template>

			<template v-if="orderDetail.live_id">
				<div style="margin-top: 20px; width: 100%">
					<tz-button text="返回直播" type="primary" long @click="
              $nav.to(
                '/pages/course/live/live?id=' + orderDetail.live_id,
                'local',
                'redirectTo'
              )
            "></tz-button>
				</div>
			</template>

			<!-- M-P3 支付成功页的【去赠送】：判据是订单详情接口随这一单下发的那一枚 flag（`gift_entry`，
			     由 `api/controller/order/Order.php::getDetail()` 用适配器 `SendFriend::ready() + isGiftOrder()` 折成），
			     **前端不比对裸串 `source === 'send_friend'`**（W69 同款：裸串比对就是第二份会分叉的判据）。
			     上一版这里读的是 `is_gift` —— 全站后端从不发这一枚键（`is_gift` 在圈子里是「随课赠送」另一根轴），
			     所以这一枚按钮**一次也没出现过**，付完送礼款的人被留在结果页上自己找路（PRD M-P3 未落）。
			     不加就不出现，也不许常显 —— 点了进一张空记录页就是自锁的反向（硬约束 27②）。
			     `redirectTo` 而不是 navigateTo：付完款这一页不再回头，回退栈里留一张「支付成功」没意义。
			     **2026-10-28 用户点名「在这个页面点进去赠送，直接跳转赠送详情」**：落点从赠送记录列表
			     改到送礼页（赠送详情，M-P9），凭据 `gift_code` 由订单详情一起下发（`SendFriend::firstGiftCode()`）；
			     拿不到凭据才回落到赠送记录列表，且只列这一张购买单（不造点进去是空页的入口） -->
			<template v-if="featureSendFriend && Number(orderDetail.gift_entry) === 1">
				<div style="margin-top: 20px; width: 100%">
					<tz-button text="去赠送" type="primary" long @click="goGift"></tz-button>
				</div>
			</template>
		</tz-box>

		<!-- 小程序学习引导：本单里含「只能在微信小程序学」的课程时整页铺白，只显示跳转信息
		     （支付成功页的图标/按钮/课程列表全部被盖住，用户 2026-10-27 点名要「整页仅显示跳转信息」）。
		     判据只认后端折好的 mp_study_entry + mp_study_course，端上不扫 goodsList 自己比类型 -->
		<tz-mp-study v-if="!isInIframe && Number(orderDetail.mp_study_entry) === 1 && orderDetail.mp_study_course && orderDetail.mp_study_course.id"
			fullscreen mode="notice" :course-id="orderDetail.mp_study_course.id"
			:course-name="orderDetail.mp_study_course.name" />

	<template v-if="!isInIframe && orderDetail.order_type != 'activity' && orderDetail.order_type != 'physical'">
			<tz-box style="margin-top: 30px" padding="0 15px 0px" v-if="orderDetail.goodsList.length > 0">
				<course-list :list="orderDetail.goodsList" />
			</tz-box>
		</template>

		<tz-footer />
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
	@import "./css.css";
</style>