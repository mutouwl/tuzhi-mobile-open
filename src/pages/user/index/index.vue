<template>
	<view class="container">
		<div class="user-header">
			<div class="info">
				<div @click="$nav.to('/pages/user/setting/setting')" class="avatar" v-if="userInfo && userInfo.avatar">
					<img :src="userInfo.avatar">
				</div>
				<div class="content" @click="$nav.to('/pages/user/setting/setting')">
					<div class="username">
						{{ userInfo && userInfo.nickname ? userInfo.nickname : '-'}}
					</div>
				</div>
				<div class="message" @click="$nav.to('/pages/public/message/message')">
					<tz-icon name="message" />
				</div>
			</div>
 
			<vip-card />
		</div>

		<tz-title title="资产管理" :more="false" size="sm" />
		<tz-box padding="0 10 5">
			<!-- #ifdef MP-TOUTIAO -->
			<u-grid :border="false" col="3" customStyle="display: block;">
        <!-- #endif -->
            <!-- #ifndef MP-TOUTIAO -->
			<u-grid :border="false" col="3">
				<!-- #endif -->
				<u-grid-item v-for="(item, index) in assetsNav" :key="index" @click="toAssets(index)">
					<div class="nav-value">{{ item.value }}</div>
					<div class="nav-name">{{ item.name }}</div>
				</u-grid-item>
			</u-grid>
		</tz-box>

		<tz-divider />

		<tz-title title="订单管理" :more="true" subtitle="查看全部订单" :link="{
			src: '/pages/order/list/list',
			type: 'local'
		}" size="sm" />
		<tz-box padding="0 10 15">
			<!-- #ifdef MP-TOUTIAO -->
				<u-grid :border="false" :col="orderNav.length" customStyle="display: block;">
        <!-- #endif -->
            <!-- #ifndef MP-TOUTIAO -->
			<u-grid :border="false" :col="orderNav.length">
				<!-- #endif -->
				<u-grid-item v-for="(item, index) in orderNav" :key="index" @click="nav(item.path)">
					<tz-icon :name="item.icon" />
					<div class="nav-name">{{ item.name }}</div>
				</u-grid-item>
			</u-grid>
		</tz-box>

		<tz-divider />
		<tz-title title="常用功能" :more="false" size="sm" />
		<tz-box  padding="0 15 15">
			<!-- #ifdef MP-TOUTIAO -->
			<u-grid :border="false" :col="5" customStyle="display: block;">
        <!-- #endif -->
            <!-- #ifndef MP-TOUTIAO -->
			<u-grid :border="false" :col="5">
				<!-- #endif -->
				<u-grid-item v-for="(item, index) in controllNav" :key="index" @click="nav(item.path)">
					<tz-icon :name="item.icon" :size="28"/>
					<div class="nav-name">{{ item.name }}</div>
				</u-grid-item>
			</u-grid>

			<!-- <u-cell-group :border="false">
				<u-cell :border="false" @click="nav(item.path)" :title="item.name" v-for="(item, index) in controllNav"
					:key="index">
					<template #icon>
						<tz-icon :name="item.icon" :size="22" />
					</template>
					<template #right-icon>
						<tz-icon name="enter" color="#86909C" :size="13" />
					</template>
				</u-cell>
			</u-cell-group> -->
			
		</tz-box>
		<tz-tab-bar />

		<tz-footer />

		<service-modal :visible="modal.service" :mobile="serviceConfig.mobile" :code="serviceConfig.code" @close="modal.service=false" v-if="serviceConfig && serviceConfig.status == 'open'"/>

		<bind-mobile-modal/>

		<userinfo-edit-modal @close="modal.userinfoEdit = false" @ok="getData()" :nickname="userInfo.nickname" :avatar="userInfo.avatar" :visible="modal.userinfoEdit" />

	</view>
</template>

<script src="./js.vue">

</script>

<style>
@import "./css.css";
</style>
