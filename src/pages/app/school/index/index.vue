<template>
	<view class="school-page">
		<!-- 顶部标题：浅灰底（与页面底色一致），非大色块；
		     选择学生按钮统一收口在本页：右侧与标题区垂直居中对齐 -->
		<view class="si-header">
			<view class="si-header-main">
				<view class="si-header-title">教务中心</view>
				<view class="si-header-desc">套餐、课表、课时、请假一站式管理</view>
			</view>
			<view class="student-pick" @click="studentPickerVisible = true">
				<!-- 加载学生列表时用骨架屏占位（已有姓名则保留回显，刷新不闪骨架；加载动画一律骨架屏，不用转圈图标） -->
				<view class="student-pick-sk" v-if="studentPickSkeleton"></view>
				<text class="student-pick-name" v-else>{{ currentStudent.name || '选择学生' }}</text>
				<tz-icon name="unfold" color="#0968F6" :size="12" />
			</view>
		</view>
		<!-- 学生选择弹窗（全模块唯一入口，其他页面不再提供选择学生；
		     未添加学生进入学生页时先提示，确认后自动弹出本弹窗） -->
		<student-select-popup
			:show="studentPickerVisible"
			:student-id="studentId"
			@confirm="onStudentPicked"
			@close="onStudentPickerClose"
		/>

		<!-- 功能入口按数据归属分两组（「我的教务」是学生自己的数据，「套餐与校区」是机构的商品库与校区库，只读查询）；
		     分组块口径照校区详情页（pages/app/school/campus/detail/detail）：通栏白块，tz-title 标题条 + tz-box 内容，
		     不做圆角、不加左右外边距，组间 12px 灰底间隙当分隔（由页面灰底露出，不铺 tz-divider，否则两处各给一份高度会叠加）；
		     组内版式照个人中心「常用功能」宫格（pages/user/index/index.vue）逐项对齐：
		     u-grid col=3 + u-grid-item（图标在上、名称在下，无右箭头；每行三个是本页的定档，参照页「常用功能」是 5 个、格宽放不下四字名称，故只取其版式不取列数），
		     tz-box 内缩 padding="0 15 15"（宫格自身不带左右内边距，这份内缩是参照页的卡片口径，与页头 15px 同线），
		     文字 .nav-name（12px / #86909C / margin-top 5px）取参照页字面值；行距 .u-grid-item 本页按用户要求加大到 16px 0（参照页是 10px 0，本页单独放大，不同步参照页）；
		     图标同参照页的 `item.size || 28` 档：iconfont 混了多套字形，同一字号墨迹最大边能差 39%，
		     满幅字形按 28 会明显大一圈，故逐项按「墨迹归一到 21px（参照网格中位）」反推 size，见 js.vue navGroups 注释；
		     宫格每格由 u-grid-item 自身 flex 居中，不再需要列表版式的定宽图标列（那是单行 cell 才有的对齐承载层）；
		     字号/字色/内缩三处是一个整体，改版式要一起对，不要只挪其中一项 -->
		<view class="nav-group" v-for="(group, gi) in navGroups" :key="gi">
			<tz-title :title="group.title" :more="false" size="sm" />
			<tz-box padding="0 15 15">
				<!-- #ifdef MP-TOUTIAO -->
				<u-grid :border="false" :col="3" customStyle="display: block;">
				<!-- #endif -->
				<!-- #ifndef MP-TOUTIAO -->
				<u-grid :border="false" :col="3">
				<!-- #endif -->
					<u-grid-item v-for="(item, i) in group.items" :key="i" @click="go(item)">
						<!-- 不传 color：与参照页一致，继承文字色，避免两处入口同图标不同色 -->
						<tz-icon :name="item.icon" :size="item.size || 28" />
						<div class="nav-name">{{ item.name }}</div>
					</u-grid-item>
				</u-grid>
			</tz-box>
		</view>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>