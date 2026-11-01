<template>
	<view class="tz-exam-group">
		<!-- 左右两栏版式与 `pages/course/category` 同一档（左侧一级分类菜单 + 右栏练习列表）；
		     首屏取分类树期间两栏各铺灰块（M16），不再用 u-loading-page 整页遮罩 -->
		<view class="three-level-wrap tz-flex tz-col-top">
			<view class="side-menu-wrap">
				<scroll-view scroll-y class="side-scroll">
					<!-- 左栏骨架：与真实 .menu-item 同盒子（padding 20/10），条块宽 56 高 16（真实名称行高 16） -->
					<block v-if="loading">
						<view class="eg-sk-menu" v-for="i in 8" :key="'m' + i">
							<view class="eg-sk-menu-bar"></view>
						</view>
					</block>
					<block v-else>
						<view
							class="menu-item tz-flex"
							v-for="(item, index) in categoryList"
							:key="item.id"
							:class="[{ 'menu-item-active': index == activeMenu }]"
							@tap="onMenu(index)"
						>
							<view class="menu-title tz-line-1">{{ item.name }}</view>
						</view>
					</block>
				</scroll-view>
			</view>

			<!-- 首屏右栏骨架：外壳与真实那一栏同一只容器，练习卡由 `tz-course-mini` 自己的骨架档出 -->
			<view class="goods-list-box" v-if="loading">
				<tz-course-mini :round="true" :border="false" :skeleton="true" :skeleton-count="5"></tz-course-mini>
			</view>

			<view
				class="goods-list-box empty-box"
				v-else-if="!categoryList || !categoryList.length"
			>
				<u-empty
					icon="/static/image/empty.png"
					width="70"
					height="70"
					text="暂无分类"
				></u-empty>
			</view>

			<scroll-view
				scroll-y
				class="goods-list-box goods-list-scroll"
				v-else
				@scrolltolower="onScrollToLower"
			>
				<u-sticky bgColor="#fff" :offsetTop="0" v-if="secondCategoryList.length > 0">
					<view class="eg-tabs-band">
						<u-tabs :list="secondCategoryList" :current="activeSecondMenu" @click="onSecondMenu"></u-tabs>
					</view>
				</u-sticky>

				<!-- 当前选中分类有子分类：展示子分类卡片导航 -->
				<template v-if="currentChildren && currentChildren.length > 0">
					<view class="sub-category-wrap">
						<view
							class="sub-category-item"
							v-for="subItem in currentChildren"
							:key="subItem.id"
							@tap="goGoodsList(subItem.id, subItem.name, !!subItem.children && subItem.children.length > 0)"
						>
							<view class="sub-category-name tz-line-1">{{ subItem.name }}</view>
							<tz-icon name="enter" :size="14" color="#999"></tz-icon>
						</view>
					</view>
				</template>

				<!-- 当前选中分类为叶子节点：直接展示练习列表（紧凑档课程卡，与课程分类页同一档） -->
				<template v-else>
					<tz-course-mini
						:round="true"
						:border="false"
						:skeleton="true"
						:skeleton-count="4"
						v-if="goodsLoading && !goodsList.length"
					></tz-course-mini>
					<template v-else>
						<tz-course-mini :round="true" :border="false" :list="goodsList" v-if="goodsList.length > 0"></tz-course-mini>
						<u-empty icon="/static/image/empty.png" width="70" height="70" v-if="goodsList.length == 0" text="暂无练习"></u-empty>
					</template>
					<view class="load-more-box" v-if="goodsList.length > 0">
						<u-loadmore :status="loadStatus" />
					</view>
				</template>
			</scroll-view>
		</view>

		<tz-tab-bar />
		<tz-footer />
	</view>
</template>

<script src="./js.vue"></script>

<style>
@import "./css.css";
</style>
