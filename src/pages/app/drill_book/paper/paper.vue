<template>
	<div class="container db-paper">
		<u-sticky bgColor="#fff" :offsetTop="0">
			<view class="db-paper-search">
				<!-- shape 必须显式写 square：u-search 默认是 round（border-radius 100px），
				     全站同一档输入框是 4px 直角（M79），不写就退回圆角 -->
				<u-search v-model="keyword" placeholder="搜索试卷名称" :showAction="false" bgColor="#f7f8fa"
					shape="square" @search="refresh" @clear="refresh" />
			</view>
		</u-sticky>

		<template v-if="skeletonLoading">
			<view class="db-card">
				<view class="db-sk-line" style="width:100%;height:56px;margin-bottom:10px" v-for="i in 4" :key="i"></view>
			</view>
		</template>

		<template v-else>
			<!-- 试卷列表：整块白底，行与行之间只用浅灰细线分隔，不再一卡一行留灰缝 -->
			<view class="db-paper-list" v-if="rows.length">
				<view class="db-paper-item" v-for="p in rows" :key="p.id" @click="startPaper(p)">
					<view class="db-paper-left">
						<view class="db-paper-name">{{ p.name }}</view>
						<view class="db-paper-meta">
							共 {{ p.question_count }} 题
							<text v-if="p.last_accuracy !== null"> · 上次正确率 {{ p.last_accuracy }}%</text>
						</view>
					</view>
					<view class="db-paper-start">开始</view>
				</view>
			</view>
			<!-- 空态走全站 u-empty 档（图标 + 文字）；有搜索词时说明是没搜到 -->
			<u-empty v-if="!rows.length" icon="/static/image/empty.png" width="70" height="70"
				:text="keyword ? '没有匹配的试卷' : '暂无模拟测试试卷'" margin-top="60" />
			<view class="db-loadmore" v-if="rows.length && loadStatus !== 'nomore'">
				<u-loadmore :status="loadStatus" />
			</view>
		</template>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
