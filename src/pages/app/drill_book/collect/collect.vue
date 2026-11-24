<template>
	<div class="container db-collect">
		<u-sticky bgColor="#fff" :offsetTop="0">
			<view class="db-collect-search">
				<!-- shape="square" 必写：u-search 默认 round（100px 圆角），全站输入框是 4px 直角（M79） -->
				<u-search v-model="keyword" placeholder="搜索收藏题目" :showAction="false" bgColor="#f7f8fa" shape="square"
					@search="refresh" @clear="refresh" />
			</view>
		</u-sticky>

		<template v-if="skeletonLoading">
			<view class="db-collect-sk-card">
				<view class="db-sk-line" style="width:100%;height:44px;margin-bottom:10px" v-for="i in 4" :key="i"></view>
			</view>
		</template>

		<!-- 搜索结果：按题面平铺（与原收藏列表同一套卡片，「取消收藏」留在这一档） -->
		<template v-else-if="appliedKeyword">
			<view class="db-card db-collect-item" v-for="q in rows" :key="q.id">
				<view class="db-collect-head">
					<text class="db-collect-cat">{{ q.catalog_name || '未分类' }}</text>
					<text class="db-collect-uncollect" @click="uncollect(q)">取消收藏</text>
				</view>
				<question-box :edit="false" :option="q.option" :type="q.type" :question="q.question"
					:analysis="q.analysis" :answer="q.answer" :user_answer="''" :is_correct="false" />
			</view>
			<!-- 空态走全站 u-empty 档（图标 + 文字）；那一句说明是「没搜到」 -->
			<u-empty v-if="!rows.length" icon="/static/image/empty.png" width="70" height="70"
				text="没有匹配的收藏题目" margin-top="60" />
			<view class="db-loadmore" v-if="rows.length && loadStatus !== 'nomore'">
				<u-loadmore :status="loadStatus" />
			</view>
		</template>

		<!-- 目录视图：「所有题目」汇总行 + 收藏题目的目录树（只摆有收藏的目录）。
		     树复用 drill_book 共用的目录组件（缩进 + 祖先导引线 + 折叠圆钮 + 名称），
		     本页只把右侧那格适配成「N题 ›」；点一行 = 把这一范围的收藏题目开成一次练习，
		     点层级圆钮只折叠/展开，不跳转。 -->
		<template v-else>
			<u-empty v-if="groupEmpty" icon="/static/image/empty.png" width="70" height="70"
				text="暂无收藏题目" margin-top="60" />
			<view v-else class="db-collect-card">
				<view class="db-collect-row" @click="openAll">
					<view class="db-collect-row-name">所有题目</view>
					<view class="db-collect-row-right">
						<text class="db-collect-row-count">{{ groupTotal }}题</text>
						<tz-icon name="enter" :size="14" color="#c9cdd4" />
					</view>
				</view>
				<drill-catalog :rows="groupRows" name-bold @node-click="openGroupRow"
					@toggle="toggleGroup">
					<template v-slot:right="{ node }">
						<view class="db-collect-row-right">
							<text class="db-collect-row-count">{{ node.count }}题</text>
							<tz-icon name="enter" :size="14" color="#c9cdd4" />
						</view>
					</template>
				</drill-catalog>
			</view>
		</template>
	</div>
</template>

<script src="./js.vue"></script>

<style lang="scss">
@import "./css.css";
</style>
