<template>
	<view class="sg-entry-wrap">
<!-- 直播间右侧悬浮入口：判据只读后端逐次下发的 has_record 那一枚（M22），不成立时整枚不出——
	     不留一枚点了没内容的图标。这一枚是「这一场添加过活动」（进行中 + 已结束 + 已失效都算），
	     不是「此刻有进行中的」（用户 2026-10-02 点名：有记录就该显示，已失效/已结束的行点进去仍看得见
	     上一场中的奖）；2026-10-04 再点名「只要有添加活动记录就应该显示这个按钮」，
	     原先与直播间开关 room_open 的与随之取消（中控台那档读不到开关，等于建了活动也永远不出入口）。
		     几何值不在本文件：与同栏的邀请达人榜、红包、消息入口共用 tz-live-side-entry 那一份。
		     level 由页面按此刻常驻显示着的几枚连续编号传进来（写死会在缺席一枚时中间留空洞）；
		     同栏那枚临时的「消息」入口不参与这拨发号，单独追加在本栏最底下那枚之下，本入口不因它移位。
		     showEntry 是页面级闸门（清屏、弹窗期间收起），与后端那两枚判据无关 -->
		<!-- 纯图标、不带文字：2026-10-01 用户点名整根右侧栏去掉文字 -->
		<!-- 2026-10-05 用户第二次点名换新版素材：live/share_gift.png 这一张是**透明底橙色礼盒字形图**
		     （圆底之外全透明），归组件里「字形图内缩 20.25 躺在黑 35% 圆底里」那一档，与同栏的红包、
		     达人榜同一型 ⇒ **不再带 badge**（2026-10-04 那一版素材是自带深色圆底的整底图才铺满直径，
		     那一档已随之撤掉）。旧那枚 gift.png 是透明底礼盒字形，仍归「送礼物」那一族
		     （message-box / message-box-bottom / 讨论区送礼物卡都在用它）。
		     讨论区那张分享有礼卡的图标与这一枚同一张图（message-list.vue 里同一份路径，20px 那一格） -->
		<tz-live-side-entry v-if="entryOn" :level="level"
			:center-y="centerY" :stack-count="stackCount" icon="/static/image/live/share_gift.png"
			@open="openList" />

		<activity-list
			:show="listShow"
			:rows="rows"
			:loading="listLoading"
			:error="listError"
			@close="listShow = false"
			@pick="openDetail"
		></activity-list>

		<activity-detail
			:show="detailShow"
			:activity-id="activityId"
			:course-id="courseId"
			@close="detailShow = false"
			@share="$emit('share')"
		></activity-detail>
	</view>
</template>

<script src="./js.vue"></script>

<style scoped>
@import "./css.css";
</style>
